import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import { UserRole } from "../../../../types/user"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.HR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { organizationId, groups } = await req.json()

  if (!organizationId || !Array.isArray(groups)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    // Validate that each group with members has a chef
    const invalidGroups = groups.filter((g: any) => g.memberIds.length > 0 && !g.chefId)
    if (invalidGroups.length > 0) {
      return NextResponse.json(
        { error: "Each group with members must have a Chef d'équipe" },
        { status: 400 }
      )
    }

    // Save team groups configuration
    for (const group of groups) {
      // Store group configuration as JSON for now
      // In a production system, you might create a separate TeamGroup model
      await prisma.team.upsert({
        where: { id: group.id },
        create: {
          id: group.id,
          organizationId,
          name: group.name,
          purpose: "Drag-and-drop created group",
          leadIdsJson: group.chefId ? [group.chefId] : [],
          createdById: session.user.id,
          status: "active",
        },
        update: {
          name: group.name,
          leadIdsJson: group.chefId ? [group.chefId] : [],
        },
      })

      // Update team members
      // First remove all existing members
      await prisma.teamMember.deleteMany({
        where: { teamId: group.id },
      })

      // Add new members
      for (const memberId of group.memberIds) {
        await prisma.teamMember.create({
          data: {
            teamId: group.id,
            userId: memberId,
            roleInTeam: memberId === group.chefId ? "CHEF_EQUIPE" : "MEMBER",
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Team groups configured successfully",
    })
  } catch (error: any) {
    console.error("Error saving team groups:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save team groups" },
      { status: 500 }
    )
  }
}
