import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.HR || !session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const members = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId, role: "MEMBER" },
      select: {
        name: true,
        email: true,
        memberStatus: true,
        createdAt: true,
        profile: { select: { roleTitle: true, location: true } },
      },
      orderBy: { name: "asc" },
    })

    const header = "name,email,status,role_title,location,joined_at\n"
    const rows = members
      .map((m) => {
        const cells = [
          m.name,
          m.email,
          m.memberStatus,
          m.profile?.roleTitle ?? "",
          m.profile?.location ?? "",
          m.createdAt.toISOString(),
        ].map((c) => `"${String(c).replace(/"/g, '""')}"`)
        return cells.join(",")
      })
      .join("\n")

    return new NextResponse(header + rows, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="club-members.csv"',
      },
    })
  } catch (error) {
    console.error("[members-export]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
