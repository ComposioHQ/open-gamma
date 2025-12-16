import { useState, useCallback, useEffect } from "react";
import type { Chat, TypedUIMessage } from "@/lib/types";

interface UseChatHistoryReturn {
  chats: Chat[];
  isLoadingChats: boolean;
  createChat: (model?: string) => Promise<Chat | null>;
  selectChat: (chatId: string) => Promise<TypedUIMessage[]>;
  deleteChat: (chatId: string) => Promise<void>;
  saveMessages: (chatId: string, messages: TypedUIMessage[]) => Promise<void>;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const fetchChats = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setChats(data.chats);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const createChat = useCallback(async (model?: string): Promise<Chat | null> => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      if (!response.ok) throw new Error("Failed to create chat");
      const data = await response.json();
      const newChat = data.chat as Chat;
      setChats((prev) => [newChat, ...prev]);
      return newChat;
    } catch (err) {
      console.error("Failed to create chat:", err);
      return null;
    }
  }, []);

  const selectChat = useCallback(async (chatId: string): Promise<TypedUIMessage[]> => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch chat");
      const data = await response.json();
      return data.chat.messages;
    } catch (err) {
      console.error("Failed to fetch chat:", err);
      return [];
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete chat");
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  }, []);

  const saveMessages = useCallback(
    async (chatId: string, messages: TypedUIMessage[]): Promise<void> => {
      if (messages.length === 0) return;
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        if (response.status === 404) return;
        if (!response.ok) throw new Error("Failed to save messages");
        const data = await response.json();
        if (data.title) {
          // Only update if title actually changed to avoid re-renders
          setChats((prev) => {
            const chat = prev.find((c) => c.id === chatId);
            if (chat?.title === data.title) return prev;
            return prev.map((c) => (c.id === chatId ? { ...c, title: data.title } : c));
          });
        }
      } catch (err) {
        console.error("Failed to save messages:", err);
      }
    },
    []
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    isLoadingChats,
    createChat,
    selectChat,
    deleteChat,
    saveMessages,
  };
}
