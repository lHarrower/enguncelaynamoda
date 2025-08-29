// Simple smoke test for ai-proxy via Supabase Functions
// Usage:
//  - Ensure env vars are set: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
//  - npm run ai:smoke:or   # OpenRouter text completion
//  - npm run ai:smoke:vision  # OpenAI vision completion

// Load .env if present
try {
  require('dotenv').config();
} catch {}

const { createClient } = require('@supabase/supabase-js');

function getEnv(name, alt) {
  return process.env[name] || process.env[alt] || '';
}

const SUPABASE_URL = getEnv('EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
const SUPABASE_ANON = getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error(
    'Missing Supabase envs. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function smokeOpenRouter() {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      provider: 'openrouter',
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: 'Say "pong".' }],
      temperature: 0.1,
      max_tokens: 20,
    },
  });
  if (error) {
    try {
      const body = await error.context.json();
      
    } catch {}
    throw error;
  }
  const content = data?.choices?.[0]?.message?.content;
  
}

async function smokeVision() {
  const imageUrl = 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=640&q=60';
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      provider: 'openai',
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What object is in this image? Answer in one word.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 20,
    },
  });
  if (error) {
    try {
      const body = await error.context.json();
      
    } catch {}
    throw error;
  }
  const content = data?.choices?.[0]?.message?.content;
  
}

async function main() {
  const mode = process.argv[2] || 'or';
  try {
    if (mode === 'vision') {
      await smokeVision();
    } else {
      await smokeOpenRouter();
    }
    process.exit(0);
  } catch (e) {
    
    process.exit(2);
  }
}

main();
