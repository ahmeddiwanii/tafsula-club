import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { prisma } from "../../../../../lib/db"
import type { NextRequest } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { galleryImagesJson: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const images = Array.isArray(event.galleryImagesJson) ? event.galleryImagesJson : []
    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params
    const formData = await req.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, galleryImagesJson: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check authorization
    if (event.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Note: In production, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll store as base64 or URLs
    const currentImages = Array.isArray(event.galleryImagesJson) ? event.galleryImagesJson : []
    const newImages = [...currentImages]

    // Process each file
    for (const file of files) {
      if (file instanceof File) {
        // Read file as base64 or URL
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        const dataUrl = `data:${file.type};base64,${base64}`
        
        newImages.push({
          url: dataUrl,
          uploadedAt: new Date().toISOString(),
        })
      }
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { galleryImagesJson: newImages },
      select: { galleryImagesJson: true },
    })

    return NextResponse.json(updated.galleryImagesJson, { status: 201 })
  } catch (error) {
    console.error("Error uploading gallery images:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { id: eventId } = await params
    const body = await req.json()
    const { imageUrl } = body

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true, galleryImagesJson: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.createdById !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const currentImages = Array.isArray(event.galleryImagesJson) ? event.galleryImagesJson : []
    const filteredImages = currentImages.filter((img: any) => img.url !== imageUrl)

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { galleryImagesJson: filteredImages },
      select: { galleryImagesJson: true },
    })

    return NextResponse.json(updated.galleryImagesJson)
  } catch (error) {
    console.error("Error deleting gallery image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
