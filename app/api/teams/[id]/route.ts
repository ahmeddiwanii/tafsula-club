import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: { 
        include: { 
          user: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              role: true, 
              avatarId: true,
              organizationId: true 
            } 
          } 
        } 
      },
      directors: {
        include: {
           user: {
              select: {
                 id: true,
                 name: true,
                 email: true,
                 avatarId: true
              }
           }
        }
      },
      tasks: {
        include: {
           assignments: {
              include: {
                 user: {
                    select: {
                       id: true,
                       name: true
                    }
                 }
              }
           }
        }
      },
      project: true,
      event: {
        include: {
          directors: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarId: true
                }
              }
            }
          }
        }
      }
    },
  })
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (session.user.role !== "SUPERADMIN") {
    if (!session.user.organizationId || session.user.organizationId !== team.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
  }

  return NextResponse.json(team)
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const existing = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== existing.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { name, purpose, description, status, visibility, leadIdsJson } = await req.json()
  const team = await prisma.team.update({
    where: { id },
    data: { name, purpose, description, status, visibility, leadIdsJson },
  })
  return NextResponse.json(team)
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const existing = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== existing.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { name, purpose, description, status, visibility } = await req.json()
  const team = await prisma.team.update({
    where: { id },
    data: { name, purpose, description, status, visibility },
  })
  return NextResponse.json(team)
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { organizationId: true } })
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "SUPERADMIN" && session.user.organizationId !== team.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Delete team members first (foreign key constraint)
  await prisma.teamMember.deleteMany({ where: { teamId: id } })

  // Delete team
  await prisma.team.delete({ where: { id } })

  return NextResponse.json({ message: "Team deleted successfully" })
}


