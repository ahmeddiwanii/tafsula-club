import { getAuthSession } from "@/lib/request-auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10))
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0)
    const unreadOnly = searchParams.get("unread") === "true"

    const where = {
      userId: session.user.id,
      ...(unreadOnly ? { read: false } : {}),
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ])

    return NextResponse.json({
      notifications,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("[notifications] GET failed", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, read } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: Boolean(read),
        readAt: read ? new Date() : null,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("[notifications] PUT failed", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.notification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notifications] DELETE failed", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
