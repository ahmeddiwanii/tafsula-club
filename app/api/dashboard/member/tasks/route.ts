import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const assignments = await prisma.teamTaskAssignment.findMany({
      where: {
        userId: session.user.id,
        acceptanceStatus: "PENDING"
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            dueDate: true,
            team: {
              select: {
                id: true,
                name: true,
                event: {
                  select: {
                    id: true,
                    title: true,
                    startAt: true,
                    location: true,
                  },
                },
                project: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                  },
                },
              },
            },
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    return NextResponse.json({ error: "Mission data missing" }, { status: 500 })
  }
}
