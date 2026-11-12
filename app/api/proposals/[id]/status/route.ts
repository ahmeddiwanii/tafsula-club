import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"

/** Matches UI + DB usage across the app (member/HR dashboards, stats). */
const allowedStatuses = [
  "submitted",
  "under_review",
  "in_review",
  "needs_changes",
  "accepted",
  "approved",
  "rejected",
]

const allowedVisibility = ["ORG", "HR_ONLY", "PRIVATE"]

async function updateProposalStatus(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { id } = await context.params
  const body = await req.json().catch(() => ({}))
  const { status, visibility } = body as { status?: string; visibility?: string }

  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid or missing status" }, { status: 400 })
  }

  const proposal = await prisma.proposal.findUnique({ where: { id }, select: { organizationId: true, type: true, title: true, canvasJson: true, submittedById: true } })
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== proposal.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const data: any = {
    status,
    reviewerId: session.user.id,
  }
  if (visibility && allowedVisibility.includes(visibility)) {
    data.visibility = visibility
  }

  const updated = await prisma.proposal.update({
    where: { id },
    data,
  })

  // Auto-Project Creation
  if (status === "approved" && !updated.autoProjectId) {
    const description = (proposal.canvasJson as any)?.description || ""
    if (proposal.type === "event" || proposal.type === "training" || proposal.type === "workshop") {
      // Create Event
      const evt = await prisma.event.create({
        data: {
          organizationId: proposal.organizationId,
          title: proposal.title,
          description: description || null,
          createdById: proposal.submittedById,
          type: "GENERAL",
          startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week later
        }
      })
      await prisma.proposal.update({ where: { id }, data: { autoProjectId: evt.id } })
    } else {
      // Create Project
      const proj = await prisma.project.create({
        data: {
          organizationId: proposal.organizationId,
          title: proposal.title,
          description: description || null,
          createdById: proposal.submittedById,
          type: "internal",
          status: "idea",
        }
      })
      await prisma.proposal.update({ where: { id }, data: { autoProjectId: proj.id } })
    }
  }

  return NextResponse.json(updated)
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  return updateProposalStatus(req, context)
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  return updateProposalStatus(req, context)
}
