import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { ensureUserExists } from '@/lib/db/utils';
import { eq, desc } from 'drizzle-orm';
import type { Chat, CreateChatRequest } from '@/lib/types';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, session.user.id))
      .orderBy(desc(chats.updatedAt));

    return NextResponse.json({ chats: userChats as Chat[] });
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUserExists(session.user.id);

    const body: CreateChatRequest = await req.json();
    
    const [newChat] = await db
      .insert(chats)
      .values({
        userId: session.user.id,
        title: body.title || 'New Chat',
        model: body.model || null,
      })
      .returning();

    return NextResponse.json({ chat: newChat as Chat }, { status: 201 });
  } catch (error) {
    console.error('Failed to create chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

