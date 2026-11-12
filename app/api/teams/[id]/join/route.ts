import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { id: teamId } = await context.params
    const userId = session.user.id

    const team = await prisma.team.findUnique({ where: { id: teamId } })
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 })

    // Check if member already exists
    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        }
      }
    })

    if (existing) {
      if (existing.status === "REJECTED") {
         return NextResponse.json({ error: "Previous request was rejected." }, { status: 400 })
      }
      return NextResponse.json({ error: "Already requested or joined" }, { status: 400 })
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        status: "PENDING",
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Team join error:", error)
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 })
  }
}
