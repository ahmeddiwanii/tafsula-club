import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
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
    const status = searchParams.get("status");

    let whereClause: any = {
      userId: user.id,
    };

    if (status) {
      const statuses = status.split(",");
      whereClause.status = { in: statuses };
    }

    const assignments = await prisma.teamTaskAssignment.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                eventId: true,
                projectId: true,
              },
            },
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
        approver: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching member tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
