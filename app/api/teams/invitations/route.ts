import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { dispatchNotification } from "@/lib/notifications"
import type { NextRequest } from "next/server"

/**
 * Handle Asset Responses to Squad Invitations
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { invitationId, status, message } = await req.json()

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid Protocol" }, { status: 400 })
    }

    // Update Team Member Status
    const member = await prisma.teamMember.update({
      where: { id: invitationId },
      include: { 
        team: { select: { name: true, createdById: true } },
        user: { select: { name: true } }
      }
    })

    // Security check: only the member can accept/reject
    if (member.userId !== session.user.id) {
      return NextResponse.json({ error: "Command Override Denied" }, { status: 403 })
    }

    await prisma.teamMember.update({
      where: { id: invitationId },
      data: { status }
    })

    // Notify Commander (Creator)
    await dispatchNotification({
      userId: member.team.createdById,
      type: status === "ACCEPTED" ? "TEAM_JOINED" : "REQUEST_REJECTED",
      title: `Squad Personnel Update`,
      message: `Asset ${member.user.name} has ${status.toLowerCase()} deployment to: ${member.team.name}.`,
      actionUrl: `/dashboard/hr/teams/${member.teamId}`
    })

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("[INVITATION_FAIL] Status update intercepted:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
