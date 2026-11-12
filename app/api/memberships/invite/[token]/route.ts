import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { upsertJoinRequest } from "@/lib/membership"
import { dispatchNotification } from "@/lib/notifications"

async function findInvite(token: string) {
  const orgId = token.includes("_") ? token.slice(0, token.indexOf("_")) : null
  if (!orgId) return null

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, modulesJson: true },
  })
  if (!org) return null

  const links = (org.modulesJson as any)?.inviteLinks
  if (!Array.isArray(links)) return null
  const invite = links.find((l: any) => l?.token === token && l?.active !== false)
  if (!invite) return null
  return { org, invite }
}

export async function GET(_req: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  const found = await findInvite(token)
  if (!found) return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 404 })

  return NextResponse.json({
    organizationId: found.org.id,
    organizationName: found.org.name,
    token,
  })
}

export async function POST(_req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in first", loginRequired: true }, { status: 401 })
    }

    const { token } = await context.params
    const found = await findInvite(token)
    if (!found) return NextResponse.json({ error: "Invite link is invalid or expired" }, { status: 404 })

    const { org, invite } = found

    const existing = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: { userId: session.user.id, organizationId: org.id },
      },
    })
    if (existing?.status === "ACCEPTED") {
      return NextResponse.json({ error: "You are already a member", alreadyMember: true }, { status: 400 })
    }

    await upsertJoinRequest({
      userId: session.user.id,
      organizationId: org.id,
      answersJson: { via: "invite_link", note: invite.note || null },
      inviteToken: token,
      invitedById: invite.createdById || null,
    })

    const current = (org.modulesJson && typeof org.modulesJson === "object" ? org.modulesJson : {}) as Record<
      string,
      unknown
    >
    const links = Array.isArray(current.inviteLinks)
      ? (current.inviteLinks as any[]).map((l) =>
          l.token === token ? { ...l, uses: (l.uses || 0) + 1 } : l,
        )
      : []
    await prisma.organization.update({
      where: { id: org.id },
      data: { modulesJson: { ...current, inviteLinks: links }, updatedAt: new Date() },
    })

    const hrs = await prisma.user.findMany({
      where: { organizationId: org.id, role: "HR" },
      select: { id: true },
    })
    await Promise.all(
      hrs.map((hr) =>
        dispatchNotification({
          userId: hr.id,
          type: "MEMBER_JOINED",
          title: "Invite accepted — needs approval",
          message: `${session.user.name || "Someone"} used your invite link for ${org.name}.`,
          actionUrl: "/dashboard/hr/members",
        }).catch(() => null),
      ),
    )

    return NextResponse.json({ success: true, redirectTo: "/dashboard/member/waiting" })
  } catch (error) {
    console.error("[invite accept]", error)
    return NextResponse.json({ error: "Could not accept invite" }, { status: 500 })
  }
}
