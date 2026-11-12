import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"
import type { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params

    // Check if user is event creator or HR in same org
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, organizationId: true },
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
        { error: "Only event creator or org HR can view attendees" },
        { status: 403 }
      )
    }

    // Get all attendees
    const attendances = await prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { checkInTime: "asc" },
    })

    // Get registrants who haven't attended
    const registrants = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const attendedIds = new Set(attendances.map((a) => a.userId))
    const notAttended = registrants
      .filter((r) => !attendedIds.has(r.userId))
      .map((r) => ({
        ...r.user,
        registrationId: r.id,
        registeredAt: r.appliedAt,
      }))

    return NextResponse.json({
      attended: attendances,
      notAttended,
      summary: {
        totalRegistered: registrants.length,
        totalAttended: attendances.length,
        noShowRate: registrants.length > 0 
          ? ((registrants.length - attendances.length) / registrants.length * 100).toFixed(1)
          : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching attendees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { userId, status } = await req.json()
    const { id: eventId } = await params

    // Check if user is event creator or HR in same org
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, organizationId: true },
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
        { error: "Only event creator or org HR can mark attendance" },
        { status: 403 }
      )
    }

    // Check if user is registered
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "User not registered for this event" },
        { status: 400 }
      )
    }

    // Update or create attendance record
    const attendance = await prisma.eventAttendance.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {
        status: status || "ATTENDED",
        checkInTime: status === "ATTENDED" ? new Date() : undefined,
      },
      create: {
        eventId,
        userId,
        status: status || "ATTENDED",
        checkInTime: status === "ATTENDED" ? new Date() : new Date(),
        scannedAt: new Date(),
        scannerUserId: session.user.id,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


