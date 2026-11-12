import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/db"
import type { NextRequest } from "next/server"
import QRCode from "qrcode"
import { v4 as uuidv4 } from "uuid"
import { eventCheckInUrl } from "@/lib/app-url"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get("organizationId")
    const status = searchParams.get("status")
    const includeAll = searchParams.get("includeAll") === "true"
    const limit = parseInt(searchParams.get("limit") || "20")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const where: any = {}

    if (organizationId) where.organizationId = organizationId
    if (status) where.status = status

    // HR/SUPERADMIN with includeAll=true: show all events for their org
    if (includeAll && session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, organizationId: true },
      })

      if ((user?.role === "HR" || user?.role === "SUPERADMIN") && user?.organizationId) {
        // Bypass visibility filter – show everything in their organization
        where.organizationId = user.organizationId
      } else {
        // Non-HR users still get visibility filtering
        where.OR = [
          { visibility: "PUBLIC" },
          { visibility: "ORG_ONLY", organizationId: session.user.organizationId },
          { visibility: "MEMBERS_ONLY", organizationId: session.user.organizationId },
          {
            visibility: "PRIVATE",
            approvalRequests: {
              some: { userId: session.user.id, status: "APPROVED" },
            },
          },
        ]
      }
    } else if (session?.user?.id) {
      // Regular visibility filtering
      where.OR = [
        { visibility: "PUBLIC" },
        { visibility: "ORG_ONLY", organizationId: session.user.organizationId },
        {
          visibility: "MEMBERS_ONLY",
          organizationId: session.user.organizationId,
        },
        {
          visibility: "PRIVATE",
          approvalRequests: {
            some: {
              userId: session.user.id,
              status: "APPROVED",
            },
          },
        },
      ]
    } else {
      where.visibility = "PUBLIC"
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { registrations: true, attendances: true },
          },
        },
        orderBy: { startAt: "asc" },
        take: limit,
        skip,
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== "HR") {
      return NextResponse.json(
        { error: "Only HR can create events" },
        { status: 403 }
      )
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "User not assigned to a organization" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      type,
      format,
      price,
      currency,
      visibility,
      maxParticipants,
      startAt,
      endAt,
      location,
      venue,
      skillsJson,
      tags,
      category,
      relatedTeamId,
      relatedProjectId,
    } = body

    if (!title || !startAt) {
      return NextResponse.json(
        { error: "Title and startAt are required" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        organizationId: user.organizationId,
        title,
        description,
        type: type || "GENERAL",
        format: format || "IN_PERSON",
        price: price || 0,
        currency: currency || "USD",
        visibility: visibility || "ORG_ONLY",
        maxParticipants: maxParticipants || null,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        location,
        venue,
        skillsJson,
        tags,
        category,
        relatedTeamId,
        relatedProjectId,
        createdById: session.user.id,
        status: "UPCOMING",
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
            select: { registrations: true, attendances: true },
        },
      },
    })

    // Generate QR code (deep link) for event check-in
    try {
      const qrCodeData = uuidv4()
      const checkInUrl = eventCheckInUrl(event.id, qrCodeData)
      const qrCodeUrl = await QRCode.toDataURL(checkInUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      await prisma.event.update({
        where: { id: event.id },
        data: {
          qrCodeUrl,
          qrCodeData,
        },
      })

      await prisma.eventQRCode.create({
        data: {
          eventId: event.id,
          code: qrCodeData,
          qrImageUrl: qrCodeUrl,
          qrData: checkInUrl,
        },
      })

      return NextResponse.json({
        ...event,
        qrCodeUrl,
        qrCodeData,
        checkInUrl,
      }, { status: 201 })
    } catch (qrError) {
      console.error("Error generating QR code:", qrError)
      return NextResponse.json(event, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


