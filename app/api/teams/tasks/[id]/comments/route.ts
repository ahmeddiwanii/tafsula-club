import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all comments for a specific task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const comments = await prisma.teamTaskComment.findMany({
      where: { taskId: id },
      include: {
        user: { select: { id: true, name: true, role: true, avatarId: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Verify task exists
    const task = await prisma.teamTask.findUnique({
      where: { id },
      include: {
        assignments: true,
        team: true
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check authorization: Must be HR in same organization, OR a member assigned to the task, OR team leader
    let isAuthorized = false;
    
    if (user.role === "HR" && user.organizationId === task.team.organizationId) {
      isAuthorized = true;
    } else if (task.assignments.some(a => a.userId === user.id)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized to comment on this task" }, { status: 403 });
    }

    const comment = await prisma.teamTaskComment.create({
      data: {
        taskId: id,
        userId: user.id,
        content: content.trim()
      },
      include: {
        user: { select: { id: true, name: true, role: true, avatarId: true } }
      }
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
