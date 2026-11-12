import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import crypto from "crypto"
import { hash } from "bcryptjs"

import { authOptions, UserRole } from "../../../../lib/auth"
import { prisma } from "../../../../lib/db"
import { sendInviteEmail } from "../../../../lib/email"
import { setMemberStatus } from "../../../../lib/member-status-db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== UserRole.SUPERADMIN && session.user.role !== UserRole.HR)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { name, email, role, organizationId } = await req.json()
    let finalRole = role
    let finalOrganizationId = organizationId
    // HR can only invite MEMBER to their own organization
    if (session.user.role === UserRole.HR) {
      finalRole = UserRole.MEMBER
      finalOrganizationId = session.user.organizationId
    }
    // Validate role
    if (!finalRole || !Object.values(UserRole).includes(finalRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    // Validate organizationId for MEMBER/HR
    if ((finalRole === UserRole.MEMBER || finalRole === UserRole.HR) && !finalOrganizationId) {
      return NextResponse.json({ error: "Organization is required for this role" }, { status: 400 })
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 })
    }
    // Generate a random password (should be sent to the user)
    const generatedPassword = crypto.randomBytes(8).toString("base64")
    const hashedPassword = await hash(generatedPassword, 10)
    // Create user
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        role: finalRole,
        organizationId: finalOrganizationId,
        invitedById: session.user.id,
        updatedAt: new Date(),
      },
    })

    // Invited members still wait for club approval (same as join requests)
    if (finalRole === UserRole.MEMBER && finalOrganizationId) {
      try {
        await setMemberStatus(user.id, "AWAITING_HR")
        await prisma.organizationMembership.upsert({
          where: {
            userId_organizationId: { userId: user.id, organizationId: finalOrganizationId },
          },
          create: {
            userId: user.id,
            organizationId: finalOrganizationId,
            role: "MEMBER",
            status: "AWAITING_HR",
            invitedById: session.user.id,
            answersJson: { via: "email_invite" },
          },
          update: {
            status: "AWAITING_HR",
            invitedById: session.user.id,
            updatedAt: new Date(),
          },
        })
      } catch (e) {
        console.warn("[invite] Could not set membership awaiting HR:", e)
      }
    }
    try {
      await sendInviteEmail({ to: email, password: generatedPassword })
    } catch (emailErr: any) {
      console.error("Failed to send invite email:", emailErr)
      return NextResponse.json({ error: "User created, but failed to send email: " + (emailErr?.message || emailErr) }, { status: 500 })
    }
    // Never return the temporary password in the API response
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Invitation error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
