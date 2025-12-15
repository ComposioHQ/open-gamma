'use client';

import React, { useRef, useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { AVAILABLE_MODELS } from '@/lib/constants';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (event: FormEvent) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  compact?: boolean;
}

export function ChatInput({ input, setInput, isLoading, onSubmit, selectedModel, setSelectedModel, compact = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className={`w-full bg-ui-card border border-ui-border shadow-sm transition-all duration-200 ${compact ? 'rounded-lg' : 'rounded-xl'}`}>
      <form onSubmit={onSubmit} className="flex flex-col relative">
        <div className={compact ? 'p-2 px-3' : 'p-4'}>
          <textarea
            ref={textareaRef}
            className={`w-full bg-transparent border-none outline-none resize-none text-tx-primary placeholder:text-tx-secondary/50 ${compact ? 'text-sm min-h-[36px]' : 'text-lg min-h-[60px]'}`}
            placeholder={compact ? "Type a message..." : "Describe the presentation you want to create..."}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>
        
        <div className={`flex items-center justify-between border-t border-ui-border/50 bg-ui-card/50 relative z-20 ${compact ? 'px-2 py-1.5 rounded-b-lg' : 'px-3 py-2 rounded-b-xl'}`}>
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1 px-2 py-1 bg-ui-secondary rounded-md text-xs font-medium text-tx-secondary cursor-pointer hover:bg-ui-border transition-colors select-none"
              >
                 <span>✨ {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name ?? selectedModel.split('/').pop()}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              
              {showModelDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-ui-card border border-ui-border rounded-lg shadow-lg overflow-hidden py-1 z-30">
                  {AVAILABLE_MODELS.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelDropdown(false);
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-ui-secondary text-tx-primary ${
                        selectedModel === model.id ? 'bg-ui-secondary font-medium' : ''
                      }`}
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className="text-tx-secondary ml-2 text-[10px]">{model.provider}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className={`bg-tx-primary text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed ${compact ? 'p-1.5 rounded-md' : 'p-2 rounded-lg'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "14" : "16"} height={compact ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
}


