import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import crypto from "crypto"

import { prisma } from "../../../../lib/db"
import { rateLimit } from "@/lib/rate-limit"
import { UserRole } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    if (!rateLimit(`register:${ip}`, 8, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 })
    }

    const { name, email, password } = await req.json()

    if (!name || !email || !password || String(password).length < 8) {
      return NextResponse.json(
        { error: "Name, email, and a password of at least 8 characters are required." },
        { status: 400 },
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: UserRole.REGULAR_USER,
        avatarId: 1,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[register] failed")
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
