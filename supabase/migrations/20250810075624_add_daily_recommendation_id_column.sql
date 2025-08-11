ALTER TABLE public.outfit_recommendations
ADD COLUMN IF NOT EXISTS daily_recommendation_id uuid
REFERENCES public.daily_recommendations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_daily_id
ON public.outfit_recommendations(daily_recommendation_id);
