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

    // Check if user is HR/SUPERADMIN and owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizationId: true,
        title: true,
        startAt: true,
        createdById: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Verify user is HR/SUPERADMIN in the same organization, or is the event creator
    const userOrganization = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    const isCreator = event.createdById === session.user.id
    const isOrgAdmin = (userOrganization?.role === "HR" || userOrganization?.role === "SUPERADMIN") && userOrganization?.organizationId === event.organizationId

    if (!isCreator && !isOrgAdmin) {
      return NextResponse.json(
        { error: "Not authorized to view registrations" },
        { status: 403 }
      )
    }

    // Fetch all registrations for the event
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: { headline: true },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { appliedAt: "desc" },
      ],
    })

    return NextResponse.json({
      event,
      registrations,
      stats: {
        total: registrations.length,
        approved: registrations.filter(r => r.status === "APPROVED").length,
        pending: registrations.filter(r => r.status === "REGISTERED").length,
        rejected: registrations.filter(r => r.status === "REJECTED").length,
        cancelled: registrations.filter(r => r.status === "CANCELLED").length,
      },
    })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
