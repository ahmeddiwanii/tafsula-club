import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"
import type { NextRequest } from "next/server"
import QRCode from "qrcode"
import { v4 as uuidv4 } from "uuid"
import { eventCheckInUrl } from "@/lib/app-url"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, organizationId: true, qrCodeUrl: true, qrCodeData: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true },
    })

    const isCreator = event.createdById === session.user.id
    const isHRInOrg = user?.role === "HR" && user?.organizationId === event.organizationId

    if (!isCreator && !isHRInOrg) {
      return NextResponse.json(
        { error: "Only event creator or org HR can view QR code" },
        { status: 403 },
      )
    }

    if (!event.qrCodeUrl) {
      return NextResponse.json({ error: "QR code not generated yet" }, { status: 404 })
    }

    return NextResponse.json({
      qrCodeUrl: event.qrCodeUrl,
      qrCodeData: event.qrCodeData,
      checkInUrl: event.qrCodeData ? eventCheckInUrl(eventId, event.qrCodeData) : null,
    })
  } catch (error) {
    console.error("Error fetching QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, organizationId: true, qrCodeUrl: true, qrCodeData: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true },
    })

    const isCreator = event.createdById === session.user.id
    const isHRInOrg = user?.role === "HR" && user?.organizationId === event.organizationId

    if (!isCreator && !isHRInOrg) {
      return NextResponse.json(
        { error: "Only event creator or org HR can generate QR code" },
        { status: 403 },
      )
    }

    // Regenerate allowed so old opaque codes become deep links
    const code = event.qrCodeData || uuidv4()
    const checkInUrl = eventCheckInUrl(eventId, code)

    const qrCodeUrl = await QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    })

    await prisma.event.update({
      where: { id: eventId },
      data: { qrCodeUrl, qrCodeData: code },
    })

    await prisma.eventQRCode.upsert({
      where: { code },
      create: {
        eventId,
        code,
        qrImageUrl: qrCodeUrl,
        qrData: checkInUrl,
      },
      update: {
        qrImageUrl: qrCodeUrl,
        qrData: checkInUrl,
      },
    })

    return NextResponse.json(
      {
        qrCodeUrl,
        qrCodeData: code,
        checkInUrl,
        message: "QR code ready — attendees scan to check in",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
