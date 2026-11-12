import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { id } = await context.params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    select: { organizationId: true, title: true, description: true, type: true, submittedById: true },
  })
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== proposal.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const project = await prisma.project.create({
    data: {
      organizationId: proposal.organizationId,
      title: proposal.title,
      description: proposal.description,
      type: proposal.type || "initiative",
      status: "active",
      visibility: "ORG",
      createdById: session.user.id,
    },
  })

  const updatedProposal = await prisma.proposal.update({
    where: { id },
    data: { status: "accepted", reviewerId: session.user.id, autoProjectId: project.id },
  })

  return NextResponse.json({ proposal: updatedProposal, project })
}


