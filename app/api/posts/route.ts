import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/db"
import { UserRole } from "../../../types/user"
import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const approved = searchParams.get('approved') === 'true';
    
    const session = await getServerSession(authOptions);
    
    let where: any = {};
    if (approved) {
      where.status = 'published';
    }

    if (session?.user?.organizationId) {
      where.organizationId = session.user.organizationId;
    }

    const [posts, total] = await Promise.all([
      prisma.organizationPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          comments: { select: { id: true, content: true, author: { select: { id: true, name: true } } } },
          likes: { select: { userId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.organizationPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, limit, offset });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== UserRole.HR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.organizationId) {
    return NextResponse.json({ error: "No organization assigned" }, { status: 400 })
  }

  const { title, content, imageUrl } = await req.json()

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  try {
    const post = await prisma.organizationPost.create({
      data: {
        organizationId: session.user.organizationId,
        title,
        content,
        imageUrl: imageUrl || null,
        authorId: session.user.id,
        status: "published",
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      post,
      message: "Post created successfully and visible to all team members!",
    })
  } catch (error: any) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    )
  }
}
