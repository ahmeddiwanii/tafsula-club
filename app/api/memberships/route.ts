import { getAuthSession } from "@/lib/request-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** List clubs the signed-in user belongs to (any status). */
export async function GET() {
  const session = await getAuthSession()
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
