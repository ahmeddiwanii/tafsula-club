import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/types/user';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== UserRole.HR) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, comment } = await request.json();
    const postId = params.id;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get the post
    const post = await prisma.organizationPost.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update post
    const updatedPost = await prisma.organizationPost.update({
      where: { id: postId },
      data: {
        status: action === 'approve' ? 'published' : 'rejected',
      },
    });

    // Notifications temporarily disabled until Prisma recognizes notification model
    // TODO: Re-enable after fixing Prisma client generation

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error approving post:', error);
    return NextResponse.json(
      { error: 'Failed to process post' },
      { status: 500 }
    );
  }
}
