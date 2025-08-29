import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0?target=deno&dts';
// P0 Edge Security: add zod schema validation, request timeout, correlation IDs & structured logging
import { z } from 'https://esm.sh/zod@3.23.8';

import { corsHeaders } from '../_shared/cors.ts';

const ALLOWLIST = (
  Deno.env.get('AI_IMAGE_HOST_ALLOWLIST') ??
  'sntlqqerajehwgmjbkgw.supabase.co,res.cloudinary.com,placehold.co,images.unsplash.com,i.imgur.com'
)
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const InputSchema = z.object({
  imageUrl: z.string().url(),
  itemId: z.string().uuid(),
});

Deno.serve(async (req: Request) => {
  const started = Date.now();
  const requestId = crypto.randomUUID();
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });

  try {
    // ---- ENV
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')!;
    const uploadPreset = Deno.env.get('CLOUDINARY_UPLOAD_PRESET')!;

    // ---- AUTH
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(jwt);
    if (authErr || !user) {
      return json(401, {
        ok: false,
        stage: 'auth',
        message: 'Auth session missing or invalid',
        detail: authErr?.message ?? null,
      });
    }

    // ---- INPUT
    const rawBody = await req.json().catch(() => ({}));
    const parsed = InputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return json(400, {
        ok: false,
        stage: 'input_validation',
        requestId,
        errors: parsed.error.flatten(),
      });
    }
    const { imageUrl, itemId } = parsed.data;

    // ---- ALLOWLIST (SSRF guard)
    const u = new URL(imageUrl);
    const allowed = ALLOWLIST.some((h) => u.hostname.toLowerCase().endsWith(h));
    if (!allowed) {
      return json(400, {
        ok: false,
        stage: 'allowlist',
        message: 'Image host not allowed',
        host: u.hostname,
        allowlist: ALLOWLIST,
      });
    }

    // ---- OWNERSHIP
    const { data: row, error: rowErr } = await supabase
      .from('wardrobe_items')
      .select('id,user_id')
      .eq('id', itemId)
      .maybeSingle();

    if (rowErr) {
      return json(500, {
        ok: false,
        stage: 'ownership_select',
        message: 'DB select failed',
        detail: rowErr.message,
      });
    }
    if (!row) {
      return json(404, { ok: false, stage: 'ownership', message: 'Item not found' });
    }
    if (row.user_id !== user.id) {
      return json(403, {
        ok: false,
        stage: 'ownership',
        message: 'Forbidden: you do not own this item',
        itemUserId: row.user_id,
        me: user.id,
      });
    }

    // ---- CLOUDINARY UNSIGNED UPLOAD (sadece file + upload_preset)
    const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const fd = new FormData();
    fd.append('file', imageUrl);
    fd.append('upload_preset', uploadPreset);
    // NOT: unsigned upload'ta 'colors' parametresi YASAK. Eklemiyoruz.

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const upRes = await fetch(cloudUrl, {
      method: 'POST',
      body: fd,
      signal: controller.signal,
    }).catch((e) => ({ ok: false, status: 499, json: async () => ({ error: e.message }) }) as any);
    clearTimeout(timeout);
    const upJson = await upRes.json();
    if (!upRes.ok) {
      return json(502, {
        ok: false,
        stage: 'cloudinary_upload',
        message: 'Upload failed',
        detail: upJson,
      });
    }

    const cdnUrl = upJson.secure_url as string | undefined;

    // ---- MOCK ANALYSIS (örnek)
    const analysis = {
      mainCategory: 'tops',
      subCategory: 't-shirt',
      dominantColors: ['#000000', '#FFFFFF'],
      detectedTags: ['t-shirt', 'casual', 'basic'],
    };

    // ---- Optional persist (varsa kolon)
    // await supabase.from("wardrobe_items")
    //   .update({ ai_analysis_data: analysis, processed_image_uri: cdnUrl ?? row.processed_image_uri })
    //   .eq("id", itemId)
    //   .eq("user_id", user.id);

    const durationMs = Date.now() - started;
    console.log(
      JSON.stringify({
        level: 'info',
        requestId,
        stage: 'analysis_done',
        durationMs,
        itemId,
        user: user.id,
      }),
    );
    return json(200, {
      ok: true,
      requestId,
      durationMs,
      stage: 'analysis_done',
      user: user.id,
      itemId,
      imageHost: u.hostname,
      cloudinary: { url: cdnUrl },
      analysis,
    });
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    
    return json(500, { ok: false, requestId, stage: 'unhandled', message: msg });
  }
});
