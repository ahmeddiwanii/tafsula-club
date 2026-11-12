import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  const { id } = await context.params

  const proposal = await prisma.proposal.findUnique({ where: { id }, select: { organizationId: true, visibility: true } })
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== proposal.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    if (proposal.visibility === "HR_ONLY" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  const { body } = await req.json()
  const comment = await prisma.proposalComment.create({
    data: {
      proposalId: id,
      authorId: session.user.id,
      body,
    },
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}


