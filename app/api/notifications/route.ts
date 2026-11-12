import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';

    const where = {
      userId: session.user.id,
      ...(unreadOnly && { read: false }),
    };

    // Using raw queries until Prisma recognizes notification model
    const notificationsResult = await prisma.$queryRaw`
      SELECT * FROM \`notification\` 
      WHERE userId = ${session.user.id} 
      ORDER BY createdAt DESC 
      LIMIT ${limit} OFFSET ${offset}
    ` as any[];
    
    const countResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM \`notification\` 
      WHERE userId = ${session.user.id}
    ` as any[];
    
    const notifications = notificationsResult;
    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      notifications,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, read } = await request.json();

    // Use raw query until Prisma recognizes notification model
    await prisma.$executeRaw`
      UPDATE \`notification\` 
      SET \`read\` = ${read}, readAt = ${read ? new Date() : null}
      WHERE id = ${id}
    `;
    
    const notification = await prisma.$queryRaw`
      SELECT * FROM \`notification\` WHERE id = ${id}
    ` as any;

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Use raw query until Prisma recognizes notification model
    await prisma.$executeRaw`
      DELETE FROM \`notification\` WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
