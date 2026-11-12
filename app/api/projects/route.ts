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
    where.OR = [
      { visibility: "ORG" },
      ...(session.user.role === "HR" ? [{ visibility: "HR_ONLY" }] : []),
    ]
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      team: { select: { id: true, name: true } },
      tasks: { select: { id: true, status: true, assigneeId: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, type, status, visibility, teamId, timelineStart, timelineEnd, objectivesJson } = body
  const organizationId = session.user.role === "SUPERADMIN" ? (req.headers.get("x-organization-id") || session.user.organizationId) : session.user.organizationId
  if (!organizationId) return NextResponse.json({ error: "Organization required" }, { status: 400 })

  const project = await prisma.project.create({
    data: {
      title,
      description,
      type: type || "internal",
      status: status || "idea",
      visibility: visibility || "ORG",
      teamId,
      timelineStart: timelineStart ? new Date(timelineStart) : undefined,
      timelineEnd: timelineEnd ? new Date(timelineEnd) : undefined,
      objectivesJson,
      organizationId,
      createdById: session.user.id,
    },
  })
  return NextResponse.json(project, { status: 201 })
}


