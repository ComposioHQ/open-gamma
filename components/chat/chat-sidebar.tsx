"use client";

import { useState } from "react";
import type { Chat } from "@/lib/types";

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLoading: boolean;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isCollapsed,
  onToggleCollapse,
  isLoading,
}: ChatSidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  if (isCollapsed) {
    return (
      <div className="h-full w-12 bg-ui-secondary border-r border-ui-border flex flex-col items-center pt-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-ui-border rounded-lg text-tx-secondary hover:text-tx-primary transition-colors mb-3"
          title="Expand sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button
          onClick={onNewChat}
          className="p-2 hover:bg-ui-border rounded-lg text-tx-secondary hover:text-tx-primary transition-colors"
          title="New chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-64 bg-ui-secondary border-r border-ui-border flex flex-col shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-ui-border flex items-center justify-between px-3 shrink-0">
        <span className="font-serif font-bold text-tx-primary text-sm">Chats</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="p-1.5 hover:bg-ui-border rounded-lg text-tx-secondary hover:text-tx-primary transition-colors"
            title="New chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-ui-border rounded-lg text-tx-secondary hover:text-tx-primary transition-colors"
            title="Collapse sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-3 py-8 text-center text-tx-secondary text-xs">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="px-3 py-8 text-center text-tx-secondary text-xs">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? "bg-ui-border text-tx-primary"
                    : "hover:bg-ui-card text-tx-secondary hover:text-tx-primary"
                }`}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
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
                  className="shrink-0 opacity-50"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs truncate flex-1">{chat.title}</span>

                {/* Delete button */}
                {hoveredChatId === chat.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-tx-secondary hover:text-red-600 transition-colors"
                    title="Delete chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-ui-border py-2 px-3">
        <div className="text-[10px] text-tx-secondary text-center">
          {chats.length} chat{chats.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
