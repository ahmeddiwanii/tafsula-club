import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { prisma } from "../../../../../../lib/db"
import type { NextRequest } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; registrationId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId, registrationId } = await params
    const { status } = await req.json()

    // Validate status
    const validStatuses = ["APPROVED", "REJECTED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Check if user is HR and owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizationId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const userOrganization = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (userOrganization?.role !== "HR" || userOrganization?.organizationId !== event.organizationId) {
      return NextResponse.json(
        { error: "Not authorized to manage registrations" },
        { status: 403 }
      )
    }

    // Update registration
    const registration = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    console.log(`HR ${session.user.id} updated registration ${registrationId} status to ${status}`)

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; registrationId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId, registrationId } = await params

    // Check if user is HR and owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizationId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const userOrganization = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (userOrganization?.role !== "HR" || userOrganization?.organizationId !== event.organizationId) {
      return NextResponse.json(
        { error: "Not authorized to manage registrations" },
        { status: 403 }
      )
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: { id: registrationId },
    })

    console.log(`HR ${session.user.id} deleted registration ${registrationId}`)

    return NextResponse.json({
      success: true,
      message: "Registration removed successfully",
    })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
