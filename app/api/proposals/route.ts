import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const where: any = {}
  if (session.user.role !== "SUPERADMIN") {
    where.organizationId = session.user.organizationId ?? undefined
    if (session.user.role === "HR") {
      where.visibility = { in: ["ORG", "HR_ONLY", "PRIVATE"] }
    } else if (session.user.role === "MEMBER") {
      where.OR = [{ submittedById: session.user.id }, { visibility: "ORG" }]
    } else {
      where.visibility = { in: ["ORG"] }
    }
  }

  const proposals = await prisma.proposal.findMany({
    where,
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(proposals)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  const organizationId = session.user.role === "SUPERADMIN" ? (req.headers.get("x-organization-id") || session.user.organizationId) : session.user.organizationId
  if (!organizationId) return NextResponse.json({ error: "Organization required" }, { status: 400 })

  const body = await req.json()
  const { type, title, visibility, canvasJson, swotJson, timelineStart, timelineEnd, expectedImpact } = body

  const proposal = await prisma.proposal.create({
    data: {
      organizationId,
      type,
      title,
      visibility: visibility || "ORG",
      canvasJson,
      swotJson,
      timelineStart: timelineStart ? new Date(timelineStart) : undefined,
      timelineEnd: timelineEnd ? new Date(timelineEnd) : undefined,
      expectedImpact,
      submittedById: session.user.id,
      status: "submitted",
    },
  })
  return NextResponse.json(proposal, { status: 201 })
}


