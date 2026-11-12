import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { sendInviteEmail } from "@/lib/email"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { user: true },
        },
      },
    })

    return NextResponse.json(organizations)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { name, hrName, hrEmail } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid organization name" }, { status: 400 })
    }

    const orgId = uuidv4()
    
    // Check if HR email already exists if provided
    if (hrEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: hrEmail } })
      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }
    }

    let newOrganization;

    await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      newOrganization = await tx.organization.create({
        data: {
          id: orgId,
          name,
          createdById: session.user.id,
          updatedAt: new Date(),
        },
      })

      // 2. Create HR User if details provided
      if (hrName && hrEmail) {
        const rawPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(rawPassword, 10)
        
        await tx.user.create({
          data: {
            id: uuidv4(),
            name: hrName,
            email: hrEmail,
            password: hashedPassword,
            role: "HR",
            organizationId: orgId,
            memberStatus: "ACCEPTED",
            updatedAt: new Date()
          }
        })

        // Send invite email (fire and forget)
        sendInviteEmail({
          to: hrEmail,
          password: rawPassword,
        }).catch(err => console.error("Failed to send HR invite email:", err))
      }
    })

    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error) {
    console.error("[CREATE_ORGANIZATION]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
