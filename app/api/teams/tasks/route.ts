import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== "HR") {
      return NextResponse.json(
        { error: "Only HR can create tasks" },
        { status: 403 }
      );
    }

    const { teamId, title, description, priority, dueDate, assignedUserIds, hrDocumentName, hrDocumentUrl } = await req.json();

    if (!teamId || !title) {
      return NextResponse.json(
        { error: "Team ID and title are required" },
        { status: 400 }
      );
    }

    // Verify team exists and belongs to user's organization
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { organization: true, members: { include: { user: true } } },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.organization.id !== user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized: team not in your organization" },
        { status: 403 }
      );
    }

    // Create the task
    const task = await prisma.teamTask.create({
      data: {
        teamId,
        title,
        description,
        priority: priority?.toUpperCase() || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: user.id,
        hrDocumentName,
        hrDocumentUrl
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Handle assignments
    let assignments = [];
    const { dispatchNotification } = await import("@/lib/notifications")
    
    if (assignedUserIds && Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
      // Assign only to specified users (must be members)
      const targetUserIds = assignedUserIds.filter(uid => team.members.some(m => m.userId === uid));
      assignments = await Promise.all(
        targetUserIds.map(async (uid) => {
          const assignment = await prisma.teamTaskAssignment.create({
            data: {
              taskId: task.id,
              teamMemberId: team.members.find(m => m.userId === uid)!.id,
              userId: uid,
              status: "ASSIGNED",
              acceptanceStatus: "PENDING"
            },
          })
          
          await dispatchNotification({
            userId: uid,
            type: "TASK_ASSIGNED",
            title: "Priority Mission Deployment",
            message: `Objective Received: ${task.title}. Report to dashboard for briefing.`,
            actionUrl: `/dashboard/hr/tasks/${task.id}`
          })
          
          return assignment
        })
      );
    } else {
      // Auto-assign to all team members
      assignments = await Promise.all(
        team.members.map(async (member: any) => {
          const assignment = await prisma.teamTaskAssignment.create({
            data: {
              taskId: task.id,
              teamMemberId: member.id,
              userId: member.userId,
              status: "ASSIGNED",
              acceptanceStatus: "PENDING"
            },
          })
          
          await dispatchNotification({
            userId: member.userId,
            type: "TASK_ASSIGNED",
            title: "Priority Mission Deployment",
            message: `Objective Received: ${task.title}. Report to dashboard for briefing.`,
            actionUrl: `/dashboard/hr/tasks/${task.id}`
          })
          
          return assignment
        })
      );
    }

    return NextResponse.json(
      { success: true, task, assignments },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");

    let whereClause: any = {
      team: {
        organization: { id: user.organizationId },
      },
    };

    if (teamId) {
      whereClause.teamId = teamId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const tasks = await prisma.teamTask.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
