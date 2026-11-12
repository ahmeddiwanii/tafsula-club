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
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } })
  
  if (!team || !user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== team.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  if (team.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "User not in same organization" }, { status: 400 })
  }

  const director = await prisma.teamDirector.upsert({
    where: { teamId_userId: { teamId: id, userId } },
    update: {},
    create: { teamId: id, userId },
  })

  return NextResponse.json(director, { status: 201 })
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await context.params
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== team.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  await prisma.teamDirector.delete({
    where: { teamId_userId: { teamId: id, userId } },
  })

  return NextResponse.json({ success: true })
}
