import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { dispatchNotification } from "@/lib/notifications"
import type { NextRequest } from "next/server"

/**
 * Handle Member Event/Team Registration Requests
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: eventId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { preferredTeamId, message } = await req.json()

    // 1. Fetch Event and Directors for notification
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        directors: { select: { userId: true } },
        createdBy: { select: { id: true } }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Mission Intel Missing" }, { status: 404 })
    }

    // 2. Create or Update Registration
    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id
        }
      },
      update: {
        preferredTeamId,
        status: "REGISTERED" // Reset status if they were cancelled/rejected? Or keep it?
      },
      create: {
        eventId,
        userId: session.user.id,
        preferredTeamId,
        status: "REGISTERED"
      }
    })

    // 3. Notify Command Staff (Directors & Creator)
    const staffToNotify = new Set([
        event.createdById,
        ...event.directors.map(d => d.userId)
    ])

    const notificationPromises = Array.from(staffToNotify).map(staffId => 
      dispatchNotification({
        userId: staffId,
        type: "TEAM_JOINED", // Reusing or could add NEW_REGISTRATION
        title: "Inbound Asset Signal",
        message: `${session.user.name} has requested deployment for mission: ${event.title}. ${preferredTeamId ? "Squad preference indicated." : ""}`,
        actionUrl: `/dashboard/hr/events/${eventId}`
      })
    )

    await Promise.all(notificationPromises)

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error("[REQUEST_FAILURE] Signal jammed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
