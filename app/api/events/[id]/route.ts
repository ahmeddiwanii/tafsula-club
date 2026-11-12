import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import type { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        organization: {
          select: {
            id: true,
            name: true,
            organizationProfile: {
              select: { profileImageUrl: true },
            },
          },
        },
        directors: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarId: true }
            }
          }
        },
        teams: {
          include: {
            _count: {
              select: { members: true, tasks: true }
            },
            members: {
               include: { user: { select: { name: true, avatarId: true } } }
            },
            directors: {
               include: { user: { select: { name: true, avatarId: true } } }
            }
          }
        },
        registrations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarId: true }
            }
          }
        },
        attendances: {
          select: {
            id: true,
            userId: true,
            status: true,
            checkInTime: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            attendances: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check visibility permissions
    if (event.visibility === "PUBLIC") {
      return NextResponse.json(event)
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (event.visibility === "ORG_ONLY" || event.visibility === "MEMBERS_ONLY") {
      if (session.user.organizationId !== event.organizationId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }
    }

    if (event.visibility === "PRIVATE") {
      const approvedAccess = await prisma.eventApprovalRequest.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id,
          },
        },
      })

      if (!approvedAccess || approvedAccess.status !== "APPROVED") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, organizationId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check authorization: only creator or HR from same organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, organizationId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isCreator = event.createdById === session.user.id
    const isHRInSameOrg = (user.role === "HR" || user.role === "SUPERADMIN") && user.organizationId === event.organizationId

    if (!isCreator && !isHRInSameOrg) {
      return NextResponse.json(
        { error: "Only event creator or org HR can modify" },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    // Whitelist updatable fields only
    const allowedFields = [
      'title', 'description', 'type', 'format', 'price', 'currency',
      'visibility', 'isApprovalRequired', 'maxParticipants', 'status',
      'startAt', 'endAt', 'location', 'venue', 'qrCodeUrl', 'qrCodeData',
      'posterUrl', 'galleryImagesJson', 'summary', 'skillsJson', 'tags', 'category'
    ]
    
    const updateData: any = {}
    allowedFields.forEach(field => {
      if (field in body) {
        updateData[field] = body[field]
      }
    })
    
    // Handle date conversions
    if (body.startAt) {
      updateData.startAt = new Date(body.startAt)
    }
    if (body.endAt) {
      updateData.endAt = new Date(body.endAt)
    }
    
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            registrations: true,
            attendances: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, organizationId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check authorization: only creator
    if (event.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Only event creator can delete" },
        { status: 403 }
      )
    }

    // Delete cascades are handled by database
    await prisma.event.delete({
      where: { id: eventId },
    })

    return NextResponse.json({ success: true, message: "Event deleted" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


