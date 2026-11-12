import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const taskStatus = searchParams.get("taskStatus")
    const priority = searchParams.get("priority")
    const limit = parseInt(searchParams.get("limit") || "50")

    let where: any = {
      OR: [
        { assigneeId: session.user.id },
        { createdById: session.user.id },
      ],
    }

    if (status) {
      where.status = status
    }

    if (taskStatus) {
      where.taskStatus = taskStatus
    }

    if (priority) {
      where.priority = priority
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
      take: limit,
    })

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      status = "OPEN",
      priority = "MEDIUM",
      dueDate,
      projectId,
      assignedToId,
    } = body

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and Project ID are required" },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: String(title),
        description: description ? String(description) : undefined,
        status: String(status),
        priority: String(priority),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId: String(projectId),
        assigneeId: assignedToId ? String(assignedToId) : undefined,
        createdById: session.user.id,
      } as any,
      include: {
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is HR or SUPERADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "HR" && user?.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Only HR can update task status" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { taskId, taskStatus, status, priority } = body

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      )
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (taskStatus) updateData.taskStatus = taskStatus
    if (status) updateData.status = status
    if (priority) updateData.priority = priority

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error: any) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}
