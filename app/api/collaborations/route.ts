import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import crypto from "crypto"

// Get organization collaboration info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // Get or create collaboration code
    let collaborationCode = await prisma.organizationCollaborationCode.findUnique({
      where: { organizationId: user.organizationId },
    })

    if (!collaborationCode) {
      // Generate unique code: ORG-XXXXXXXX
      let code = ""
      let isUnique = false
      while (!isUnique) {
        code = "ORG-" + crypto.randomBytes(6).toString("hex").toUpperCase().slice(0, 8)
        const existing = await prisma.organizationCollaborationCode.findUnique({
          where: { code },
        })
        isUnique = !existing
      }

      collaborationCode = await prisma.organizationCollaborationCode.create({
        data: {
          organizationId: user.organizationId,
          code,
        },
      })
    }

    // Get all collaboration requests (sent and received)
    const sentRequests = await prisma.collaborationRequest.findMany({
      where: { requesterOrganizationId: user.organizationId },
      include: {
        targetOrganization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const receivedRequests = await prisma.collaborationRequest.findMany({
      where: { targetOrganizationId: user.organizationId },
      include: {
        requesterOrganization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      collaborationCode: collaborationCode.code,
      sentRequests,
      receivedRequests,
    })
  } catch (error) {
    console.error("Failed to fetch collaboration info:", error)
    return NextResponse.json({ error: "Failed to fetch collaboration info" }, { status: 500 })
  }
}

// Send collaboration request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetCode, message } = await request.json()

    if (!targetCode) {
      return NextResponse.json({ error: "Target code is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // Find target organization by code
    const targetCollabCode = await prisma.organizationCollaborationCode.findUnique({
      where: { code: targetCode },
    })

    if (!targetCollabCode) {
      return NextResponse.json({ error: "Invalid collaboration code" }, { status: 404 })
    }

    if (targetCollabCode.organizationId === user.organizationId) {
      return NextResponse.json({ error: "Cannot send request to your own organization" }, { status: 400 })
    }

    // Check if request already exists
    const existingRequest = await prisma.collaborationRequest.findUnique({
      where: {
        requesterOrganizationId_targetOrganizationId: {
          requesterOrganizationId: user.organizationId,
          targetOrganizationId: targetCollabCode.organizationId,
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json({ error: "Collaboration request already exists" }, { status: 400 })
    }

    // Create collaboration request
    const newRequest = await prisma.collaborationRequest.create({
      data: {
        requesterOrganizationId: user.organizationId,
        targetOrganizationId: targetCollabCode.organizationId,
        message,
      },
      include: {
        targetOrganization: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(newRequest)
  } catch (error) {
    console.error("Failed to send collaboration request:", error)
    return NextResponse.json({ error: "Failed to send collaboration request" }, { status: 500 })
  }
}

// Handle collaboration request (accept/reject)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, action, responseMessage } = await request.json()

    if (!requestId || !["ACCEPTED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })

    // Verify this user can respond to the request
    const collabRequest = await prisma.collaborationRequest.findUnique({
      where: { id: requestId },
    })

    if (!collabRequest || collabRequest.targetOrganizationId !== user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update request
    const updatedRequest = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: {
        status: action === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
        respondedAt: new Date(),
        responseMessage,
      },
      include: {
        requesterOrganization: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("Failed to update collaboration request:", error)
    return NextResponse.json({ error: "Failed to update collaboration request" }, { status: 500 })
  }
}
