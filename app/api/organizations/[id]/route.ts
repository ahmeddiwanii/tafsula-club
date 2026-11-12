import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

interface Params {
  id: string
}

export async function GET(req: Request, context: { params: Promise<Params> }) {
  const params = await context.params
  try {
    const { id } = params

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        organizationProfile: true,
        user: {
          where: { role: "HR" },
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            user: true,
            event: true,
            project: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
