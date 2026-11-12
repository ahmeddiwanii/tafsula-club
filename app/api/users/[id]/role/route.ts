import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const userId = params.id
    const { role, organizationId } = await req.json()
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }
    // Only allow valid roles
    const validRoles = ["SUPERADMIN", "HR", "MEMBER"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    // If HR or MEMBER, organizationId is required
    if ((role === "HR" || role === "MEMBER") && !organizationId) {
      return NextResponse.json({ error: "Organization is required for this role" }, { status: 400 })
    }
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        organizationId: (role === "HR" || role === "MEMBER") ? organizationId : null,
      },
    })
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("Role update error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
