-- Idempotent fix for calculate_item_compatibility to reference existing columns only
DO $$
BEGIN
  -- Ensure ai_analysis_data exists (added by 20241201_add_item_naming.sql); skip if present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='wardrobe_items' AND column_name='ai_analysis_data'
  ) THEN
    ALTER TABLE public.wardrobe_items ADD COLUMN ai_analysis_data JSONB;
  END IF;

  -- Replace function with a safe version using category, colors, tags only
  EXECUTE $$
  CREATE OR REPLACE FUNCTION public.calculate_item_compatibility(
    item1_id UUID,
    item2_id UUID
  ) RETURNS DECIMAL(3,2)
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    c DECIMAL(3,2) := 0.0;
    i1_category TEXT; i2_category TEXT;
    i1_colors TEXT[]; i2_colors TEXT[];
    i1_tags TEXT[]; i2_tags TEXT[];
    color_score DECIMAL(3,2) := 0.0;
    tag_score DECIMAL(3,2) := 0.0;
    category_score DECIMAL(3,2) := 0.0;
  BEGIN
    SELECT category, colors, COALESCE(tags, '{}') INTO i1_category, i1_colors, i1_tags FROM wardrobe_items WHERE id = item1_id;
    SELECT category, colors, COALESCE(tags, '{}') INTO i2_category, i2_colors, i2_tags FROM wardrobe_items WHERE id = item2_id;

    IF i1_category IS NULL OR i2_category IS NULL THEN
      RETURN 0.0;
    END IF;

    -- Simple color overlap ratio
    IF array_length(i1_colors,1) IS NOT NULL AND array_length(i2_colors,1) IS NOT NULL THEN
      color_score := LEAST(1.0, GREATEST(0.0, (SELECT COUNT(*)::DECIMAL FROM unnest(i1_colors) c1 WHERE c1 = ANY(i2_colors)) / GREATEST(array_length(i1_colors,1), array_length(i2_colors,1))::DECIMAL));
    ELSE
      color_score := 0.3; -- neutral baseline when missing
    END IF;

    -- Tag overlap ratio
    IF array_length(i1_tags,1) IS NOT NULL AND array_length(i2_tags,1) IS NOT NULL THEN
      tag_score := LEAST(1.0, GREATEST(0.0, (SELECT COUNT(*)::DECIMAL FROM unnest(i1_tags) t1 WHERE t1 = ANY(i2_tags)) / GREATEST(array_length(i1_tags,1), array_length(i2_tags,1))::DECIMAL));
    ELSE
      tag_score := 0.3;
    END IF;

    -- Category pairing heuristic
    IF (i1_category IN ('tops') AND i2_category IN ('bottoms')) OR (i1_category IN ('bottoms') AND i2_category IN ('tops')) THEN
      category_score := 1.0;
    ELSIF i1_category = i2_category THEN
      category_score := 0.4;
    ELSE
      category_score := 0.6;
    END IF;

    c := (color_score * 0.4 + tag_score * 0.3 + category_score * 0.3);
    RETURN GREATEST(0.0, LEAST(1.0, c));
  END;$$;
END $$;

-- Grants
GRANT EXECUTE ON FUNCTION public.calculate_item_compatibility(UUID, UUID) TO authenticated;
