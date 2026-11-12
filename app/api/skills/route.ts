import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/db"

export async function GET() {
  const skills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
  })
  return NextResponse.json(skills)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "HR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { name, category } = await req.json()
  const skill = await prisma.skill.create({
    data: {
      name,
      category,
    },
  })
  return NextResponse.json(skill, { status: 201 })
}


