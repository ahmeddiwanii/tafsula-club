import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET - Fetch contacts for current user's organization
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const onlyGeneral = searchParams.get("general") === "true"
        const addedById = searchParams.get("addedById")

        const where: any = { organizationId: session.user.organizationId }

        if (onlyGeneral) {
            where.isGeneral = true
        }

        if (addedById) {
            where.addedById = addedById
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { organization: { contains: search } },
                { role: { contains: search } },
            ]
        }

        const contacts = await prisma.contact.findMany({
            where,
            include: {
                addedBy: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ contacts })
    } catch (error) {
        console.error("Error fetching contacts:", error)
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
    }
}

// POST - Create a new contact
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, email, phone, organization, role, description, howMet, tags, isGeneral } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        // Only HR can create general contacts directly
        const isHR = session.user.role === "HR" || session.user.role === "SUPERADMIN"
        const finalIsGeneral = isHR ? (isGeneral ?? false) : false

        const contact = await prisma.contact.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                organization: organization || null,
                role: role || null,
                description: description || null,
                howMet: howMet || null,
                tags: tags || null,
                isGeneral: finalIsGeneral,
                organizationId: session.user.organizationId,
                addedById: session.user.id,
            },
            include: {
                addedBy: { select: { id: true, name: true, email: true } },
            },
        })

        return NextResponse.json({ contact })
    } catch (error) {
        console.error("Error creating contact:", error)
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
    }
}

// PATCH - Update a contact
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
        }

        // Verify the contact belongs to this organization
        const existing = await prisma.contact.findFirst({
            where: { id, organizationId: session.user.organizationId },
        })

        if (!existing) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 })
        }

        // Only HR or the creator can edit
        const isHR = session.user.role === "HR" || session.user.role === "SUPERADMIN"
        if (!isHR && existing.addedById !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to edit this contact" }, { status: 403 })
        }

        const contact = await prisma.contact.update({
            where: { id },
            data: updateData,
            include: {
                addedBy: { select: { id: true, name: true, email: true } },
            },
        })

        return NextResponse.json({ contact })
    } catch (error) {
        console.error("Error updating contact:", error)
        return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
    }
}

// DELETE - Delete a contact
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || !session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Contact ID is required" }, { status: 400 })
        }

        const existing = await prisma.contact.findFirst({
            where: { id, organizationId: session.user.organizationId },
        })

        if (!existing) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 })
        }

        const isHR = session.user.role === "HR" || session.user.role === "SUPERADMIN"
        if (!isHR && existing.addedById !== session.user.id) {
            return NextResponse.json({ error: "Not authorized to delete this contact" }, { status: 403 })
        }

        await prisma.contact.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting contact:", error)
        return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
    }
}
