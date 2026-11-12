import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getMemberStatus } from "@/lib/member-status-db"

function isProfileComplete(profile: any) {
  if (!profile) return false
  const required = ["headline", "bio", "location", "roleTitle"] as const
  return required.every((k) => typeof profile[k] === "string" && profile[k].trim().length > 0)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        organizationId: true,
        organization: { select: { name: true } },
        profile: { select: { headline: true, bio: true, location: true, roleTitle: true } },
        result: { select: { id: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
    })

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const memberStatus = await getMemberStatus(session.user.id)

    return NextResponse.json({
      memberStatus,
      organizationId: user.organizationId,
      organizationName: user.organization?.name ?? null,
      testCompleted: user.result.length > 0,
      profileCompleted: isProfileComplete(user.profile),
    })
  } catch (error) {
    console.error("[ONBOARDING_STATUS] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
