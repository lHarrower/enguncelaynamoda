-- Anti-consumption features migration
-- This migration adds tables and functions to support anti-consumption features

-- Shop Your Closet recommendations table
CREATE TABLE shop_your_closet_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_item JSONB NOT NULL,
  similar_item_ids UUID[] NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT[] DEFAULT '{}',
  viewed_at TIMESTAMP WITH TIME ZONE,
  acted_upon BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rediscovery challenges table
CREATE TABLE rediscovery_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('neglected_items', 'color_exploration', 'style_mixing')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_item_ids UUID[] NOT NULL,
  progress INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  reward TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly confidence metrics table
CREATE TABLE monthly_confidence_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  year INTEGER NOT NULL,
  average_confidence_rating DECIMAL(3,2) NOT NULL,
  total_outfits_rated INTEGER NOT NULL,
  confidence_improvement DECIMAL(3,2) DEFAULT 0,
  most_confident_item_ids UUID[] DEFAULT '{}',
  least_confident_item_ids UUID[] DEFAULT '{}',
  wardrobe_utilization DECIMAL(5,2) DEFAULT 0,
  cost_per_wear_improvement DECIMAL(10,2) DEFAULT 0,
  shopping_reduction_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Shopping behavior tracking table
CREATE TABLE shopping_behavior_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  year INTEGER NOT NULL,
  monthly_purchases INTEGER DEFAULT 0,
  previous_month_purchases INTEGER DEFAULT 0,
  reduction_percentage DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  total_savings DECIMAL(10,2) DEFAULT 0,
  last_purchase_date DATE,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Add cost-per-wear tracking to wardrobe items (if not already exists)
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS cost_per_wear DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_wears INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS projected_cost_per_wear DECIMAL(10,2) DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_shop_closet_recommendations_user_id ON shop_your_closet_recommendations(user_id);
CREATE INDEX idx_shop_closet_recommendations_created_at ON shop_your_closet_recommendations(created_at);

CREATE INDEX idx_rediscovery_challenges_user_id ON rediscovery_challenges(user_id);
CREATE INDEX idx_rediscovery_challenges_expires_at ON rediscovery_challenges(expires_at);
CREATE INDEX idx_rediscovery_challenges_completed_at ON rediscovery_challenges(completed_at);

CREATE INDEX idx_monthly_confidence_metrics_user_id ON monthly_confidence_metrics(user_id);
CREATE INDEX idx_monthly_confidence_metrics_month_year ON monthly_confidence_metrics(month, year);

CREATE INDEX idx_shopping_behavior_user_id ON shopping_behavior_tracking(user_id);
CREATE INDEX idx_shopping_behavior_month_year ON shopping_behavior_tracking(month, year);

CREATE INDEX idx_wardrobe_items_cost_per_wear ON wardrobe_items(cost_per_wear);
CREATE INDEX idx_wardrobe_items_last_worn ON wardrobe_items(last_worn);

-- Function to update cost-per-wear automatically
CREATE OR REPLACE FUNCTION update_cost_per_wear()
RETURNS TRIGGER AS $$
BEGIN
  -- Update cost-per-wear when usage_count changes
  IF NEW.usage_count != OLD.usage_count AND NEW.purchase_price IS NOT NULL THEN
    NEW.cost_per_wear = CASE 
      WHEN NEW.usage_count > 0 THEN NEW.purchase_price / NEW.usage_count
      ELSE NEW.purchase_price
    END;
    
    -- Calculate projected cost-per-wear based on days since purchase
    NEW.projected_cost_per_wear = CASE
      WHEN NEW.purchase_date IS NOT NULL THEN
        NEW.purchase_price / GREATEST(NEW.usage_count, EXTRACT(DAYS FROM NOW() - NEW.purchase_date) / 30)
      ELSE NEW.cost_per_wear
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cost-per-wear updates
DROP TRIGGER IF EXISTS trigger_update_cost_per_wear ON wardrobe_items;
CREATE TRIGGER trigger_update_cost_per_wear
  BEFORE UPDATE ON wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_per_wear();

-- Function to get neglected items
CREATE OR REPLACE FUNCTION get_neglected_items(
  p_user_id UUID,
  p_days_since INTEGER DEFAULT 60
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  colors TEXT[],
  tags TEXT[],
  last_worn DATE,
  days_since_worn INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wi.id,
    wi.category,
    wi.colors,
    wi.tags,
    wi.last_worn,
    CASE 
      WHEN wi.last_worn IS NULL THEN 999
      ELSE EXTRACT(DAYS FROM NOW() - wi.last_worn)::INTEGER
    END as days_since_worn
  FROM wardrobe_items wi
  WHERE wi.user_id = p_user_id
    AND (wi.last_worn IS NULL OR wi.last_worn < NOW() - INTERVAL '1 day' * p_days_since)
  ORDER BY days_since_worn DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate wardrobe utilization percentage
CREATE OR REPLACE FUNCTION calculate_wardrobe_utilization(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_items INTEGER;
  used_items INTEGER;
BEGIN
  -- Get total wardrobe items
  SELECT COUNT(*) INTO total_items
  FROM wardrobe_items
  WHERE user_id = p_user_id;
  
  -- Get items used in the specified period
  SELECT COUNT(DISTINCT wi.id) INTO used_items
  FROM wardrobe_items wi
  WHERE wi.user_id = p_user_id
    AND wi.last_worn IS NOT NULL
    AND wi.last_worn >= NOW() - INTERVAL '1 day' * p_days_back;
  
  -- Return utilization percentage
  RETURN CASE 
    WHEN total_items > 0 THEN (used_items::DECIMAL / total_items::DECIMAL) * 100
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) policies
ALTER TABLE shop_your_closet_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rediscovery_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_confidence_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_behavior_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for shop_your_closet_recommendations
CREATE POLICY "Users can view their own shop your closet recommendations" ON shop_your_closet_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shop your closet recommendations" ON shop_your_closet_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shop your closet recommendations" ON shop_your_closet_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for rediscovery_challenges
CREATE POLICY "Users can view their own rediscovery challenges" ON rediscovery_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rediscovery challenges" ON rediscovery_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rediscovery challenges" ON rediscovery_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for monthly_confidence_metrics
CREATE POLICY "Users can view their own monthly confidence metrics" ON monthly_confidence_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly confidence metrics" ON monthly_confidence_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly confidence metrics" ON monthly_confidence_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for shopping_behavior_tracking
CREATE POLICY "Users can view their own shopping behavior tracking" ON shopping_behavior_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping behavior tracking" ON shopping_behavior_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping behavior tracking" ON shopping_behavior_tracking
  FOR UPDATE USING (auth.uid() = user_id);