import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await context.params
  const { userId, email, roleInTeam } = await req.json()

  let userToAssignId = userId

  if (email && !userToAssignId) {
    const foundUser = await prisma.user.findUnique({ where: { email }, select: { id: true, organizationId: true } })
    if (foundUser) {
      userToAssignId = foundUser.id
    } else {
      return NextResponse.json({ error: "User not found with this email" }, { status: 404 })
    }
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  const user = await prisma.user.findUnique({ where: { id: userToAssignId }, select: { organizationId: true } })
  if (!team || !user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== team.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }
  if (team.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "User not in same organization" }, { status: 400 })
  }

  const member = await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: id, userId: userToAssignId } },
    update: { roleInTeam }, // If updating, keep status or should we reset? Usually keep.
    create: { 
      teamId: id, 
      userId: userToAssignId, 
      roleInTeam,
      status: "PENDING" // Force acceptance flow
    },
  })

  // Notify the assigned member
  const teamWithName = await prisma.team.findUnique({ where: { id }, select: { name: true } })
  const { dispatchNotification } = await import("@/lib/notifications")
  await dispatchNotification({
    userId: userToAssignId,
    type: "TEAM_INVITATION",
    title: "New Squad Deployment Authorization",
    message: `You have been drafted into: ${teamWithName?.name}. Mission briefing requires your formal acceptance.`,
    actionUrl: `/dashboard/member` // Where they can accept
  })

  return NextResponse.json(member, { status: 201 })
}


