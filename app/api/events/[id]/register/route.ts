import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST - Register for an event
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please login to register" }, { status: 401 })
    }

    // Get the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { registrations: true } },
        organization: { select: { name: true } },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: session.user.id } },
    })

    if (existing) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 })
    }

    // Check max participants
    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    // Check if event is cancelled
    if (event.status === "CANCELLED") {
      return NextResponse.json({ error: "Event has been cancelled" }, { status: 400 })
    }

    // Determine initial status
    const status = event.isApprovalRequired ? "REGISTERED" : "APPROVED"

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: session.user.id,
        status,
      },
    })

    // If approval required, create approval request
    if (event.isApprovalRequired) {
      await prisma.eventApprovalRequest.create({
        data: {
          eventId,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({
      registration,
      message: event.isApprovalRequired
        ? "Registration submitted. Awaiting approval."
        : "Successfully registered for the event!",
    })
  } catch (error) {
    console.error("Error registering for event:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}

// DELETE - Cancel registration
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: session.user.id } },
    })

    if (!registration) {
      return NextResponse.json({ error: "Not registered for this event" }, { status: 404 })
    }

    await prisma.eventRegistration.delete({
      where: { id: registration.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling registration:", error)
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 })
  }
}

// GET - Check registration status
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ registered: false })
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId: session.user.id } },
    })

    return NextResponse.json({
      registered: !!registration,
      status: registration?.status || null,
    })
  } catch (error) {
    return NextResponse.json({ registered: false })
  }
}
