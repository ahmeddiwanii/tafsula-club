import { prisma } from "@/lib/db"

const DEFAULT_STATUS = "ACCEPTED"

/**
 * Read/write user.memberStatus using Prisma (PostgreSQL-safe).
 */
export async function getMemberStatus(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { memberStatus: true },
    })
    const v = user?.memberStatus
    return typeof v === "string" && v.length > 0 ? v : DEFAULT_STATUS
  } catch (e) {
    console.warn("[memberStatus] read failed; defaulting:", e)
    return DEFAULT_STATUS
  }
}

export async function setMemberStatus(userId: string, status: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        memberStatus: status as "TEST_PENDING" | "AWAITING_HR" | "ACCEPTED" | "REJECTED",
        updatedAt: new Date(),
      },
    })
  } catch (e) {
    console.error("[memberStatus] write failed:", e)
    throw e
  }
}
