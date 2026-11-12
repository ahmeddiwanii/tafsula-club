import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const requests = await prisma.organizationJoinRequest.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("[FETCH_JOIN_REQUESTS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
