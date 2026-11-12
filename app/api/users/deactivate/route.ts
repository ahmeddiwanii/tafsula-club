import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { hash } from "bcryptjs"
import crypto from "crypto"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

/** Soft-deactivate: scramble password and anonymize email so login stops working. */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = session.user.id
    const scrambled = await hash(crypto.randomBytes(24).toString("hex"), 10)
    await prisma.user.update({
      where: { id },
      data: {
        email: `deleted_${id.slice(0, 8)}@tafsula.invalid`,
        name: "Deactivated user",
        password: scrambled,
        organizationId: null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[deactivate]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
