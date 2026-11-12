import { NextResponse } from "next/server"
import crypto from "crypto"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"

/**
 * Lightweight reset: issues a temporary password via email.
 * (Token table can replace this later without changing the UI.)
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const tempPassword = crypto.randomBytes(9).toString("base64url")
    const hashed = await hash(tempPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, updatedAt: new Date() },
    })

    const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl: `${base}/auth/login?reset=1`,
    })

    // Also email the temp password using invite template shape
    const { sendInviteEmail } = await import("@/lib/email")
    await sendInviteEmail({ to: user.email, password: tempPassword })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[forgot-password]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
