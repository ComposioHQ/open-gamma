'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader } from '@/components/ui/loader';
import { ToolCallPreview } from './tool-call-preview';
import type { UIMessage } from 'ai';

interface ChatMessageProps {
  message: UIMessage;
}

interface TextPart {
  type: 'text';
  text: string;
}

interface ToolInvocationPart {
  type: 'tool-invocation';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

type MessagePart = TextPart | ToolInvocationPart | { type: string };

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  const parts = (message.parts || []) as MessagePart[];

  const text = parts
    .filter((p): p is TextPart => p.type === 'text')
    .map((p) => p.text)
    .join('');

  const toolParts = parts.filter(
    (p): p is ToolInvocationPart => p.type === 'tool-invocation'
  );

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-ui-secondary text-tx-primary' : 'bg-transparent pl-0'
        }`}
      >
        {text ? (
          <ReactMarkdown
            className="text-tx-primary text-sm leading-relaxed space-y-1 [&_*]:font-inherit [&_strong]:font-semibold [&_em]:italic [&_code]:font-mono [&_code]:bg-ui-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:list-disc [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_li]:mb-1 [&_li]:pl-1"
            components={{
              a: ({ ...props }) => (
                <a
                  {...props}
                  className={`text-blue-600 hover:underline break-words ${props.className ?? ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        ) : (
          !isUser &&
          toolParts.length === 0 && (
            <div className="flex items-center gap-2 py-2">
              <Loader variant="typing" size="sm" />
              <span className="text-xs text-tx-secondary">Thinking...</span>
            </div>
          )
        )}

        {toolParts.map((toolPart) => (
            <div key={toolPart.toolCallId} className="mt-2">
              <ToolCallPreview toolPart={toolPart} />
            </div>
        ))}
      </div>
    </div>
  );
}
