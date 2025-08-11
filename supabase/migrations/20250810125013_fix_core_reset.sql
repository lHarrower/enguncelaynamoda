-- ============================================================================
-- AYNAMODA - Core reset (idempotent, safe)
-- This migration:
-- 1) Ensures image_uri / processed_image_uri columns exist and are backfilled
-- 2) Ensures outfit_recommendations.daily_recommendation_id and its index exist
-- 3) Re-creates calculate_item_compatibility with current schema (colors/tags)
-- 4) Adds AI-related columns on wardrobe_items if missing
-- All statements are idempotent and safe to re-run.
-- ============================================================================

-- 1) IMAGE FIELDS (image_uri / processed_image_uri)
DO $$
BEGIN
  -- add image_uri if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='wardrobe_items' AND column_name='image_uri'
  ) THEN
    EXECUTE 'ALTER TABLE public.wardrobe_items ADD COLUMN image_uri TEXT';
  END IF;

  -- add processed_image_uri if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='wardrobe_items' AND column_name='processed_image_uri'
  ) THEN
    EXECUTE 'ALTER TABLE public.wardrobe_items ADD COLUMN processed_image_uri TEXT';
  END IF;

  -- backfill strategy:
  -- priority: if image_uri exists, copy it into processed_image_uri where null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='wardrobe_items' AND column_name='image_uri'
  ) THEN
    EXECUTE 'UPDATE public.wardrobe_items SET processed_image_uri = image_uri WHERE processed_image_uri IS NULL';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='wardrobe_items' AND column_name='image_url'
  ) THEN
    -- if only image_url exists, use it to fill missing fields
    EXECUTE 'UPDATE public.wardrobe_items SET image_uri = image_url WHERE image_uri IS NULL';
    EXECUTE 'UPDATE public.wardrobe_items SET processed_image_uri = image_url WHERE processed_image_uri IS NULL';
  END IF;
END
$$;

-- 2) OUTFIT RECOMMENDATIONS: COLUMN + INDEX
ALTER TABLE public.outfit_recommendations
  ADD COLUMN IF NOT EXISTS daily_recommendation_id uuid;

CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_daily_id
  ON public.outfit_recommendations(daily_recommendation_id);

-- 3) FUNCTION: calculate_item_compatibility (drop then create cleanly)
DROP FUNCTION IF EXISTS public.calculate_item_compatibility(uuid, uuid);

CREATE FUNCTION public.calculate_item_compatibility(item1 uuid, item2 uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $FN$
DECLARE
  rec1 RECORD;
  rec2 RECORD;
  score numeric := 0;
  c1 TEXT;
  c2 TEXT;
  tag_overlap BOOLEAN := FALSE;
BEGIN
  SELECT category, colors, tags INTO rec1 FROM public.wardrobe_items WHERE id = item1;
  SELECT category, colors, tags INTO rec2 FROM public.wardrobe_items WHERE id = item2;

  IF rec1 IS NULL OR rec2 IS NULL THEN
    RETURN 0;
  END IF;

  -- category match
  IF rec1.category = rec2.category THEN
    score := score + 0.4;
  END IF;

  -- primary color match (colors[1])
  c1 := COALESCE(rec1.colors[1], NULL);
  c2 := COALESCE(rec2.colors[1], NULL);
  IF c1 IS NOT NULL AND c2 IS NOT NULL AND c1 = c2 THEN
    score := score + 0.3;
  END IF;

  -- tag intersection
  SELECT EXISTS(
    SELECT t1 FROM unnest(COALESCE(rec1.tags, ARRAY[]::text[])) t1
    INTERSECT
    SELECT t2 FROM unnest(COALESCE(rec2.tags, ARRAY[]::text[])) t2
  ) INTO tag_overlap;

  IF tag_overlap THEN
    score := score + 0.3;
  END IF;

  RETURN LEAST(1, GREATEST(0, score));
END;
$FN$;

-- 4) AI COLUMNS ON wardrobe_items
ALTER TABLE public.wardrobe_items
  ADD COLUMN IF NOT EXISTS ai_analysis_data JSONB,
  ADD COLUMN IF NOT EXISTS ai_main_category TEXT,
  ADD COLUMN IF NOT EXISTS ai_sub_category TEXT,
  ADD COLUMN IF NOT EXISTS ai_dominant_colors TEXT[];

-- 5) HELPFUL INDEXES
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_ai_main_category
  ON public.wardrobe_items(ai_main_category);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_ai_sub_category
  ON public.wardrobe_items(ai_sub_category);