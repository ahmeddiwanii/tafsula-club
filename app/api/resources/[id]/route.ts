import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "./../../../../lib/auth"
import { prisma } from "./../../../../lib/db"

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== resource.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    if ((resource as any).visibility === "HR_ONLY" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.json(resource)
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const existing = await prisma.resource.findUnique({ where: { id }, select: { organizationId: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== existing.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { title, type, url, description, tagsJson, linkedProjectId, linkedTeamId } = body

  const resource = await prisma.resource.update({
    where: { id },
    data: { title, type, url, description, tagsJson, linkedProjectId, linkedTeamId },
  })

  return NextResponse.json(resource)
}


