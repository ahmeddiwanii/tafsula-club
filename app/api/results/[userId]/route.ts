import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params
  const { userId } = params
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const isSuperadmin = session.user.role === "SUPERADMIN"
    const isHR = session.user.role === "HR"

    const isOwner = session.user.id === userId

    if (!isOwner && !isSuperadmin && (!isHR || !session.user.organizationId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (isHR) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || user.organizationId !== session.user.organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    const [result, insight] = await Promise.all([
      prisma.result.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.insight.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({ result, insight })
  } catch (error) {
    console.error("Results fetch error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
