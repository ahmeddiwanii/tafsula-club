import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { dispatchNotification } from "@/lib/notifications"
import type { NextRequest } from "next/server"

/**
 * Handle Asset Responses to Mission Objective Deployments (Tasks)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId, status } = await req.json()

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid Protocol" }, { status: 400 })
    }

    // Fetch Task Assignment Data
    const assignment = await prisma.teamTaskAssignment.findUnique({
      where: { id: assignmentId },
      include: { 
        task: { select: { title: true, createdById: true } },
        user: { select: { name: true } }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Security check
    if (assignment.userId !== session.user.id) {
      return NextResponse.json({ error: "Command Override Denied" }, { status: 403 })
    }

    await prisma.teamTaskAssignment.update({
      where: { id: assignmentId },
      data: { 
        acceptanceStatus: status,
        status: status === "ACCEPTED" ? "IN_PROGRESS" : "REJECTED" 
      }
    })

    // Notify Commander (Creator)
    await dispatchNotification({
      userId: assignment.task.createdById,
      type: status === "ACCEPTED" ? "TASK_ACCEPTED" : "REQUEST_REJECTED",
      title: `Mission Briefing Update`,
      message: `Asset ${assignment.user.name} has ${status.toLowerCase()} objective deployment: ${assignment.task.title}.`,
      actionUrl: `/dashboard/hr/tasks/${assignment.taskId}`
    })

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("[MISSION_FAIL] Objective update intercepted:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
