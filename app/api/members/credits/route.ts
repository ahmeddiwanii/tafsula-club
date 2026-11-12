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

    // Only HR can view member credits
    if (user.role !== "HR") {
      return NextResponse.json(
        { error: "Only HR can view member credits" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const teamId = searchParams.get("teamId");

    let whereClause: any = {
      organizationId: user.organizationId,
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const credits = await prisma.memberCredit.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { totalCredits: "desc" },
    });

    // If teamId provided, filter by team members
    if (teamId) {
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId },
      });

      const memberIds = teamMembers.map((m: any) => m.userId);

      return NextResponse.json(
        {
          credits: credits.filter((c: any) => memberIds.includes(c.userId)),
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ credits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching member credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch member credits" },
      { status: 500 }
    );
  }
}
