import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { resolveRecruitmentForm, upsertJoinRequest } from "@/lib/membership"
import { dispatchNotification } from "@/lib/notifications"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to join", loginRequired: true }, { status: 401 })
    }

    const { id: organizationId } = await context.params
    const body = await req.json().catch(() => ({}))
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {}

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, modulesJson: true },
    })
    if (!org) return NextResponse.json({ error: "Club not found" }, { status: 404 })

    const form = resolveRecruitmentForm(org.modulesJson)
    if (!form.isOpen) {
      return NextResponse.json({ error: "This club is not recruiting right now" }, { status: 400 })
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required) {
        const v = answers[field.id]
        if (v === undefined || v === null || String(v).trim() === "") {
          return NextResponse.json({ error: `Please fill in: ${field.label}` }, { status: 400 })
        }
      }
    }

    const existing = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: { userId: session.user.id, organizationId },
      },
    })
    if (existing?.status === "ACCEPTED") {
      return NextResponse.json({ error: "You are already a member of this club" }, { status: 400 })
    }
    if (existing?.status === "AWAITING_HR") {
      return NextResponse.json({
        success: true,
        alreadyPending: true,
        redirectTo: "/dashboard/member/waiting",
      })
    }

    await upsertJoinRequest({
      userId: session.user.id,
      organizationId,
      answersJson: answers,
    })

    // Notify HR users in the org
    const hrs = await prisma.user.findMany({
      where: { organizationId, role: "HR" },
      select: { id: true },
    })
    await Promise.all(
      hrs.map((hr) =>
        dispatchNotification({
          userId: hr.id,
          type: "MEMBER_JOINED",
          title: "New join request",
          message: `${session.user.name || "Someone"} asked to join ${org.name}.`,
          actionUrl: "/dashboard/hr/members",
        }).catch(() => null),
      ),
    )

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard/member/waiting",
    })
  } catch (error) {
    console.error("[org join]", error)
    return NextResponse.json({ error: "Could not submit join request" }, { status: 500 })
  }
}
