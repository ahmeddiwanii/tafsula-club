import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      team: true,
      tasks: true,
    },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== project.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    if (project.visibility === "HR_ONLY" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.json(project)
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const existing = await prisma.project.findUnique({ where: { id }, select: { organizationId: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== existing.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, type, status, visibility, teamId, timelineStart, timelineEnd, objectivesJson } = body

  const project = await prisma.project.update({
    where: { id },
    data: {
      title,
      description,
      type,
      status,
      visibility,
      teamId,
      timelineStart: timelineStart ? new Date(timelineStart) : undefined,
      timelineEnd: timelineEnd ? new Date(timelineEnd) : undefined,
      objectivesJson,
    },
  })
  return NextResponse.json(project)
}


