import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

/** List clubs the signed-in user belongs to (any status). */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberships = await prisma.organizationMembership.findMany({
    where: { userId: session.user.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          organizationProfile: { select: { profileImageUrl: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const activeOrgId = session.user.organizationId

  return NextResponse.json({
    activeOrganizationId: activeOrgId,
    memberships: memberships.map((m) => ({
      id: m.id,
      organizationId: m.organizationId,
      name: m.organization.name,
      logoUrl: m.organization.organizationProfile?.profileImageUrl ?? null,
      role: m.role,
      status: m.status,
      isActive: m.organizationId === activeOrgId,
      createdAt: m.createdAt,
    })),
  })
}
