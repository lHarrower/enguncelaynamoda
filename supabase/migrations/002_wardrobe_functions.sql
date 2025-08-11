-- AYNA Mirror Database Functions
-- Migration: 002_wardrobe_functions.sql
-- Description: Database functions for wardrobe intelligence features

-- ============================================================================
-- ITEM USAGE TRACKING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION track_item_usage(
  item_id UUID,
  outfit_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update the wardrobe item usage statistics
  UPDATE wardrobe_items 
  SET 
    usage_count = usage_count + 1,
    last_worn = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = item_id;
  
  -- Log the usage event (for future analytics)
  -- This could be expanded to include outfit context
  IF outfit_id IS NOT NULL THEN
    -- Future: Log to usage_events table for detailed analytics
    NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- WARDROBE STATISTICS FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_wardrobe_utilization_stats(user_uuid UUID)
RETURNS TABLE(
  total_items INTEGER,
  active_items INTEGER,
  neglected_items INTEGER,
  average_cost_per_wear DECIMAL(10,2),
  utilization_percentage DECIMAL(5,2)
) AS $$
DECLARE
  total_count INTEGER;
  active_count INTEGER;
  neglected_count INTEGER;
  avg_cost DECIMAL(10,2);
  util_pct DECIMAL(5,2);
BEGIN
  -- Get total items count
  SELECT COUNT(*) INTO total_count
  FROM wardrobe_items 
  WHERE user_id = user_uuid;
  
  -- Get active items count (items that have been worn)
  SELECT COUNT(*) INTO active_count
  FROM wardrobe_items 
  WHERE user_id = user_uuid AND usage_count > 0;
  
  -- Get neglected items count (not worn in 30+ days or never worn)
  SELECT COUNT(*) INTO neglected_count
  FROM wardrobe_items 
  WHERE user_id = user_uuid 
    AND (last_worn IS NULL OR last_worn < CURRENT_DATE - INTERVAL '30 days');
  
  -- Calculate average cost per wear for items with purchase price and usage
  SELECT COALESCE(AVG(purchase_price / NULLIF(usage_count, 0)), 0) INTO avg_cost
  FROM wardrobe_items 
  WHERE user_id = user_uuid 
    AND purchase_price IS NOT NULL 
    AND usage_count > 0;
  
  -- Calculate utilization percentage
  util_pct := CASE 
    WHEN total_count > 0 THEN (active_count::DECIMAL / total_count::DECIMAL) * 100
    ELSE 0
  END;
  
  RETURN QUERY SELECT total_count, active_count, neglected_count, avg_cost, util_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONFIDENCE SCORE UPDATE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_item_confidence_score(
  item_id UUID,
  new_rating INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_score DECIMAL(3,2);
  current_count INTEGER;
  new_score DECIMAL(3,2);
BEGIN
  -- Get current confidence score and usage count
  SELECT confidence_score, usage_count 
  INTO current_score, current_count
  FROM wardrobe_items 
  WHERE id = item_id;
  
  -- Calculate new weighted average confidence score
  IF current_count > 0 THEN
    new_score := ((current_score * current_count) + new_rating) / (current_count + 1);
  ELSE
    new_score := new_rating;
  END IF;
  
  -- Update the item with new confidence score
  UPDATE wardrobe_items 
  SET 
    confidence_score = new_score,
    updated_at = NOW()
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NEGLECTED ITEMS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_neglected_items(
  user_uuid UUID,
  days_threshold INTEGER DEFAULT 30
)
RETURNS TABLE(
  id UUID,
  image_uri TEXT,
  category TEXT,
  colors TEXT[],
  brand TEXT,
  last_worn DATE,
  days_since_worn INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wi.id,
    wi.image_uri,
    wi.category,
    wi.colors,
    wi.brand,
    wi.last_worn,
    CASE 
      WHEN wi.last_worn IS NULL THEN NULL
      ELSE EXTRACT(DAY FROM (CURRENT_DATE - wi.last_worn))::INTEGER
    END as days_since_worn
  FROM wardrobe_items wi
  WHERE wi.user_id = user_uuid
    AND (wi.last_worn IS NULL OR wi.last_worn < CURRENT_DATE - INTERVAL '1 day' * days_threshold)
  ORDER BY wi.last_worn ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ITEM COMPATIBILITY SCORING (Placeholder)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_item_compatibility(
  item1_id UUID,
  item2_id UUID
)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  compatibility_score DECIMAL(3,2) := 0.0;
  item1_record RECORD;
  item2_record RECORD;
  color_score DECIMAL(3,2) := 0.0;
  style_score DECIMAL(3,2) := 0.0;
  category_score DECIMAL(3,2) := 0.0;
BEGIN
  -- Get item details
  SELECT category, color, style, tags INTO item1_record
  FROM wardrobe_items WHERE id = item1_id;
  
  SELECT category, color, style, tags INTO item2_record
  FROM wardrobe_items WHERE id = item2_id;
  
  -- Return 0 if items not found
  IF item1_record IS NULL OR item2_record IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Color harmony scoring (simplified)
  IF item1_record.color = item2_record.color THEN
    color_score := 0.9; -- Same color
  ELSIF item1_record.color IN ('black', 'white', 'gray', 'navy') OR 
        item2_record.color IN ('black', 'white', 'gray', 'navy') THEN
    color_score := 0.8; -- Neutral colors
  ELSE
    color_score := 0.6; -- Different colors
  END IF;
  
  -- Style consistency scoring
  IF item1_record.style = item2_record.style THEN
    style_score := 0.9;
  ELSIF (item1_record.style IN ('casual', 'smart-casual') AND 
         item2_record.style IN ('casual', 'smart-casual')) OR
        (item1_record.style IN ('formal', 'business') AND 
         item2_record.style IN ('formal', 'business')) THEN
    style_score := 0.7;
  ELSE
    style_score := 0.4;
  END IF;
  
  -- Category compatibility (tops with bottoms, etc.)
  IF (item1_record.category IN ('tops', 'shirts', 'blouses') AND 
      item2_record.category IN ('bottoms', 'pants', 'skirts', 'shorts')) OR
     (item1_record.category IN ('bottoms', 'pants', 'skirts', 'shorts') AND 
      item2_record.category IN ('tops', 'shirts', 'blouses')) THEN
    category_score := 1.0; -- Perfect category match
  ELSIF item1_record.category = item2_record.category THEN
    category_score := 0.3; -- Same category (less ideal)
  ELSE
    category_score := 0.6; -- Other combinations
  END IF;
  
  -- Calculate weighted average
  compatibility_score := (color_score * 0.4 + style_score * 0.4 + category_score * 0.2);
  
  -- Ensure score is between 0 and 1
  compatibility_score := GREATEST(0.0, LEAST(1.0, compatibility_score));
  
  RETURN compatibility_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION track_item_usage(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wardrobe_utilization_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_item_confidence_score(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_neglected_items(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_item_compatibility(UUID, UUID) TO authenticated;