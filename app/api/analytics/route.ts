import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organizationId = session.user.organizationId || ""

    // Get date range from query
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Event engagement
    const eventStats = await prisma.eventRegistration.findMany({
      where: {
        event: { organizationId },
      },
    })

    const attendedCount = eventStats.filter((e) => e.status === "attended").length

    // Proposal metrics
    const proposalStats = await prisma.proposal.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
    })

    const approvedCount = proposalStats.filter((p) => p.status === "approved").length
    const rejectedCount = proposalStats.filter((p) => p.status === "rejected").length

    // Team creation trend
    const teamStats = await prisma.team.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
    })

    return NextResponse.json({
      period: { days, startDate, endDate: new Date() },
      metrics: {
        activeMembers: 0,
        eventRegistrations: eventStats.length,
        eventAttendance: attendedCount,
        proposalsSubmitted: proposalStats.length,
        proposalsApproved: approvedCount,
        proposalsRejected: rejectedCount,
        teamsCreated: teamStats.length,
        trainingRecommendations: 0,
        trainingCompleted: 0,
      },
    })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
