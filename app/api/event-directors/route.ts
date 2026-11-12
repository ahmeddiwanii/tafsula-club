import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"

// Get all organization members (for director selection)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // Get all members in the organization
    const members = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

// Add directors to an event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, directorIds } = await request.json()

    if (!eventId || !Array.isArray(directorIds)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })

    // Verify event belongs to user's organization
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event || event.organizationId !== user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete existing directors
    await prisma.eventDirector.deleteMany({
      where: { eventId },
    })

    // Add new directors
    if (directorIds.length > 0) {
      await prisma.eventDirector.createMany({
        data: directorIds.map((userId: string) => ({
          eventId,
          userId,
          role: "DIRECTOR",
        })),
      })
    }

    // Fetch updated directors
    const updatedDirectors = await prisma.eventDirector.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(updatedDirectors)
  } catch (error) {
    console.error("Failed to update directors:", error)
    return NextResponse.json({ error: "Failed to update directors" }, { status: 500 })
  }
}
