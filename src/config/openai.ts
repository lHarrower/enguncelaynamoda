// OpenAI Configuration - Optimized with dynamic imports
import { shouldUseAiProxy } from '@/config/aiProxy';
import { errorInDev, warnInDev } from '@/utils/consoleSuppress';

let OpenAI: typeof import('openai').default | null = null;
let openaiClientInstance: import('openai').default | null = null;

// Lazy load OpenAI only when needed
const getOpenAIClient = async () => {
  if (!openaiClientInstance) {
    try {
      if (!OpenAI) {
        const OpenAIModule = await import('openai');
        OpenAI = OpenAIModule.default;
      }

      const proxyOn = shouldUseAiProxy();
      const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

      // Only warn about missing key when not using the ai-proxy
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY && !proxyOn) {
        errorInDev('EXPO_PUBLIC_OPENAI_API_KEY is not set');
      }

      openaiClientInstance = new OpenAI({
        // When proxy is enabled, we never use this client in production paths,
        // so keep a benign dummy key to satisfy SDK instantiation and tests.
        apiKey: proxyOn
          ? 'sk-proxy'
          : process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'dummy-key-for-testing',
        // Allow in dev/test; in production, prefer proxy and do not allow browser usage
        dangerouslyAllowBrowser: !isProd,
      });
    } catch (error) {
      warnInDev('Failed to initialize OpenAI client:', error);
      // Return a mock client for graceful degradation
      return createMockOpenAIClient();
    }
  }
  return openaiClientInstance;
};

interface ChatCompletionParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

// Mock OpenAI client for development and error cases
const createMockOpenAIClient = () => ({
  chat: {
    completions: {
      create: async (params: ChatCompletionParams) => {
        warnInDev('OpenAI client not available, using mock response');
        return {
          choices: [
            {
              message: {
                content: 'Mock response - OpenAI client not available',
              },
            },
          ],
        };
      },
    },
  },
});

// For backward compatibility - lazy initialization
export const openaiClient = {
  get chat() {
    return {
      completions: {
        create: async (params: ChatCompletionParams) => {
          const client = await getOpenAIClient();
          return client.chat.completions.create(params);
        },
      },
    };
  },
};

export { getOpenAIClient };
export default openaiClient;
