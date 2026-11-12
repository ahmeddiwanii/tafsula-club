import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/directors
 * Get all directors across all projects, events, and teams for the organization
 * Query params:
 *   - type: "project" | "event" | "team" (optional, filter by type)
 *   - userId: string (optional, filter by user)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const organizationId = session.user.organizationId || ""
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // "project", "event", "team"
    const userId = searchParams.get("userId")

    interface DirectorInfo {
      id?: string
      type: string
      resourceId: string
      resourceName: string
      director: any
      role: string
      assignedAt: string
    }

    const directors: DirectorInfo[] = []

    // Get project directors
    if (!type || type === "project") {
      const projectDirectors = await prisma.projectDirector.findMany({
        where: {
          project: { organizationId },
          ...(userId && { userId }),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      directors.push(
        ...projectDirectors.map((pd) => ({
          id: pd.id,
          type: "project",
          resourceId: pd.projectId,
          resourceName: pd.project.title,
          director: pd.user,
          role: pd.role,
          assignedAt: pd.createdAt.toISOString(),
        }))
      )
    }

    // Get event directors
    if (!type || type === "event") {
      const eventDirectors = await prisma.eventDirector.findMany({
        where: {
          event: { organizationId },
          ...(userId && { userId }),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          event: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      directors.push(
        ...eventDirectors.map((ed) => ({
          id: ed.id,
          type: "event",
          resourceId: ed.eventId,
          resourceName: ed.event.title,
          director: ed.user,
          role: ed.role,
          assignedAt: ed.createdAt.toISOString(),
        }))
      )
    }

    // Get team directors
    if (!type || type === "team") {
      const teamDirectors = await prisma.teamDirector.findMany({
        where: {
          team: { organizationId },
          ...(userId && { userId }),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          team: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      directors.push(
        ...teamDirectors.map((td) => ({
          id: td.id,
          type: "team",
          resourceId: td.teamId,
          resourceName: td.team.name,
          director: td.user,
          role: td.role,
          assignedAt: td.createdAt.toISOString(),
        }))
      )
    }

    return NextResponse.json({ directors, total: directors.length })
  } catch (error: any) {
    console.error("Error fetching directors:", error)
    return NextResponse.json(
      { error: "Failed to fetch directors" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/directors
 * Bulk assign multiple directors to a resource
 * Body:
 *   - type: "project" | "event" | "team"
 *   - resourceId: string
 *   - userIds: string[]
 *   - role: string (optional, default "DIRECTOR")
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, resourceId, userIds, role = "DIRECTOR" } = body

    if (!type || !resourceId || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "Type, resourceId, and userIds array are required" },
        { status: 400 }
      )
    }

    const assignedDirectors = []
    const errors = []

    for (const userId of userIds) {
      try {
        if (type === "project") {
          const existing = await prisma.projectDirector.findUnique({
            where: {
              projectId_userId: { projectId: resourceId, userId },
            },
          })

          if (!existing) {
            const director = await prisma.projectDirector.create({
              data: { projectId: resourceId, userId, role },
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            })
            assignedDirectors.push(director)
          }
        } else if (type === "event") {
          const existing = await prisma.eventDirector.findUnique({
            where: {
              eventId_userId: { eventId: resourceId, userId },
            },
          })

          if (!existing) {
            const director = await prisma.eventDirector.create({
              data: { eventId: resourceId, userId, role },
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            })
            assignedDirectors.push(director)
          }
        } else if (type === "team") {
          const existing = await prisma.teamDirector.findUnique({
            where: {
              teamId_userId: { teamId: resourceId, userId },
            },
          })

          if (!existing) {
            const director = await prisma.teamDirector.create({
              data: { teamId: resourceId, userId, role },
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            })
            assignedDirectors.push(director)
          }
        }
      } catch (error: any) {
        errors.push({ userId, error: error.message })
      }
    }

    return NextResponse.json(
      {
        assigned: assignedDirectors,
        errors: errors.length > 0 ? errors : undefined,
        total: assignedDirectors.length,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error assigning directors:", error)
    return NextResponse.json(
      { error: "Failed to assign directors" },
      { status: 500 }
    )
  }
}
