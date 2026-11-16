import { getAuthSession } from "@/lib/request-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Fetch upcoming events that are ORG_ONLY or PUBLIC
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { visibility: "ORG_ONLY", organizationId: session.user.organizationId },
          { visibility: "PUBLIC" }
        ],
        status: "UPCOMING"
      },
      select: {
          id: true,
          title: true,
          startAt: true,
          location: true,
          type: true,
          registrations: {
              where: { userId: session.user.id },
              select: { id: true }
          }
      },
      orderBy: { startAt: "asc" },
      take: 6
    })

    const formattedEvents = events.map(e => ({
        ...e,
        isRegistered: e.registrations.length > 0,
        registrations: undefined
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    return NextResponse.json({ error: "Discovery failed" }, { status: 500 })
  }
}
