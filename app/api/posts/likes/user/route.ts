import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const likes = await prisma.postLike.findMany({
      where: { userId: session.user.id },
      select: { postId: true },
    })

    const likedPostIds = likes.map((like) => like.postId)

    return NextResponse.json({ likedPostIds })
  } catch (error: any) {
    console.error("Error fetching liked posts:", error)
    return NextResponse.json({ error: "Failed to fetch liked posts" }, { status: 500 })
  }
}
