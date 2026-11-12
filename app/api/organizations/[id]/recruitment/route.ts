import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, UserRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { resolveRecruitmentForm, type RecruitmentForm } from "@/lib/membership"
import { DEFAULT_POINTS_FORMULA, resolvePointsFormula, type PointsFormula } from "@/lib/points"

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const org = await prisma.organization.findUnique({
    where: { id },
    select: { id: true, name: true, modulesJson: true },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const form = resolveRecruitmentForm(org.modulesJson)
  const session = await getServerSession(authOptions)
  const isHr =
    session?.user?.role === UserRole.HR && session.user.organizationId === id

  // Public only sees open form definition (no points formula)
  if (!isHr && session?.user?.role !== UserRole.SUPERADMIN) {
    return NextResponse.json({
      organizationId: org.id,
      organizationName: org.name,
      form: form.isOpen
        ? form
        : { isOpen: false, title: form.title, description: "This club is not recruiting right now.", fields: [] },
    })
  }

  return NextResponse.json({
    organizationId: org.id,
    organizationName: org.name,
    form,
    pointsFormula: resolvePointsFormula(org.modulesJson),
  })
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await context.params

  if (
    !session ||
    (session.user.role !== UserRole.HR && session.user.role !== UserRole.SUPERADMIN)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  if (session.user.role === UserRole.HR && session.user.organizationId !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const org = await prisma.organization.findUnique({
    where: { id },
    select: { modulesJson: true },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const current = (org.modulesJson && typeof org.modulesJson === "object"
    ? org.modulesJson
    : {}) as Record<string, unknown>

  let nextForm: RecruitmentForm | undefined
  if (body.form) {
    nextForm = {
      isOpen: Boolean(body.form.isOpen),
      title: String(body.form.title || "Join our club"),
      description: body.form.description ? String(body.form.description) : undefined,
      fields: Array.isArray(body.form.fields) ? body.form.fields : [],
    }
  }

  let nextPoints: PointsFormula | undefined
  if (body.pointsFormula) {
    nextPoints = {
      attendanceScan: Number(body.pointsFormula.attendanceScan ?? DEFAULT_POINTS_FORMULA.attendanceScan),
      earlyBonus: Number(body.pointsFormula.earlyBonus ?? DEFAULT_POINTS_FORMULA.earlyBonus),
      earlyWindowMinutes: Number(
        body.pointsFormula.earlyWindowMinutes ?? DEFAULT_POINTS_FORMULA.earlyWindowMinutes,
      ),
      taskApproved: Number(body.pointsFormula.taskApproved ?? DEFAULT_POINTS_FORMULA.taskApproved),
    }
  }

  const modulesJson = {
    ...current,
    ...(nextForm ? { recruitmentForm: nextForm } : {}),
    ...(nextPoints ? { pointsFormula: nextPoints } : {}),
  }

  await prisma.organization.update({
    where: { id },
    data: { modulesJson, updatedAt: new Date() },
  })

  return NextResponse.json({
    form: resolveRecruitmentForm(modulesJson),
    pointsFormula: resolvePointsFormula(modulesJson),
  })
}
