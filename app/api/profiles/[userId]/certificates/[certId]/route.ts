import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../../../lib/auth"
import { prisma } from "../../../../../../lib/db"

function canEdit(session: any, userId: string, targetOrganizationId: string | null) {
  if (!session) return false
  if (session.user.id === userId) return true
  if (session.user.role === "SUPERADMIN") return true
  if (session.user.role === "HR" && session.user.organizationId && session.user.organizationId === targetOrganizationId) return true
  return false
}

export async function DELETE(_: Request, context: { params: Promise<{ userId: string; certId: string }> }) {
  const params = await context.params
  const { userId, certId } = params
  const session = await getServerSession(authOptions)

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
    select: { userId: true, user: { select: { organizationId: true } } },
  })

  if (!certificate || certificate.userId !== userId) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
  }

  if (!canEdit(session, userId, certificate.user.organizationId || null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  await prisma.certificate.delete({ where: { id: certId } })
  return NextResponse.json({ success: true })
}


