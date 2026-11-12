import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET assignment details
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

    const assignment = await prisma.teamTaskAssignment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: {
          include: {
            team: {
              include: {
                event: true,
                project: true,
              },
            },
            createdBy: { select: { id: true, name: true } },
          },
        },
        approver: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ assignment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT to update assignment status (submit or mark as done)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { action, status, comment, memberDocumentName, memberDocumentUrl } = await req.json();

    const assignment = await prisma.teamTaskAssignment.findUnique({
      where: { id },
      include: { task: { include: { team: true } } },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      assignment.userId !== user.id &&
      user.role !== "HR"
    ) {
      return NextResponse.json(
        { error: "Unauthorized: can only update own assignments or approve as HR" },
        { status: 403 }
      );
    }

    // Member submitting work for review
    if (action === "submit" && assignment.userId === user.id) {
      const updated = await prisma.teamTaskAssignment.update({
        where: { id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          ...(memberDocumentName && { memberDocumentName }),
          ...(memberDocumentUrl && { memberDocumentUrl }),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { select: { title: true } },
        },
      });

      return NextResponse.json(
        { success: true, assignment: updated },
        { status: 200 }
      );
    }

    // HR approving or rejecting work
    if (
      action === "approve" ||
      action === "reject" ||
      action === "review"
    ) {
      if (user.role !== "HR") {
        return NextResponse.json(
          { error: "Only HR can approve/reject tasks" },
          { status: 403 }
        );
      }

      // Verify HR is from same organization
      if (
        assignment.task.team.organizationId !== user.organizationId
      ) {
        return NextResponse.json(
          { error: "Unauthorized: team not in your organization" },
          { status: 403 }
        );
      }

      let creditsAwarded = 0;
      if (action === "approve") {
        const org = await prisma.organization.findUnique({
          where: { id: user.organizationId! },
          select: { modulesJson: true },
        });
        const { resolvePointsFormula } = await import("../../../../../../lib/points");
        creditsAwarded = resolvePointsFormula(org?.modulesJson).taskApproved;
      }

      const updated = await prisma.teamTaskAssignment.update({
        where: { id },
        data: {
          approvalStatus: action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "PENDING",
          approvedBy: user.id,
          approvalComment: comment,
          approvedAt: action === "approve" || action === "reject" ? new Date() : null,
          creditsAwarded: action === "approve" ? creditsAwarded : 0,
          status: action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "REVIEW",
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { select: { title: true } },
          approver: { select: { id: true, name: true } },
        },
      });

      // If approved, update member credits
      if (action === "approve") {
        // Dynamic import to avoid circular dependencies if any
        const { updateMemberCredits } = await import("../../../../../../lib/credits"); // Assuming this exists or I'll add it
        await updateMemberCredits(
          assignment.userId,
          user.organizationId!,
          creditsAwarded,
          `Task "${assignment.task.title}" approved`
        );
      }

      return NextResponse.json(
        { success: true, assignment: updated },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
