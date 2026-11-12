import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions, UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendAcceptanceEmail, sendRejectionEmail } from "@/lib/email"
import { dispatchNotification } from "@/lib/notifications"
import { getMemberStatus } from "@/lib/member-status-db"
import { approveMembership, rejectMembership } from "@/lib/membership"

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== UserRole.SUPERADMIN && session.user.role !== UserRole.HR)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await context.params
    const { decision, organizationId: bodyOrgId } = await req.json()

    if (!["ACCEPTED", "REJECTED"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 })
    }

    const member = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, organizationId: true, email: true, name: true },
    })

    if (!member || (member.role !== "MEMBER" && member.role !== "REGULAR_USER")) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const organizationId =
      session.user.role === UserRole.HR
        ? session.user.organizationId
        : bodyOrgId || member.organizationId

    if (!organizationId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 })
    }

    if (session.user.role === UserRole.HR && member.organizationId !== organizationId) {
      // Also allow if they have a pending membership for this org
      const pending = await prisma.organizationMembership.findUnique({
        where: { userId_organizationId: { userId: id, organizationId } },
      })
      if (!pending) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    if (decision === "ACCEPTED") {
      await approveMembership(id, organizationId)
      try {
        await sendAcceptanceEmail({ to: member.email, name: member.name })
      } catch (e) {
        console.error("[HR_DECISION] Failed to send acceptance email:", e)
      }
    } else {
      await rejectMembership(id, organizationId)
      try {
        await sendRejectionEmail({ to: member.email })
      } catch (e) {
        console.error("[HR_DECISION] Failed to send rejection email:", e)
      }
    }

    await dispatchNotification({
      userId: member.id,
      type: decision === "ACCEPTED" ? "HR_ACCEPTED" : "HR_REJECTED",
      title: decision === "ACCEPTED" ? "You’re in!" : "Update on your request",
      message:
        decision === "ACCEPTED"
          ? "Your club approved you. Open your dashboard to get started."
          : "Your join request was not approved.",
      actionUrl: decision === "ACCEPTED" ? "/dashboard/member/home" : "/auth/login?message=rejected",
    })

    const memberStatus = await getMemberStatus(id)
    return NextResponse.json({ success: true, memberStatus })
  } catch (error) {
    console.error("[HR_DECISION] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

