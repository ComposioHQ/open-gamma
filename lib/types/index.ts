import type { UIMessage } from 'ai';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageDB {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts: UIMessagePart[];
  createdAt: Date;
}

export type UIMessagePart = 
  | { type: 'text'; text: string }
  | { type: 'tool-invocation'; toolCallId: string; toolName: string; args: Record<string, unknown>; state: string; result?: unknown }
  | { type: 'file'; mimeType: string; url: string };

export interface TypedUIMessage extends Omit<UIMessage, 'parts'> {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: UIMessagePart[];
  createdAt?: Date;
}

export interface ChatWithMessages extends Chat {
  messages: TypedUIMessage[];
}

export interface ChatListResponse {
  chats: Chat[];
}

export interface ChatResponse {
  chat: ChatWithMessages;
}

export interface CreateChatRequest {
  title?: string;
  model?: string;
}

export interface UpdateChatRequest {
  title?: string;
  model?: string;
}
