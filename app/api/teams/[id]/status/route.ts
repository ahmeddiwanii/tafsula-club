import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { id: teamId } = await context.params
    const { status } = await req.json()
    const userId = session.user.id

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        directors: true,
        event: {
            include: { directors: true }
        },
        members: true
      }
    })

    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 })

    // Check permissions
    const isSuperAdmin = session.user.role === UserRole.SUPERADMIN || session.user.role === UserRole.HR
    const isCreator = team.createdById === userId
    const isTeamDirector = team.directors.some((d) => d.userId === userId)
    const isEventDirector = team.event?.directors.some((d) => d.userId === userId)
    const isTeamLeader = team.members.some((m) => m.userId === userId && m.roleInTeam === "LEADER")

    if (!isSuperAdmin && !isCreator && !isTeamDirector && !isEventDirector && !isTeamLeader) {
        return NextResponse.json({ error: "Unauthorized. Must be a director or leader." }, { status: 403 })
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: { status }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Team status update error:", error)
    return NextResponse.json({ error: "Failed to update team status" }, { status: 500 })
  }
}
