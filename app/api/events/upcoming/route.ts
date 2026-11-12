import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    // Get all public events (both upcoming and past)
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { visibility: "PUBLIC" },
          { visibility: "ORG_ONLY" },
        ],
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            organizationProfile: {
              select: { profileImageUrl: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
      skip,
      take: limit,
      orderBy: { startAt: "desc" },
    })

    const total = await prisma.event.count({
      where: {
        OR: [
          { visibility: "PUBLIC" },
          { visibility: "ORG_ONLY" },
        ],
      },
    })

    return NextResponse.json({
      events,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
