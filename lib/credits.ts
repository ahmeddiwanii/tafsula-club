import { prisma } from "./db"

/**
 * Add points to a member's club ledger.
 */
export async function updateMemberCredits(
  userId: string,
  organizationId: string,
  credits: number,
  reason: string,
  meta?: { tasksApprovedIncrement?: number },
) {
  try {
    const entry = {
      amount: credits,
      reason,
      timestamp: new Date().toISOString(),
    }

    const existing = await prisma.memberCredit.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    })

    if (!existing) {
      return prisma.memberCredit.create({
        data: {
          userId,
          organizationId,
          totalCredits: credits,
          creditsJson: JSON.stringify([entry]),
          tasksApproved: meta?.tasksApprovedIncrement ?? 0,
          approvalRate: 100,
        },
      })
    }

    let ledger: unknown[] = []
    try {
      ledger = existing.creditsJson ? JSON.parse(String(existing.creditsJson)) : []
      if (!Array.isArray(ledger)) ledger = []
    } catch {
      ledger = []
    }
    ledger.push(entry)

    return prisma.memberCredit.update({
      where: { userId_organizationId: { userId, organizationId } },
      data: {
        totalCredits: { increment: credits },
        creditsJson: JSON.stringify(ledger),
        ...(meta?.tasksApprovedIncrement
          ? { tasksApproved: { increment: meta.tasksApprovedIncrement } }
          : {}),
      },
    })
  } catch (error) {
    console.error("[credits] Failed to update member credits:", error)
    return null
  }
}
