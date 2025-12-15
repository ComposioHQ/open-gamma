import { useState, useCallback, useEffect } from 'react';
import type { Chat, TypedUIMessage } from '@/lib/types';

interface UseChatHistoryReturn {
  chats: Chat[];
  currentChatId: string | null;
  isLoadingChats: boolean;
  isSaving: boolean;
  error: string | null;
  fetchChats: () => Promise<void>;
  createChat: (model?: string) => Promise<Chat | null>;
  selectChat: (chatId: string) => Promise<TypedUIMessage[]>;
  deleteChat: (chatId: string) => Promise<void>;
  saveMessages: (chatId: string, messages: TypedUIMessage[]) => Promise<void>;
  setCurrentChatId: (chatId: string | null) => void;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    setIsLoadingChats(true);
    setError(null);
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      setChats(data.chats || []);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError('Failed to load chat history');
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const createChat = useCallback(async (model?: string): Promise<Chat | null> => {
    setError(null);
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      const data = await response.json();
      const newChat = data.chat as Chat;
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      
      return newChat;
    } catch (err) {
      console.error('Failed to create chat:', err);
      setError('Failed to create new chat');
      return null;
    }
  }, []);

  const selectChat = useCallback(async (chatId: string): Promise<TypedUIMessage[]> => {
    setCurrentChatId(chatId);
    setError(null);
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }
      const data = await response.json();
      return data.chat?.messages || [];
    } catch (err) {
      console.error('Failed to fetch chat:', err);
      setError('Failed to load chat');
      return [];
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string): Promise<void> => {
    setError(null);
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      setError('Failed to delete chat');
    }
  }, [currentChatId]);

  const saveMessages = useCallback(async (chatId: string, messages: TypedUIMessage[]): Promise<void> => {
    if (messages.length === 0) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      
      if (response.status === 404) {
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to save messages');
      }
      await fetchChats();
    } catch (err) {
      console.error('Failed to save messages:', err);
    } finally {
      setIsSaving(false);
    }
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    currentChatId,
    isLoadingChats,
    isSaving,
    error,
    fetchChats,
    createChat,
    selectChat,
    deleteChat,
    saveMessages,
    setCurrentChatId,
  };
}

