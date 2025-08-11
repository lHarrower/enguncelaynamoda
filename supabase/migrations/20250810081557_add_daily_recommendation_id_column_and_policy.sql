ALTER TABLE public.outfit_recommendations
ADD COLUMN IF NOT EXISTS daily_recommendation_id uuid
REFERENCES public.daily_recommendations(id) ON DELETE CASCADE;

CREATE POLICY "Users can view outfit recommendations for their daily recommendations" 
ON outfit_recommendations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM daily_recommendations
    WHERE daily_recommendations.id = outfit_recommendations.daily_recommendation_id
    AND daily_recommendations.user_id = auth.uid()
  )
);
