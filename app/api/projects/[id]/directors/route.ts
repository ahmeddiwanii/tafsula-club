import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get all directors of this project
    const directors = await prisma.projectDirector.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ directors })
  } catch (error: any) {
    console.error("Error fetching project directors:", error)
    return NextResponse.json(
      { error: "Failed to fetch project directors" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { userId, role = "DIRECTOR" } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check if director already exists
    const existing = await prisma.projectDirector.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "User is already a director of this project" },
        { status: 400 }
      )
    }

    // Create director relationship
    const director = await prisma.projectDirector.create({
      data: {
        projectId: id,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ director }, { status: 201 })
  } catch (error: any) {
    console.error("Error assigning project director:", error)
    return NextResponse.json(
      { error: "Failed to assign project director" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, userId } = params

    // Delete director relationship
    const deleted = await prisma.projectDirector.delete({
      where: {
        projectId_userId: {
          projectId: id,
          userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ message: "Director removed", director: deleted })
  } catch (error: any) {
    console.error("Error removing project director:", error)
    return NextResponse.json(
      { error: "Failed to remove project director" },
      { status: 500 }
    )
  }
}
