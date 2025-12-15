import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { chats, chatMessages } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import type { Chat, ChatWithMessages, TypedUIMessage, UpdateChatRequest, UIMessagePart } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)));

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, id))
      .orderBy(asc(chatMessages.createdAt));

    const typedMessages: TypedUIMessage[] = messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      parts: m.parts as UIMessagePart[],
      createdAt: m.createdAt,
    }));

    const chatWithMessages: ChatWithMessages = {
      ...(chat as Chat),
      messages: typedMessages,
    };

    return NextResponse.json({ chat: chatWithMessages });
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body: UpdateChatRequest = await req.json();

    const [updatedChat] = await db
      .update(chats)
      .set({
        ...(body.title && { title: body.title }),
        ...(body.model && { model: body.model }),
        updatedAt: new Date(),
      })
      .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)))
      .returning();

    if (!updatedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ chat: updatedChat as Chat });
  } catch (error) {
    console.error('Failed to update chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deletedChat] = await db
      .delete(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)))
      .returning();

    if (!deletedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}

