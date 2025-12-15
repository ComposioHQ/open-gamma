'use client';

import React from 'react';

interface ToolPart {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolCallPreviewProps {
  toolPart: ToolPart;
}

export function ToolCallPreview({ toolPart }: ToolCallPreviewProps) {
  const { toolName, args, state, result } = toolPart;

  // Don't show preview_deck here, it has its own UI
  if (toolName === 'preview_deck') return null;

  return (
    <div className="my-2 p-3 bg-ui-secondary/50 rounded-lg border border-ui-border text-xs font-mono overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-tx-secondary uppercase tracking-wider text-[10px]">
            Tool Call
          </span>
           <span className="font-bold text-tx-primary">{toolName}</span>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
            state === 'result'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}
        >
          {state === 'result' ? 'Completed' : 'Running'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
           <div className="text-tx-secondary mb-1 text-[10px] select-none">Input</div>
           <pre className="bg-ui-card p-2 rounded overflow-x-auto text-tx-primary/80 whitespace-pre-wrap break-all">
             {JSON.stringify(args, null, 2)}
           </pre>
        </div>
        
        {state === 'result' && (
           <div>
             <div className="text-tx-secondary mb-1 text-[10px] select-none">Output</div>
             <pre className="bg-ui-card p-2 rounded overflow-x-auto text-tx-primary/80 max-h-40 whitespace-pre-wrap break-all">
               {JSON.stringify(result, null, 2)}
             </pre>
           </div>
        )}
      </div>
    </div>
  );
}
