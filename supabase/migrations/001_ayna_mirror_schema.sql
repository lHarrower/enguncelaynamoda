-- AYNA Mirror Daily Ritual Database Schema
-- Migration: 001_ayna_mirror_schema.sql
-- Description: Core tables for the AYNA Mirror daily ritual system

-- ============================================================================
-- ENHANCED WARDROBE ITEMS TABLE
-- ============================================================================

-- First, check if wardrobeItems table exists and enhance it
-- If it doesn't exist, create it with all enhanced features
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_uri TEXT NOT NULL,
  processed_image_uri TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'dresses', 'activewear')),
  subcategory TEXT,
  colors TEXT[] NOT NULL DEFAULT '{}',
  brand TEXT,
  size TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- Intelligence features
  usage_count INTEGER DEFAULT 0,
  last_worn DATE,
  confidence_score DECIMAL(3,2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 5),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to existing wardrobeItems table if they don't exist
DO $$ 
BEGIN
  -- Add intelligence columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'usage_count') THEN
    ALTER TABLE wardrobe_items ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'last_worn') THEN
    ALTER TABLE wardrobe_items ADD COLUMN last_worn DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'confidence_score') THEN
    ALTER TABLE wardrobe_items ADD COLUMN confidence_score DECIMAL(3,2) DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'purchase_date') THEN
    ALTER TABLE wardrobe_items ADD COLUMN purchase_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'purchase_price') THEN
    ALTER TABLE wardrobe_items ADD COLUMN purchase_price DECIMAL(10,2);
  END IF;
END $$;

-- ============================================================================
-- DAILY RECOMMENDATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_date DATE NOT NULL,
  weather_context JSONB,
  calendar_context JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one recommendation per user per day
  UNIQUE(user_id, recommendation_date)
);

-- ============================================================================
-- OUTFIT RECOMMENDATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outfit_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_recommendation_id UUID REFERENCES daily_recommendations(id) ON DELETE CASCADE,
  item_ids UUID[] NOT NULL,
  confidence_note TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 5),
  reasoning TEXT[] DEFAULT '{}',
  is_quick_option BOOLEAN DEFAULT FALSE,
  selected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- OUTFIT FEEDBACK TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS outfit_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_recommendation_id UUID REFERENCES outfit_recommendations(id) ON DELETE CASCADE,
  confidence_rating INTEGER NOT NULL CHECK (confidence_rating >= 1 AND confidence_rating <= 5),
  emotional_response JSONB NOT NULL,
  social_feedback JSONB,
  occasion TEXT,
  comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_time TIME NOT NULL DEFAULT '06:00:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  style_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  engagement_history JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Wardrobe items indexes
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_last_worn ON wardrobe_items(last_worn);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_usage_count ON wardrobe_items(usage_count);

-- Daily recommendations indexes
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_user_date ON daily_recommendations(user_id, recommendation_date);
CREATE INDEX IF NOT EXISTS idx_daily_recommendations_generated_at ON daily_recommendations(generated_at);

-- Create index only if the column exists (guards older DBs where column is added by later migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='outfit_recommendations'
      AND column_name='daily_recommendation_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_daily_id
    ON public.outfit_recommendations(daily_recommendation_id);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'outfit_recommendations' 
      AND column_name = 'selected_at'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_selected ON outfit_recommendations(selected_at) WHERE selected_at IS NOT NULL';
  END IF;
END $$;

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_user_id ON outfit_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_outfit_id ON outfit_feedback(outfit_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_outfit_feedback_created_at ON outfit_feedback(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Wardrobe items policies
CREATE POLICY "Users can view their own wardrobe items" ON wardrobe_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" ON wardrobe_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items" ON wardrobe_items
  FOR DELETE USING (auth.uid() = user_id);

-- Daily recommendations policies
CREATE POLICY "Users can view their own daily recommendations" ON daily_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily recommendations" ON daily_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily recommendations" ON daily_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Outfit recommendations policies (accessed through daily recommendations)
-- Outfit recommendations policies moved to a later migration

-- Outfit feedback policies
CREATE POLICY "Users can view their own outfit feedback" ON outfit_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfit feedback" ON outfit_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit feedback" ON outfit_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_wardrobe_items_updated_at 
  BEFORE UPDATE ON wardrobe_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Create default user preferences for existing users
INSERT INTO user_preferences (user_id, notification_time, timezone)
SELECT id, '06:00:00', 'UTC'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;