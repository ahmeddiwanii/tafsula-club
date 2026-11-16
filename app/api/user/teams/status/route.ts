import { getAuthSession } from "@/lib/request-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) return NextResponse.json({ hasActiveTeams: false })

    const userId = session.user.id

    const activeTeamCount = await prisma.teamMember.count({
      where: {
        userId,
        status: "ACCEPTED",
        team: {
            status: "active"
        }
      }
    })

    return NextResponse.json({ hasActiveTeams: activeTeamCount > 0 })
  } catch (error) {
    console.error("User team status error:", error)
    return NextResponse.json({ hasActiveTeams: false })
  }
}
