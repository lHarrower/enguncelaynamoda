// Supabase Edge Function: AI Proxy (Deno)
// Purpose: Keep AI keys server-side. The client calls this function.
// Deploy: supabase functions deploy ai-proxy

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders } from '../_shared/cors.ts';
// Note: This proxy returns the raw OpenAI chat.completions JSON shape
// so that client code written against OpenAI SDK continues to work
// without code changes beyond switching the transport path.

// Note: corsHeaders sourced from shared; set ALLOWED_ORIGIN in prod.

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require Authorization header in production to prevent open abuse
    const authHeader = req.headers.get('Authorization');
    const requireAuth = (Deno.env.get('REQUIRE_AUTH_FOR_AI_PROXY') || 'true').toLowerCase() === 'true';
    if (requireAuth && !authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }
    const { provider = 'openai', ...payload } = await req.json().catch(() => ({}));

    if (provider === 'openai') {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders },
        });
      }

      // Minimal proxy for Chat Completions (OpenAI responses API)
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: payload.model || 'gpt-4o-mini',
          // If caller provided messages (including image parts), pass through; otherwise synthesize from prompt
          messages: Array.isArray(payload.messages)
            ? payload.messages
            : [{ role: 'user', content: payload.prompt || 'Hello' }],
          temperature: payload.temperature ?? 0.7,
          max_tokens: payload.max_tokens ?? 512,
        }),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }

    if (provider === 'huggingface') {
      const HF_TOKEN = Deno.env.get('HUGGINGFACE_TOKEN');
      if (!HF_TOKEN) {
        return new Response(JSON.stringify({ error: 'HUGGINGFACE_TOKEN not set' }), {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders },
        });
      }

      const model = payload.model || 'google/vit-base-patch16-224';
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload.inputs ? { inputs: payload.inputs } : payload),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }

    if (provider === 'openrouter') {
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
      if (!OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }), {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders },
        });
      }

      const referer = Deno.env.get('OPENROUTER_SITE_URL');
      const title = Deno.env.get('OPENROUTER_APP_NAME') || 'AYNAMODA';

      const model = payload.model || 'openrouter/auto';
      const body = {
        model,
        messages: payload.messages || [{ role: 'user', content: payload.prompt || 'Hello' }],
        temperature: payload.temperature ?? 0.7,
        max_tokens: payload.max_tokens ?? 512,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      };
      if (referer) headers['HTTP-Referer'] = referer;
      if (title) headers['X-Title'] = title;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported provider' }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders },
    });
  }
});
