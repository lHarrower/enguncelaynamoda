import { supabase } from '@/config/supabaseClient';
import type { AiAnalysisDataJSON } from '@/types/aynaMirror';

export interface ApplyAnalysisPayload {
  cloudUrl?: string;
  analysis?: AiAnalysisDataJSON;
}

export async function applyAnalysisToItem(
  itemId: string,
  { cloudUrl, analysis }: ApplyAnalysisPayload,
): Promise<{ data: unknown; error: { message: string } | null }> {
  const update: Record<string, unknown> = {};
  if (cloudUrl) {
    update.processed_image_uri = cloudUrl;
  }
  if (analysis !== undefined) {
    update.ai_analysis_data = analysis;
  }
  if (!Object.keys(update).length) {
    return Promise.resolve({ data: null, error: null });
  }
  return supabase.from('wardrobe_items').update(update).eq('id', itemId).select().single();
}

export default { applyAnalysisToItem };
