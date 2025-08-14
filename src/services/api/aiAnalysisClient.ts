import { ENV, supabase } from '@/config/supabaseClient';

interface RunAiAnalysisParams {
  imageUrl: string;
  itemId: string;
  accessToken: string;
  anonKey: string;
  fnBaseUrl?: string; // optional override (tests)
}

export interface AiAnalysisResult {
  cloudUrl?: string;
  analysis?: any; // { mainCategory, subCategory, dominantColors[], detectedTags[] }
}

export async function runAiAnalysis({ imageUrl, itemId, accessToken, anonKey, fnBaseUrl }: RunAiAnalysisParams): Promise<AiAnalysisResult> {
  const base = (fnBaseUrl || ENV.SUPABASE_URL).replace(/\/$/, '');
  const url = `${base}/functions/v1/ai-analysis`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, itemId })
  });
  if (!resp.ok) {
    let msg = `AI analysis failed (${resp.status})`;
    try { const j = await resp.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  const json = await resp.json();
  return { cloudUrl: json?.cloudinary?.url, analysis: json?.analysis };
}

export async function runAiAnalysisWithSession(itemId: string, imageUrl: string): Promise<AiAnalysisResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session');
  return runAiAnalysis({ imageUrl, itemId, accessToken: session.access_token, anonKey: ENV.SUPABASE_ANON_KEY });
}

export default runAiAnalysis;
