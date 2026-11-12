import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const invitations = await prisma.teamMember.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING"
      },
      include: {
        team: {
          select: { id: true, name: true, purpose: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    return NextResponse.json({ error: "Intelligence failure" }, { status: 500 })
  }
}
