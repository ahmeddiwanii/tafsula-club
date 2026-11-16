import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [organizations, events] = await Promise.all([
      prisma.organization.findMany({
        take: 40,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          organizationProfile: {
            select: {
              bio: true,
              location: true,
              profileImageUrl: true,
              isPublic: true,
            },
          },
          _count: { select: { user: true, event: true } },
        },
      }),
      prisma.event.findMany({
        where: {
          visibility: { in: ["PUBLIC", "ORG_ONLY"] },
          status: { not: "CANCELLED" },
        },
        take: 40,
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          title: true,
          startAt: true,
          location: true,
          venue: true,
          format: true,
          visibility: true,
          posterUrl: true,
          organization: { select: { id: true, name: true } },
          _count: { select: { registrations: true } },
        },
      }),
    ])

    return NextResponse.json({
      organizations: organizations.filter((org) => org.organizationProfile?.isPublic !== false),
      events,
    })
  } catch (error) {
    console.error("[public/catalog]", error)
    return NextResponse.json({ error: "Could not load catalog." }, { status: 500 })
  }
}
