import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const project = await prisma.project.findUnique({ where: { id }, select: { organizationId: true } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== project.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { title, description, status, priority, dueDate, assigneeId } = await req.json()

  const task = await prisma.task.create({
    data: {
      projectId: id,
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(task, { status: 201 })
}


