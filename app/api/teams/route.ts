import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions, UserRole } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get("organizationId")

    const where: any = {}
    
    if (organizationId) {
      where.organizationId = organizationId
    } else if (session.user.role !== UserRole.SUPERADMIN) {
      where.organizationId = session.user.organizationId ?? undefined
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        members: { include: { user: { select: { id: true, name: true, role: true, email: true, avatarId: true } } } },
        directors: { include: { user: { select: { id: true, name: true } } } },
        event: { 
          select: { 
            id: true, 
            title: true,
            directors: { include: { user: { select: { id: true, name: true } } } }
          } 
        },
        project: { select: { id: true, title: true, status: true } },
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Format response for frontend
    const formattedTeams = teams.map((team) => ({
      ...team,
      memberCount: team.members.length,
      taskCount: team.tasks.length,
      createdBy: session.user.name, // Simplified for now
    }))

    const myTeams = formattedTeams.filter((t: any) => 
      t.members.some((m: any) => m.userId === session.user.id && m.status !== "REJECTED")
    )

    return NextResponse.json({
      teams: formattedTeams,
      myTeams
    })
  } catch (error) {
    console.error("Teams fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== UserRole.SUPERADMIN && session.user.role !== UserRole.HR)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, purpose, description, status, visibility, leadIdsJson, organizationId, eventId } = await req.json()
    
    const finalOrganizationId = organizationId || session.user.organizationId

    if (!finalOrganizationId) return NextResponse.json({ error: "Organization required" }, { status: 400 })
    if (!name) return NextResponse.json({ error: "Team name required" }, { status: 400 })

    const team = await prisma.team.create({
      data: {
        name,
        purpose,
        description,
        status: status || "active",
        visibility: visibility || "ORG",
        leadIdsJson,
        organizationId: finalOrganizationId,
        createdById: session.user.id,
        eventId: eventId || null,
      },
      include: {
        members: true,
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      id: team.id,
      name: team.name,
      purpose: team.purpose,
      status: team.status,
      eventId: team.eventId,
      members: team.members, // Return empty array initially
      memberCount: team.members.length,
      taskCount: 0,
      createdBy: team.createdBy.name,
    })
  } catch (error) {
    console.error("Team creation error:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}


