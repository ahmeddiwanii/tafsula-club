import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - User's event history (registered, attended, etc.)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const [registrations, attendances, feedbacks] = await Promise.all([
            prisma.eventRegistration.findMany({
                where: { userId: session.user.id },
                include: {
                    event: {
                        select: {
                            id: true, title: true, type: true, format: true, status: true,
                            startAt: true, endAt: true, location: true, posterUrl: true,
                            organization: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { appliedAt: "desc" },
            }),
            prisma.eventAttendance.findMany({
                where: { userId: session.user.id },
                include: {
                    event: {
                        select: { id: true, title: true, startAt: true },
                    },
                },
            }),
            prisma.eventFeedback.findMany({
                where: { userId: session.user.id },
                select: { eventId: true, rating: true },
            }),
        ])

        return NextResponse.json({
            registrations,
            attendedCount: attendances.filter(a => a.status === "ATTENDED").length,
            feedbackGiven: feedbacks.length,
            totalRegistered: registrations.length,
        })
    } catch (error) {
        console.error("Error fetching user events:", error)
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
}
