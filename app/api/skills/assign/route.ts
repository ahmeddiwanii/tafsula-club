import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

function canEdit(session: any, userId: string, targetOrganizationId: string | null) {
  if (!session) return false
  if (session.user.id === userId) return true
  if (session.user.role === "SUPERADMIN") return true
  if (session.user.role === "HR" && session.user.organizationId && session.user.organizationId === targetOrganizationId) return true
  return false
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const { userId, skillId, level } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (!canEdit(session, userId, user.organizationId || null)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const assignment = await prisma.userSkill.upsert({
    where: { userId_skillId: { userId, skillId } },
    update: { level },
    create: { userId, skillId, level },
  })

  return NextResponse.json(assignment, { status: 201 })
}


