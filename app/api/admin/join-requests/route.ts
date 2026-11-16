import { getAuthSession } from "@/lib/request-auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getAuthSession()
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
