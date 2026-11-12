import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

function canView(session: any, userId: string, targetOrganizationId: string | null) {
  if (!session) return false
  if (session.user.role === "SUPERADMIN") return true
  if (session.user.id === userId) return true
  if (session.user.role === "HR" && session.user.organizationId && session.user.organizationId === targetOrganizationId) return true
  return false
}

function canEdit(session: any, userId: string, targetOrganizationId: string | null) {
  if (!session) return false
  if (session.user.id === userId) return true
  if (session.user.role === "SUPERADMIN") return true
  if (session.user.role === "HR" && session.user.organizationId && session.user.organizationId === targetOrganizationId) return true
  return false
}

export async function GET(_: Request, context: { params: Promise<{ userId: string }> }) {
  const params = await context.params
  const { userId } = params
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      result: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      profile: true,
      certificate: true,
      userSkill: { include: { skill: true } },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (!canView(session, userId, user.organizationId || null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const personalitySnapshot =
    user.result.length > 0
      ? {
          dominantType: user.result[0].dominantType,
          dScore: user.result[0].dScore,
          iScore: user.result[0].iScore,
          sScore: user.result[0].sScore,
          cScore: user.result[0].cScore,
        }
      : null

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    profile: user.profile,
    certificates: user.certificate,
    skills: user.userSkill.map((us) => ({
      id: us.skill.id,
      name: us.skill.name,
      category: us.skill.category,
      level: us.level,
    })),
    personalitySnapshot,
  })
}

export async function PUT(req: Request, context: { params: Promise<{ userId: string }> }) {
  const params = await context.params
  const { userId } = params
  const session = await getServerSession(authOptions)

  const body = await req.json()
  const { headline, bio, location, roleTitle, experienceJson, skillsJson } = body

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (!canEdit(session, userId, user.organizationId || null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      headline,
      bio,
      location,
      roleTitle,
      experienceJson,
      skillsJson,
    },
    create: {
      userId,
      headline,
      bio,
      location,
      roleTitle,
      experienceJson,
      skillsJson,
    },
  })

  return NextResponse.json({ profile })
}


