import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats, chatMessages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractTextContent, type TypedUIMessage, type UIMessagePart } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SaveMessagesRequest {
  messages: TypedUIMessage[];
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: chatId } = await params;

  try {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)));

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const body: SaveMessagesRequest = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    await db.delete(chatMessages).where(eq(chatMessages.chatId, chatId));

    const messagesToInsert = messages.map((m) => ({
      id: m.id,
      chatId,
      role: m.role as "user" | "assistant" | "system",
      content: extractTextContent(m.parts),
      parts: m.parts as UIMessagePart[],
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
    }));

    await db.insert(chatMessages).values(messagesToInsert);

    let newTitle: string | null = null;
    if (chat.title === "New Chat" && messages.length > 0) {
      const firstUserMessage = messages.find((m) => m.role === "user");
      if (firstUserMessage) {
        newTitle = generateTitle(extractTextContent(firstUserMessage.parts));
        await db
          .update(chats)
          .set({ title: newTitle, updatedAt: new Date() })
          .where(eq(chats.id, chatId));
      }
    } else {
      await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));
    }

    return NextResponse.json({ success: true, messageCount: messages.length, title: newTitle });
  } catch (error) {
    console.error("Failed to save messages:", error);
    return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
  }
}

function generateTitle(content: string): string {
  const cleaned = content.trim().replace(/\n/g, " ");
  return cleaned.length <= 50 ? cleaned : cleaned.substring(0, 47) + "...";
}
