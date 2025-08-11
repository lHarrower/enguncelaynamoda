// OpenAI Configuration
import OpenAI from 'openai';
import { errorInDev } from '@/utils/consoleSuppress';
import { shouldUseAiProxy } from '@/config/aiProxy';

// Only warn about missing key when not using the ai-proxy
if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY && !shouldUseAiProxy()) {
  errorInDev('EXPO_PUBLIC_OPENAI_API_KEY is not set');
}

const proxyOn = shouldUseAiProxy();
const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
export const openaiClient = new OpenAI({
  // When proxy is enabled, we never use this client in production paths,
  // so keep a benign dummy key to satisfy SDK instantiation and tests.
  apiKey: proxyOn ? 'sk-proxy' : (process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'dummy-key-for-testing'),
  // Allow in dev/test; in production, prefer proxy and do not allow browser usage
  dangerouslyAllowBrowser: !isProd,
});

export default openaiClient;