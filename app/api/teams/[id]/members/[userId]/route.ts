import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../../lib/auth"
import { prisma } from "../../../../../../lib/db"

export async function DELETE(_: Request, context: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await context.params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const role = session.user.role
  const isSelfLeave = session.user.id === userId
  const isStaff = role === "SUPERADMIN" || role === "HR"

  // Members may leave their own team. Only bureau / admin can remove someone else.
  if (!isSelfLeave && !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const team = await prisma.team.findUnique({
    where: { id },
    select: { organizationId: true },
  })
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (isStaff && role !== "SUPERADMIN" && session.user.organizationId !== team.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Self-leave: must actually be on this team (and same org)
  if (isSelfLeave && !isStaff) {
    if (!session.user.organizationId || session.user.organizationId !== team.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId } },
  })
  if (!membership) {
    return NextResponse.json({ error: "You are not on this team" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { teamId: id, userId } }),
    // Drop team-lead role if they had one
    prisma.teamDirector.deleteMany({ where: { teamId: id, userId } }),
  ])

  return NextResponse.json({ success: true })
}
