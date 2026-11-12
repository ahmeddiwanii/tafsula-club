import { prisma } from "./db"

export type NotificationType =
  | "EVENT_CREATED"
  | "TEAM_INVITATION"
  | "TASK_ASSIGNED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "TEAM_JOINED"
  | "TASK_ACCEPTED"
  | "TASK_SUBMITTED"
  | "MEMBER_JOINED"
  | "HR_ACCEPTED"
  | "HR_REJECTED"

interface NotifyParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT"
}

export async function dispatchNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
}: NotifyParams) {
  try {
    const row = await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        message,
        actionUrl: actionUrl ?? null,
        read: false,
      },
    })

    if (process.env.NODE_ENV === "development") {
      console.log(`[notify] ${userId}: ${title}`)
    }

    return { success: true, id: row.id }
  } catch (error) {
    console.error("[notify] dispatch failed:", error)
    return { success: false, error }
  }
}

export async function broadcastToOrg(organizationId: string, params: Omit<NotifyParams, "userId">) {
  try {
    const members = await prisma.user.findMany({
      where: { organizationId },
      select: { id: true },
    })

    await Promise.all(
      members.map((member) =>
        dispatchNotification({
          ...params,
          userId: member.id,
        }),
      ),
    )
    return { success: true, count: members.length }
  } catch (error) {
    console.error("[notify] broadcast failed:", error)
    return { success: false, error }
  }
}
