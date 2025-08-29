// aiProxy client helper
// Invokes the Supabase Edge Function 'ai-proxy' to keep AI keys server-side.
import { supabase } from '@/config/supabaseClient';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
};

export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  provider?: 'openai' | 'openrouter' | 'huggingface';
}

export async function aiProxyChatCompletion(params: ChatCompletionParams) {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      provider: params.provider || 'openrouter',
      ...params,
    },
  });

  if (error) {
    throw error;
  }
  return data;
}

export function shouldUseAiProxy(): boolean {
  // Default to true unless explicitly disabled
  // In tests, default to false so Jest mocks for OpenAI still work
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    return false;
  }
  const flag = process.env.EXPO_PUBLIC_USE_AI_PROXY;
  if (flag === undefined) {
    return true;
  }
  return String(flag).toLowerCase() === 'true';
}
