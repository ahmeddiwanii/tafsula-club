import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { sendInviteEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

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

    // Generate org id and password
    const orgId = uuidv4()
    const rawPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(rawPassword, 10)
    const userId = uuidv4()

    // Transaction
    await prisma.$transaction(async (tx) => {
      // Create Organization
      const org = await tx.organization.create({
        data: {
          id: orgId,
          name: request.orgName,
          createdById: session.user.id,
        }
      })
      
      // Create Organization Profile
      await tx.organizationProfile.create({
         data: {
           organizationId: orgId,
           contactEmail: request.contactEmail,
           contactPhone: request.contactPhone,
           website: request.websiteUrl,
           bio: request.description,
         }
      })

      // Create HR User
      await tx.user.create({
        data: {
          id: userId,
          name: request.contactName,
          email: request.contactEmail,
          password: hashedPassword,
          role: "HR",
          organizationId: orgId,
          memberStatus: "ACCEPTED",
          updatedAt: new Date()
        }
      })

      // Update Request
      await tx.organizationJoinRequest.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: session.user.id
        }
      })
    })

    // Send email
    await sendInviteEmail({
      to: request.contactEmail,
      password: rawPassword,
    })

    return new NextResponse("Approved", { status: 200 })
  } catch (error) {
    console.error("[APPROVE_JOIN_REQUEST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
