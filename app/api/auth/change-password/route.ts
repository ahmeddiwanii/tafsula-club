import { getAuthSession } from "@/lib/request-auth"
import { NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const ok = await compare(currentPassword, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
    }

    const hashed = await hash(String(newPassword), 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, updatedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[change-password]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
