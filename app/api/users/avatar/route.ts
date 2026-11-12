import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { avatarId } = body

        if (typeof avatarId !== "number" || avatarId < 1 || avatarId > 4) {
            return NextResponse.json({ error: "Invalid avatarId. Pick a club buddy 1–4." }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { avatarId },
        })

        return NextResponse.json({ success: true, avatarId })
    } catch (error) {
        console.error("Error updating avatar:", error)
        return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 })
    }
}
