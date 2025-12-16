import type { UIMessage } from "ai";

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UIMessagePart =
  | { type: "text"; text: string }
  | {
      type: "tool-invocation";
      toolCallId: string;
      toolName: string;
      args: Record<string, unknown>;
      state: string;
      result?: unknown;
    }
  | { type: "file"; mimeType: string; url: string };

export interface TypedUIMessage extends Omit<UIMessage, "parts"> {
  id: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
  createdAt?: Date;
}

export interface ChatWithMessages extends Chat {
  messages: TypedUIMessage[];
}

export interface CreateChatRequest {
  title?: string;
  model?: string;
}

export interface UpdateChatRequest {
  title?: string;
  model?: string;
}

export function extractTextContent(parts: UIMessagePart[]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}
