-- Add naming fields to wardrobe items (renamed to avoid duplicate version)
-- Description: Add AI-powered automatic naming capabilities

-- ============================================================================
-- ADD NAMING FIELDS TO WARDROBE ITEMS
-- ============================================================================

DO $$ 
BEGIN
  -- Add user-provided name field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'name') THEN
    ALTER TABLE wardrobe_items ADD COLUMN name TEXT;
  END IF;
  
  -- Add AI-generated name field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'ai_generated_name') THEN
    ALTER TABLE wardrobe_items ADD COLUMN ai_generated_name TEXT;
  END IF;
  
  -- Add flag to track if user has overridden AI name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'name_override') THEN
    ALTER TABLE wardrobe_items ADD COLUMN name_override BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add AI analysis metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'ai_analysis_data') THEN
    ALTER TABLE wardrobe_items ADD COLUMN ai_analysis_data JSONB;
  END IF;
END $$;

-- ============================================================================
-- CREATE ITEM NAMING HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS item_naming_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_generated_name TEXT,
  user_provided_name TEXT,
  naming_confidence DECIMAL(3,2) CHECK (naming_confidence >= 0 AND naming_confidence <= 1),
  ai_tags TEXT[] DEFAULT '{}',
  visual_features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE NAMING PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS naming_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  naming_style TEXT DEFAULT 'descriptive' CHECK (naming_style IN ('descriptive', 'creative', 'minimal', 'brand_focused')),
  include_brand BOOLEAN DEFAULT TRUE,
  include_color BOOLEAN DEFAULT TRUE,
  include_material BOOLEAN DEFAULT FALSE,
  include_style BOOLEAN DEFAULT TRUE,
  preferred_language TEXT DEFAULT 'en',
  auto_accept_ai_names BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_ai_generated_name ON wardrobe_items(ai_generated_name);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_name_override ON wardrobe_items(name_override);
CREATE INDEX IF NOT EXISTS idx_item_naming_history_item_id ON item_naming_history(item_id);
CREATE INDEX IF NOT EXISTS idx_item_naming_history_user_id ON item_naming_history(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_preferences_user_id ON naming_preferences(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for naming_preferences
CREATE OR REPLACE FUNCTION update_naming_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_naming_preferences_updated_at ON naming_preferences;
CREATE TRIGGER trigger_update_naming_preferences_updated_at
  BEFORE UPDATE ON naming_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_naming_preferences_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE item_naming_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for item_naming_history
DROP POLICY IF EXISTS "Users can view their own naming history" ON item_naming_history;
CREATE POLICY "Users can view their own naming history" ON item_naming_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own naming history" ON item_naming_history;
CREATE POLICY "Users can insert their own naming history" ON item_naming_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own naming history" ON item_naming_history;
CREATE POLICY "Users can update their own naming history" ON item_naming_history
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own naming history" ON item_naming_history;
CREATE POLICY "Users can delete their own naming history" ON item_naming_history
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for naming_preferences
DROP POLICY IF EXISTS "Users can view their own naming preferences" ON naming_preferences;
CREATE POLICY "Users can view their own naming preferences" ON naming_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own naming preferences" ON naming_preferences;
CREATE POLICY "Users can insert their own naming preferences" ON naming_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own naming preferences" ON naming_preferences;
CREATE POLICY "Users can update their own naming preferences" ON naming_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own naming preferences" ON naming_preferences;
CREATE POLICY "Users can delete their own naming preferences" ON naming_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get effective item name (user name or AI name)
CREATE OR REPLACE FUNCTION get_effective_item_name(item_row wardrobe_items)
RETURNS TEXT AS $$
BEGIN
  -- Return user-provided name if exists, otherwise AI-generated name
  IF item_row.name IS NOT NULL AND item_row.name != '' THEN
    RETURN item_row.name;
  ELSIF item_row.ai_generated_name IS NOT NULL AND item_row.ai_generated_name != '' THEN
    RETURN item_row.ai_generated_name;
  ELSE
    -- Fallback to category + color if available
    IF array_length(item_row.colors, 1) > 0 THEN
      RETURN item_row.colors[1] || ' ' || item_row.category;
    ELSE
      RETURN item_row.category;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get naming suggestions based on item properties
CREATE OR REPLACE FUNCTION get_naming_suggestions(
  item_category TEXT,
  item_colors TEXT[],
  item_brand TEXT DEFAULT NULL,
  item_subcategory TEXT DEFAULT NULL,
  naming_style TEXT DEFAULT 'descriptive'
)
RETURNS TEXT[] AS $$
DECLARE
  suggestions TEXT[] := '{}';
  color_name TEXT;
  base_name TEXT;
BEGIN
  -- Get primary color
  IF array_length(item_colors, 1) > 0 THEN
    color_name := item_colors[1];
  END IF;
  
  -- Generate base name from subcategory or category
  base_name := COALESCE(item_subcategory, item_category);
  
  -- Generate suggestions based on naming style
  CASE naming_style
    WHEN 'descriptive' THEN
      IF color_name IS NOT NULL THEN
        suggestions := array_append(suggestions, color_name || ' ' || base_name);
      END IF;
      IF item_brand IS NOT NULL THEN
        suggestions := array_append(suggestions, item_brand || ' ' || base_name);
      END IF;
      suggestions := array_append(suggestions, base_name);
      
    WHEN 'creative' THEN
      -- Add creative variations
      IF color_name IS NOT NULL THEN
        suggestions := array_append(suggestions, 'My ' || color_name || ' ' || base_name);
        suggestions := array_append(suggestions, color_name || ' Essential');
      END IF;
      suggestions := array_append(suggestions, 'Favorite ' || base_name);
      
    WHEN 'minimal' THEN
      suggestions := array_append(suggestions, base_name);
      IF color_name IS NOT NULL THEN
        suggestions := array_append(suggestions, color_name);
      END IF;
      
    WHEN 'brand_focused' THEN
      IF item_brand IS NOT NULL THEN
        suggestions := array_append(suggestions, item_brand || ' ' || base_name);
        suggestions := array_append(suggestions, item_brand);
      END IF;
      suggestions := array_append(suggestions, base_name);
  END CASE;
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE item_naming_history IS 'Tracks the history of AI-generated and user-provided names for wardrobe items';
COMMENT ON TABLE naming_preferences IS 'Stores user preferences for automatic item naming';
COMMENT ON COLUMN wardrobe_items.name IS 'User-provided name for the item';
COMMENT ON COLUMN wardrobe_items.ai_generated_name IS 'AI-generated name based on visual analysis';
COMMENT ON COLUMN wardrobe_items.name_override IS 'Flag indicating if user has overridden the AI-generated name';
COMMENT ON COLUMN wardrobe_items.ai_analysis_data IS 'Raw AI analysis data used for naming and categorization';
