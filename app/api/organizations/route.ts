import { getAuthSession } from "@/lib/request-auth"
import { NextResponse } from "next/server"
import { prisma } from "../../../lib/db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { sendInviteEmail } from "@/lib/email"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12))
    const skip = (page - 1) * limit
    const session = await getAuthSession()

    const where =
      session?.user?.role === "SUPERADMIN"
        ? {}
        : {
            OR: [
              { organizationProfile: { isPublic: true } },
              { organizationProfile: null },
            ],
          }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          organizationProfile: {
            select: {
              bio: true,
              location: true,
              profileImageUrl: true,
              isPublic: true,
            },
          },
          _count: {
            select: { user: true, event: true, project: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ])

    return NextResponse.json({
      organizations,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
    })
  } catch (error) {
    console.error("[organizations] GET failed", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { name, hrName, hrEmail } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid organization name" }, { status: 400 })
    }

    const orgId = uuidv4()

    if (hrEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: hrEmail } })
      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }
    }

    let newOrganization

    await prisma.$transaction(async (tx) => {
      newOrganization = await tx.organization.create({
        data: {
          id: orgId,
          name,
          createdById: session.user.id,
          updatedAt: new Date(),
        },
      })

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
            updatedAt: new Date(),
          },
        })

        sendInviteEmail({
          to: hrEmail,
          password: rawPassword,
        }).catch(() => null)
      }
    })

    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error) {
    console.error("[organizations] POST failed", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
