import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
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
