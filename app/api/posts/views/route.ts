import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Track view using raw SQL until Prisma recognizes postView model
    await prisma.$executeRaw`
      INSERT INTO postView (id, postId, userId, viewedAt)
      VALUES (${Math.random().toString(36).substring(7)}, ${postId}, ${session.user.id}, NOW())
      ON DUPLICATE KEY UPDATE viewedAt = NOW()
    `;

    return NextResponse.json({ success: true, view: { postId, userId: session.user.id } })
  } catch (error: any) {
    console.error("Error tracking post view:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("postId")

  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
  }

  try {
    // Fetch views using raw SQL until Prisma recognizes postView model
    const views = await prisma.$queryRaw`
      SELECT pv.id, pv.postId, pv.userId, pv.viewedAt, u.id as user_id, u.name as user_name, u.email as user_email
      FROM postView pv
      JOIN \`user\` u ON pv.userId = u.id
      WHERE pv.postId = ${postId}
      ORDER BY pv.viewedAt DESC
    ` as any[];

    // Transform the flat result into nested structure
    const formattedViews = views.map(v => ({
      id: v.id,
      postId: v.postId,
      userId: v.userId,
      viewedAt: v.viewedAt,
      user: {
        id: v.user_id,
        name: v.user_name,
        email: v.user_email,
      }
    }));

    return NextResponse.json({ views: formattedViews, total: formattedViews.length })
  } catch (error: any) {
    console.error("Error fetching post views:", error)
    return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 })
  }
}
