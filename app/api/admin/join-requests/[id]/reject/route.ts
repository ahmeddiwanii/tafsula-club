import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendRejectionEmail } from "@/lib/email"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const request = await prisma.organizationJoinRequest.findUnique({
      where: { id: params.id }
    })

    if (!request || request.status !== "PENDING") {
      return new NextResponse("Request not found or already processed", { status: 404 })
    }

    await prisma.organizationJoinRequest.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      }
    })

    await sendRejectionEmail({ to: request.contactEmail })
    
    return new NextResponse("Rejected", { status: 200 })
  } catch (error) {
    console.error("[REJECT_JOIN_REQUEST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
