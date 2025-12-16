"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, FormEvent, useCallback, useRef } from "react";
import { Loader } from "@/components/ui/loader";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS, DEFAULT_MODEL } from "@/lib/constants";
import { extractTextContent, type TypedUIMessage, type UIMessagePart } from "@/lib/types";

export default function Chat() {
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
    STORAGE_KEYS.model,
    DEFAULT_MODEL
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>(
    "open-gamma:sidebar:collapsed",
    false
  );
  const [input, setInput] = useState("");
  const [pptUrl, setPptUrl] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string>("session-" + Date.now());
  const isLoadingExistingChat = useRef(false);

  const { chats, isLoadingChats, createChat, selectChat, deleteChat, saveMessages } =
    useChatHistory();

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error: chatError,
  } = useChat({
    id: chatSessionId,
  });

  const isLoading = status === "submitted" || status === "streaming";
  const saveMessagesRef = useRef(saveMessages);
  saveMessagesRef.current = saveMessages;

  useEffect(() => {
    if (isLoadingExistingChat.current) {
      isLoadingExistingChat.current = false;
      return;
    }
    if (!activeChatId || messages.length === 0 || isLoading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const typed: TypedUIMessage[] = messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: (m.parts ?? []) as UIMessagePart[],
        createdAt: new Date(),
      }));
      saveMessagesRef.current(activeChatId, typed);
    }, 1000);
  }, [messages, activeChatId, isLoading]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      const content = extractTextContent((lastMessage.parts ?? []) as UIMessagePart[]);
      const match = content.match(/https:\/\/docs\.google\.com\/presentation\/d\/[a-zA-Z0-9-_]+/);
      if (match) setPptUrl(match[0]);
    }
  }, [messages]);

  const handleSelectChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId);
      setChatSessionId("session-" + Date.now());
      const chatMessages = await selectChat(chatId);
      isLoadingExistingChat.current = true;
      setMessages(chatMessages as typeof messages);
      setPptUrl(null);
    },
    [selectChat, setMessages]
  );

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setChatSessionId("session-" + Date.now());
    setMessages([]);
    setInput("");
    setPptUrl(null);
  }, [setMessages]);

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      await deleteChat(chatId);
      if (chatId === activeChatId) {
        setActiveChatId(null);
        setChatSessionId("session-" + Date.now());
        setMessages([]);
        setPptUrl(null);
      }
    },
    [deleteChat, activeChatId, setMessages]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (isLoading) return;
      const trimmed = input.trim();
      if (!trimmed) return;

      let chatId = activeChatId;
      if (!chatId) {
        const newChat = await createChat(selectedModel);
        if (!newChat) return;
        chatId = newChat.id;
        setActiveChatId(chatId);
      }

      setInput("");
      await sendMessage({ text: trimmed }, { body: { model: selectedModel } });
    },
    [input, activeChatId, createChat, selectedModel, sendMessage, isLoading]
  );

  const quickActions = [
    { label: "Create a pitch deck" },
    { label: "Build a sales presentation" },
    { label: "Design a product launch deck" },
    { label: "Generate a quarterly review" },
  ];

  const isEmptyState = messages.length === 0 && !activeChatId;

  const sidebar = (
    <ChatSidebar
      chats={chats}
      currentChatId={activeChatId}
      onSelectChat={handleSelectChat}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      isLoading={isLoadingChats}
    />
  );

  if (isEmptyState) {
    return (
      <div className="h-screen w-full flex bg-ui-card font-sans overflow-hidden">
        {sidebar}

        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-8 text-tx-primary text-center">
            What presentation do you want to create?
          </h1>

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />

          <div className="mt-6 flex gap-2 justify-center">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setInput(action.label)}
                className="flex items-center gap-2 px-4 py-2 bg-ui-secondary border border-ui-border rounded-full text-sm text-tx-secondary hover:bg-ui-border hover:text-tx-primary transition-all whitespace-nowrap"
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-ui-card font-sans overflow-hidden">
      {sidebar}

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-ui-card relative z-10 transition-all duration-300 ${
          pptUrl ? "md:w-[400px] lg:w-[450px]" : ""
        }`}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pb-32">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {/* Error State */}
          {chatError && (
            <div className="flex justify-start mb-6">
              <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-red-50 border border-red-200">
                <div className="font-bold mb-1 font-serif text-sm text-red-800">Error</div>
                <div className="text-sm text-red-700">
                  {chatError.message || "Failed to get response from agent"}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex justify-start mb-6">
              <div className="max-w-[90%] rounded-2xl px-4 py-3 bg-transparent pl-0">
                <div className="font-bold mb-1 font-serif text-sm text-[var(--color-syntax-string)]">
                  Agent
                </div>
                <div className="flex items-center gap-2 py-2">
                  <Loader variant="typing" size="sm" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-ui-card border-t border-transparent">
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            compact
          />
        </div>
      </div>

      {/* Right: Preview Pane */}
      {pptUrl && (
        <div className="hidden md:flex flex-1 bg-zinc-950 items-center justify-center relative overflow-hidden animate-in fade-in duration-500">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="w-full h-full bg-black shadow-2xl border-l border-white/10 flex flex-col overflow-hidden relative z-10">
            <div className="h-10 bg-zinc-900 border-b border-white/5 flex items-center px-4 justify-between select-none">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                Live Preview
              </div>
              <button
                onClick={() => setPptUrl(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 bg-white relative">
              <iframe src={pptUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
