import { prisma } from "./db"
import type { member_status, user_role } from "@prisma/client"

/**
 * Apply a club membership as the user's active club context.
 */
export async function activateMembership(
  userId: string,
  organizationId: string,
  opts?: { role?: user_role; status?: member_status },
) {
  const membership = await prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  })
  if (!membership) throw new Error("Membership not found")

  const role = opts?.role ?? membership.role
  const status = opts?.status ?? membership.status

  await prisma.$transaction([
    prisma.organizationMembership.update({
      where: { id: membership.id },
      data: { role, status, updatedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        organizationId,
        role: role === "HR" || role === "SUPERADMIN" ? role : "MEMBER",
        memberStatus: status,
        updatedAt: new Date(),
      },
    }),
  ])

  return membership
}

export async function upsertJoinRequest(opts: {
  userId: string
  organizationId: string
  answersJson?: unknown
  inviteToken?: string | null
  invitedById?: string | null
}) {
  const membership = await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: opts.userId,
        organizationId: opts.organizationId,
      },
    },
    create: {
      userId: opts.userId,
      organizationId: opts.organizationId,
      role: "MEMBER",
      status: "AWAITING_HR",
      answersJson: opts.answersJson as any,
      inviteToken: opts.inviteToken ?? undefined,
      invitedById: opts.invitedById ?? undefined,
    },
    update: {
      status: "AWAITING_HR",
      answersJson: opts.answersJson as any,
      updatedAt: new Date(),
    },
  })

  await prisma.user.update({
    where: { id: opts.userId },
    data: {
      organizationId: opts.organizationId,
      role: "MEMBER",
      memberStatus: "AWAITING_HR",
      updatedAt: new Date(),
    },
  })

  return membership
}

export async function approveMembership(userId: string, organizationId: string) {
  const membership = await prisma.organizationMembership.update({
    where: { userId_organizationId: { userId, organizationId } },
    data: { status: "ACCEPTED", updatedAt: new Date() },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  })

  // If this is their active club (or they have none), sync user row
  if (!user?.organizationId || user.organizationId === organizationId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId,
        role: "MEMBER",
        memberStatus: "ACCEPTED",
        updatedAt: new Date(),
      },
    })
  }

  return membership
}

export async function rejectMembership(userId: string, organizationId: string) {
  const membership = await prisma.organizationMembership.update({
    where: { userId_organizationId: { userId, organizationId } },
    data: { status: "REJECTED", updatedAt: new Date() },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  })

  if (user?.organizationId === organizationId) {
    // Prefer another accepted club, else mark rejected
    const other = await prisma.organizationMembership.findFirst({
      where: { userId, status: "ACCEPTED", organizationId: { not: organizationId } },
      orderBy: { updatedAt: "desc" },
    })
    if (other) {
      await activateMembership(userId, other.organizationId)
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { memberStatus: "REJECTED", updatedAt: new Date() },
      })
    }
  }

  return membership
}

export type RecruitmentField = {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "email" | "tel"
  required?: boolean
  options?: string[]
  placeholder?: string
}

export type RecruitmentForm = {
  isOpen: boolean
  title: string
  description?: string
  fields: RecruitmentField[]
}

export const DEFAULT_RECRUITMENT_FORM: RecruitmentForm = {
  isOpen: false,
  title: "Join our club",
  description: "Tell us a bit about yourself. We will review your request and email you.",
  fields: [
    { id: "why", label: "Why do you want to join?", type: "textarea", required: true },
    { id: "skills", label: "What can you help with?", type: "textarea", required: false },
  ],
}

export function resolveRecruitmentForm(modulesJson: unknown): RecruitmentForm {
  const raw =
    modulesJson && typeof modulesJson === "object"
      ? (modulesJson as { recruitmentForm?: Partial<RecruitmentForm> }).recruitmentForm
      : undefined
  if (!raw) return { ...DEFAULT_RECRUITMENT_FORM }
  return {
    isOpen: Boolean(raw.isOpen),
    title: String(raw.title || DEFAULT_RECRUITMENT_FORM.title),
    description: raw.description ? String(raw.description) : DEFAULT_RECRUITMENT_FORM.description,
    fields: Array.isArray(raw.fields) && raw.fields.length
      ? (raw.fields as RecruitmentField[])
      : DEFAULT_RECRUITMENT_FORM.fields,
  }
}
