import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, imageUrl, taggedUserIds } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User does not belong to an organization' },
        { status: 400 }
      );
    }

    // Create post
    const post = await prisma.organizationPost.create({
      data: {
        title,
        content,
        imageUrl,
        organizationId: user.organizationId,
        authorId: session.user.id,
        status: 'pending',
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Notifications temporarily disabled until Prisma recognizes notification model
    // TODO: Re-enable after fixing Prisma client generation

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
