import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content } = await req.json()
    const { commentId } = await params

    if (!content) {
      return NextResponse.json({ error: "Reply content is required" }, { status: 400 })
    }

    // Create reply using raw SQL until Prisma recognizes commentReply model
    const replyId = Math.random().toString(36).substring(7);
    await prisma.$executeRaw`
      INSERT INTO commentReply (id, commentId, authorId, content, createdAt, updatedAt)
      VALUES (${replyId}, ${commentId}, ${session.user.id}, ${content}, NOW(), NOW())
    `;

    // Fetch the created reply
    const reply = await prisma.$queryRaw`
      SELECT cr.id, cr.commentId, cr.authorId, cr.content, cr.createdAt, cr.updatedAt,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM commentReply cr
      JOIN \`user\` u ON cr.authorId = u.id
      WHERE cr.id = ${replyId}
    ` as any[];

    const formattedReply = reply[0] ? {
      id: reply[0].id,
      commentId: reply[0].commentId,
      authorId: reply[0].authorId,
      content: reply[0].content,
      createdAt: reply[0].createdAt,
      updatedAt: reply[0].updatedAt,
      author: {
        id: reply[0].user_id,
        name: reply[0].user_name,
        email: reply[0].user_email,
      }
    } : null;

    return NextResponse.json(formattedReply, { status: 201 })
  } catch (error: any) {
    console.error("Error creating reply:", error)
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params

    // Fetch replies using raw SQL until Prisma recognizes commentReply model
    const replies = await prisma.$queryRaw`
      SELECT cr.id, cr.commentId, cr.authorId, cr.content, cr.createdAt, cr.updatedAt,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM commentReply cr
      JOIN \`user\` u ON cr.authorId = u.id
      WHERE cr.commentId = ${commentId}
      ORDER BY cr.createdAt ASC
    ` as any[];

    // Transform flat results into nested structure
    const formattedReplies = replies.map(r => ({
      id: r.id,
      commentId: r.commentId,
      authorId: r.authorId,
      content: r.content,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      author: {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email,
      }
    }));

    return NextResponse.json(formattedReplies)
  } catch (error: any) {
    console.error("Error fetching replies:", error)
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 })
  }
}
