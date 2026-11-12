import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { UserRole } from "@/types/user"

async function canEditPost(userId: string, role: string, postId: string) {
  const post = await prisma.organizationPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, organizationId: true, title: true, content: true, imageUrl: true, status: true },
  })
  if (!post) return { post: null, allowed: false }

  if (role === UserRole.HR || role === UserRole.SUPERADMIN) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })
    return { post, allowed: !!user?.organizationId && user.organizationId === post.organizationId }
  }

  return { post, allowed: post.authorId === userId }
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const post = await prisma.organizationPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { post, allowed } = await canEditPost(session.user.id, session.user.role, id)
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const title = typeof body.title === "string" ? body.title.trim() : post.title
  const content = typeof body.content === "string" ? body.content.trim() : post.content
  const imageUrl = body.imageUrl === undefined ? post.imageUrl : body.imageUrl || null
  const status = typeof body.status === "string" ? body.status : post.status

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const updated = await prisma.organizationPost.update({
    where: { id },
    data: { title, content, imageUrl, status },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ post: updated })
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { post, allowed } = await canEditPost(session.user.id, session.user.role, id)
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.organizationPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
