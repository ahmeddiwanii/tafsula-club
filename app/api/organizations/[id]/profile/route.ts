import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const profile = await prisma.organizationProfile.findUnique({
      where: { organizationId: params.id },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching organization profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    // Check if user is HR for this organization or SUPERADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
    })

    if (!user || (user.role !== "SUPERADMIN" && (user.role !== "HR" || user.organizationId !== params.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { profileImageUrl, coverImageUrl, bio, contactEmail, contactPhone, location, website, galleryImagesJson, isPublic } = body

    const profile = await prisma.organizationProfile.upsert({
      where: { organizationId: params.id },
      update: {
        profileImageUrl,
        coverImageUrl,
        bio,
        contactEmail,
        contactPhone,
        location,
        website,
        galleryImagesJson,
        isPublic,
      },
      create: {
        organizationId: params.id,
        profileImageUrl,
        coverImageUrl,
        bio,
        contactEmail,
        contactPhone,
        location,
        website,
        galleryImagesJson,
        isPublic,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error updating organization profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
