import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

export async function PATCH(req: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { project: { select: { organizationId: true, visibility: true } } },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== existing.project.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { title, description, status, priority, dueDate, assigneeId } = await req.json()

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId,
    },
  })

  return NextResponse.json(task)
}


