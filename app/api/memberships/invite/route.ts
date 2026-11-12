import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { randomBytes } from "crypto"
import { authOptions, UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getAppUrl } from "@/lib/app-url"

/** HR creates a shareable invite link. Recipient still needs club approval. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== UserRole.HR && session.user.role !== UserRole.SUPERADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({} as { organizationId?: string; note?: string }))
  const orgId =
    session.user.role === UserRole.HR ? session.user.organizationId : body.organizationId

  if (!orgId) return NextResponse.json({ error: "organizationId required" }, { status: 400 })

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, modulesJson: true },
  })
  if (!org) return NextResponse.json({ error: "Club not found" }, { status: 404 })

  // token embeds org id for O(1) lookup: orgId_random
  const token = `${orgId}_${randomBytes(16).toString("hex")}`
  const current = (org.modulesJson && typeof org.modulesJson === "object" ? org.modulesJson : {}) as Record<
    string,
    unknown
  >
  const invites = Array.isArray(current.inviteLinks) ? [...(current.inviteLinks as any[])] : []
  invites.push({
    token,
    createdById: session.user.id,
    createdAt: new Date().toISOString(),
    note: body.note || null,
    uses: 0,
    active: true,
  })

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      modulesJson: { ...current, inviteLinks: invites },
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    token,
    url: `${getAppUrl()}/invite/${token}`,
    organizationName: org.name,
  })
}
