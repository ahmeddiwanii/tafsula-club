import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check if user has completed the test
    const discResult = await prisma.result.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    // Get organization info
    let organization = null
    if (session.user.organizationId) {
      organization = await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { id: true, name: true }
      })
    }

    return NextResponse.json({ discResult, organization })
  } catch (error) {
    return NextResponse.json({ error: "Profile telemetry lost" }, { status: 500 })
  }
}
