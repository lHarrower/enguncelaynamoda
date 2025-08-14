import { supabase } from '@/config/supabaseClient';

export interface ApplyAnalysisPayload { cloudUrl?: string; analysis?: any; }

export async function applyAnalysisToItem(itemId: string, { cloudUrl, analysis }: ApplyAnalysisPayload) {
  const update: Record<string, any> = {};
  if (cloudUrl) update.processed_image_uri = cloudUrl;
  if (analysis) update.ai_analysis_data = analysis;
  if (!Object.keys(update).length) return { data: null, error: null };
  const { data, error } = await supabase.from('wardrobe_items').update(update).eq('id', itemId).select().single();
  return { data, error };
}

export default { applyAnalysisToItem };
