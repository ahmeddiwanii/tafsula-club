import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"
import type { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = await params

    // Fetch event with feedbacks relation
    const event = await (prisma as any).event.findUnique({
      where: { id: eventId },
      include: {
        feedbacks: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" as const },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const formattedFeedbacks = event.feedbacks.map((feedback: any) => ({
      id: feedback.id,
      userId: feedback.userId,
      userName: feedback.user.name,
      userEmail: feedback.user.email,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
    }))

    return NextResponse.json(formattedFeedbacks)
  } catch (error) {
    console.error("Error fetching feedbacks:", error)
    // Return empty array on error instead of error
    return NextResponse.json([])
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
    const { id: eventId } = await params
    const body = await req.json()
    const { rating, comment } = body

    const feedback = await (prisma as any).eventFeedback.create({
      data: {
        eventId,
        userId: session.user.id,
        rating: rating || 0,
        comment: comment || "",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error("Error creating feedback:", error)
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
    const body = await req.json()
    const { feedbackId } = body

    const feedback = await (prisma as any).eventFeedback.findUnique({
      where: { id: feedbackId },
    })

    if (!feedback || feedback.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await (prisma as any).eventFeedback.delete({
      where: { id: feedbackId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
