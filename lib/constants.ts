export const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4.1', name: 'GPT-4.1', provider: 'openai' },
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', provider: 'openai' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'anthropic/claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'anthropic/claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

export const DEFAULT_MODEL: ModelId = 'openai/gpt-5.2';

// Local storage keys
export const STORAGE_KEYS = {
  messages: 'open-gamma:chat:messages',
  input: 'open-gamma:chat:input',
  model: 'open-gamma:chat:model',
} as const;

