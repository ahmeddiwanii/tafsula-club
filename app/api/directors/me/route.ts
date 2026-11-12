import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/directors/me
 * Get all directorship assignments for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get project directorships
    const projectDirectorships = await prisma.projectDirector.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            organizationId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get event directorships
    const eventDirectorships = await prisma.eventDirector.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            startAt: true,
            organizationId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get team directorships
    const teamDirectorships = await prisma.teamDirector.findMany({
      where: { userId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            purpose: true,
            status: true,
            organizationId: true,
            members: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      projects: projectDirectorships,
      events: eventDirectorships,
      teams: teamDirectorships,
      summary: {
        projectCount: projectDirectorships.length,
        eventCount: eventDirectorships.length,
        teamCount: teamDirectorships.length,
        totalDirectorships:
          projectDirectorships.length +
          eventDirectorships.length +
          teamDirectorships.length,
      },
    })
  } catch (error: any) {
    console.error("Error fetching user directorships:", error)
    return NextResponse.json(
      { error: "Failed to fetch directorships" },
      { status: 500 }
    )
  }
}
