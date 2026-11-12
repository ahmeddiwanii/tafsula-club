import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Get delegated features for current user or a specific user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId") || session.user.id

        const accesses = await prisma.featureAccess.findMany({
            where: {
                userId,
                organizationId: session.user.organizationId,
            },
            include: {
                grantedBy: { select: { id: true, name: true } },
            },
        })

        return NextResponse.json({ accesses })
    } catch (error) {
        console.error("Error fetching feature access:", error)
        return NextResponse.json({ error: "Failed to fetch feature access" }, { status: 500 })
    }
}

// POST - Grant feature access
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.user.role !== "HR" && session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Only HR can delegate access" }, { status: 403 })
        }

        const { userId, feature } = await req.json()
        const validFeatures = ["EVENTS", "TASKS", "TEAMS", "PROPOSALS"]

        if (!userId || !feature || !validFeatures.includes(feature)) {
            return NextResponse.json({ error: "Valid userId and feature required" }, { status: 400 })
        }

        const access = await prisma.featureAccess.upsert({
            where: {
                userId_organizationId_feature: {
                    userId,
                    organizationId: session.user.organizationId,
                    feature,
                },
            },
            update: {},
            create: {
                userId,
                organizationId: session.user.organizationId,
                feature,
                grantedById: session.user.id,
            },
        })

        return NextResponse.json({ access })
    } catch (error) {
        console.error("Error granting feature access:", error)
        return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
    }
}

// DELETE - Revoke feature access
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.user.role !== "HR" && session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Only HR can revoke access" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const feature = searchParams.get("feature")

        if (!userId || !feature) {
            return NextResponse.json({ error: "userId and feature required" }, { status: 400 })
        }

        await prisma.featureAccess.delete({
            where: {
                userId_organizationId_feature: {
                    userId,
                    organizationId: session.user.organizationId,
                    feature,
                },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error revoking feature access:", error)
        return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 })
    }
}
