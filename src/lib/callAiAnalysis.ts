// P0 Security: Remove hardcoded anon key & move to env, add client-side host allowlist validation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnon);

// Allowlist hosts (client-side early rejection)
const HOST_ALLOWLIST = (
  process.env.EXPO_PUBLIC_AI_IMAGE_HOST_ALLOWLIST ||
  `res.cloudinary.com,${new URL(supabaseUrl).hostname}`
)
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

function assertAllowedImageHost(imageUrl: string) {
  try {
    const u = new URL(imageUrl);
    const host = u.hostname.toLowerCase();
    if (!HOST_ALLOWLIST.some((h) => host === h || host.endsWith(h))) {
      throw new Error(`Disallowed image host: ${host}`);
    }
  } catch (e) {
    throw new Error('Invalid or disallowed image URL');
  }
}

export async function callAiAnalysis(itemId: string, imageUrl: string) {
  assertAllowedImageHost(imageUrl);
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token ?? '';
  const fnUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/ai-analysis`;
  const resp = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnon,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl, itemId }),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`ai-analysis ${resp.status}: ${JSON.stringify(json)}`);
  }
  return json; // { cloudinary: { url }, analysis: {...}, ... }
}
