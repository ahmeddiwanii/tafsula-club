import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== proposal.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    if (proposal.visibility === "HR_ONLY" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.json(proposal)
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const existing = await prisma.proposal.findUnique({ where: { id }, select: { organizationId: true, visibility: true, submittedById: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const canEdit =
    session.user.role === "SUPERADMIN" ||
    (session.user.role === "HR" && session.user.organizationId === existing.organizationId) ||
    session.user.id === existing.submittedById

  if (!canEdit) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await req.json()
  const { title, visibility, canvasJson, swotJson, timelineStart, timelineEnd, expectedImpact } = body

  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      title,
      visibility,
      canvasJson,
      swotJson,
      timelineStart: timelineStart ? new Date(timelineStart) : undefined,
      timelineEnd: timelineEnd ? new Date(timelineEnd) : undefined,
      expectedImpact,
    },
  })

  return NextResponse.json(updated)
}


