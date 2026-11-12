import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { activateMembership } from "@/lib/membership"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { organizationId } = await req.json()
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 })
  }

  const membership = await prisma.organizationMembership.findUnique({
    where: {
      userId_organizationId: { userId: session.user.id, organizationId },
    },
  })

  if (!membership) {
    return NextResponse.json({ error: "You are not part of this club" }, { status: 404 })
  }

  if (membership.status === "REJECTED") {
    return NextResponse.json({ error: "This club declined your request" }, { status: 403 })
  }

  await activateMembership(session.user.id, organizationId)

  const redirectTo =
    membership.status === "AWAITING_HR"
      ? "/dashboard/member/waiting"
      : "/dashboard/member/home"

  return NextResponse.json({
    success: true,
    organizationId,
    status: membership.status,
    redirectTo,
  })
}
