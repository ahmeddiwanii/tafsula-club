import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST - Import member contacts to org general list
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Only HR can import contacts
        if (session.user.role !== "HR" && session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Only HR can import contacts" }, { status: 403 })
        }

        const { contactIds } = await req.json()

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return NextResponse.json({ error: "Contact IDs required" }, { status: 400 })
        }

        // Update all selected contacts to be general
        const result = await prisma.contact.updateMany({
            where: {
                id: { in: contactIds },
                organizationId: session.user.organizationId,
            },
            data: { isGeneral: true },
        })

        return NextResponse.json({ success: true, updated: result.count })
    } catch (error) {
        console.error("Error importing contacts:", error)
        return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 })
    }
}
