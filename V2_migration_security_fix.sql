-- AYNAMODA Security Remediation Migration
-- Adds missing AI-specific columns to wardrobeItems table
-- This script is idempotent and safe to run multiple times

BEGIN;

-- Add AI-specific columns to store pure AI analysis results
ALTER TABLE public."wardrobeItems"
ADD COLUMN IF NOT EXISTS ai_main_category text,
ADD COLUMN IF NOT EXISTS ai_sub_category text,
ADD COLUMN IF NOT EXISTS ai_dominant_colors jsonb;

-- Add helpful comments
COMMENT ON COLUMN public."wardrobeItems".ai_main_category IS 'AI-generated main category (e.g., Tops, Bottoms, Dresses)';
COMMENT ON COLUMN public."wardrobeItems".ai_sub_category IS 'AI-generated sub category (e.g., T-shirt, Jeans, Dress)';
COMMENT ON COLUMN public."wardrobeItems".ai_dominant_colors IS 'AI-extracted dominant colors as JSON array of hex codes';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_ai_main_category
ON public."wardrobeItems" (ai_main_category)
WHERE ai_main_category IS NOT NULL;

COMMIT; 