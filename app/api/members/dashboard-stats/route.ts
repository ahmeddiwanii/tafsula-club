import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's DISC result
    const discResult = await prisma.result.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    // Fetch upcoming events for the member
    const upcomingEvents = await prisma.event.findMany({
      where: {
        organizationId: session.user.organizationId || undefined,
        startAt: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        format: true,
        description: true,
      },
      orderBy: { startAt: "asc" },
      take: 5,
    })

    // Fetch proposals for this member
    const proposals = await prisma.proposal.findMany({
      where: { submittedById: session.user.id },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    })

    const approvedProposals = proposals.filter((p) => p.status === "approved").length
    const pendingProposals = proposals.filter((p) => p.status === "submitted").length

    // Fetch team info
    const team = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: session.user.id },
        },
      },
      include: {
        members: {
          select: { userId: true },
        },
      },
    })

    const teamSize = team.reduce((acc, t) => acc + t.members.length, 0)

    // Fetch recent posts
    const recentPosts = await prisma.organizationPost.findMany({
      where: {
        organizationId: session.user.organizationId || undefined,
        status: "published",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        authorId: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return NextResponse.json({
      testsCompleted: !!discResult,
      disc: discResult
        ? {
            dominantType: discResult.dominantType,
            dScore: discResult.dScore,
            iScore: discResult.iScore,
            sScore: discResult.sScore,
            cScore: discResult.cScore,
          }
        : null,
      upcomingEvents,
      approvedProposals,
      pendingProposals,
      teamSize,
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: "Organization",
        comments: 0,
        likes: 0,
        createdAt: post.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
