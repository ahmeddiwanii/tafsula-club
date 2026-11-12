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

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(resources)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { title, type, url, description, tagsJson, linkedProjectId, linkedTeamId, visibility } = body
  const organizationId = session.user.role === "SUPERADMIN" ? (req.headers.get("x-organization-id") || session.user.organizationId) : session.user.organizationId
  if (!organizationId) return NextResponse.json({ error: "Organization required" }, { status: 400 })

  const resource = await prisma.resource.create({
    data: {
      organizationId,
      title,
      type,
      url,
      description,
      tagsJson,
      linkedProjectId,
      linkedTeamId,
      createdById: session.user.id,
      visibility: visibility || "ORG",
    },
  })

  return NextResponse.json(resource, { status: 201 })
}


