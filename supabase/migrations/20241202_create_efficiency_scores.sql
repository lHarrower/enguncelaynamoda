-- AYNA Mirror Efficiency Score System
-- Migration: 20241202_create_efficiency_scores.sql
-- Description: Database schema for comprehensive efficiency scoring system

-- ============================================================================
-- EFFICIENCY SCORES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS efficiency_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Overall and breakdown scores (0-100)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  utilization_score INTEGER NOT NULL CHECK (utilization_score >= 0 AND utilization_score <= 100),
  cost_efficiency_score INTEGER NOT NULL CHECK (cost_efficiency_score >= 0 AND cost_efficiency_score <= 100),
  sustainability_score INTEGER NOT NULL CHECK (sustainability_score >= 0 AND sustainability_score <= 100),
  versatility_score INTEGER NOT NULL CHECK (versatility_score >= 0 AND versatility_score <= 100),
  curation_score INTEGER NOT NULL CHECK (curation_score >= 0 AND curation_score <= 100),
  
  -- Insights and analysis
  insights JSONB NOT NULL DEFAULT '{}',
  trends JSONB NOT NULL DEFAULT '{}',
  benchmarks JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- EFFICIENCY GOALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS efficiency_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal details
  type TEXT NOT NULL CHECK (type IN ('utilization', 'cost_efficiency', 'sustainability', 'versatility', 'curation')),
  target INTEGER NOT NULL CHECK (target >= 0 AND target <= 100),
  current INTEGER NOT NULL CHECK (current >= 0 AND current <= 100),
  deadline TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  
  -- Progress tracking
  milestones JSONB NOT NULL DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- EFFICIENCY METRICS CACHE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS efficiency_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cached metric data
  wardrobe_utilization JSONB NOT NULL DEFAULT '{}',
  cost_efficiency JSONB NOT NULL DEFAULT '{}',
  sustainability JSONB NOT NULL DEFAULT '{}',
  versatility JSONB NOT NULL DEFAULT '{}',
  curation JSONB NOT NULL DEFAULT '{}',
  
  -- Cache metadata
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Efficiency scores indexes
CREATE INDEX IF NOT EXISTS idx_efficiency_scores_user_id ON efficiency_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_efficiency_scores_created_at ON efficiency_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_efficiency_scores_overall_score ON efficiency_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_efficiency_scores_user_created ON efficiency_scores(user_id, created_at DESC);

-- Efficiency goals indexes
CREATE INDEX IF NOT EXISTS idx_efficiency_goals_user_id ON efficiency_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_efficiency_goals_type ON efficiency_goals(type);
CREATE INDEX IF NOT EXISTS idx_efficiency_goals_active ON efficiency_goals(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_efficiency_goals_deadline ON efficiency_goals(deadline) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_efficiency_goals_user_active ON efficiency_goals(user_id, is_active) WHERE is_active = TRUE;

-- Efficiency metrics cache indexes
CREATE INDEX IF NOT EXISTS idx_efficiency_metrics_cache_user_id ON efficiency_metrics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_efficiency_metrics_cache_expires ON efficiency_metrics_cache(expires_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated at trigger for efficiency_scores
CREATE OR REPLACE FUNCTION update_efficiency_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_efficiency_scores_updated_at ON efficiency_scores;
CREATE TRIGGER trigger_efficiency_scores_updated_at
  BEFORE UPDATE ON efficiency_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_efficiency_scores_updated_at();

-- Updated at trigger for efficiency_goals
CREATE OR REPLACE FUNCTION update_efficiency_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_efficiency_goals_updated_at ON efficiency_goals;
CREATE TRIGGER trigger_efficiency_goals_updated_at
  BEFORE UPDATE ON efficiency_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_efficiency_goals_updated_at();

-- Auto-complete goals when target is reached
CREATE OR REPLACE FUNCTION auto_complete_efficiency_goals()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark goal as completed if current score reaches or exceeds target
  IF NEW.current >= NEW.target AND OLD.current < OLD.target THEN
    NEW.completed_at = NOW();
    NEW.is_active = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_complete_efficiency_goals ON efficiency_goals;
CREATE TRIGGER trigger_auto_complete_efficiency_goals
  BEFORE UPDATE ON efficiency_goals
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_efficiency_goals();

-- Cache cleanup trigger
CREATE OR REPLACE FUNCTION cleanup_expired_efficiency_cache()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM efficiency_metrics_cache WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_efficiency_cache ON efficiency_metrics_cache;
CREATE TRIGGER trigger_cleanup_efficiency_cache
  AFTER INSERT ON efficiency_metrics_cache
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_expired_efficiency_cache();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get latest efficiency score for user
CREATE OR REPLACE FUNCTION get_latest_efficiency_score(p_user_id UUID)
RETURNS TABLE (
  overall_score INTEGER,
  utilization_score INTEGER,
  cost_efficiency_score INTEGER,
  sustainability_score INTEGER,
  versatility_score INTEGER,
  curation_score INTEGER,
  insights JSONB,
  trends JSONB,
  benchmarks JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    es.overall_score,
    es.utilization_score,
    es.cost_efficiency_score,
    es.sustainability_score,
    es.versatility_score,
    es.curation_score,
    es.insights,
    es.trends,
    es.benchmarks,
    es.created_at
  FROM efficiency_scores es
  WHERE es.user_id = p_user_id
  ORDER BY es.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get efficiency score history for user
CREATE OR REPLACE FUNCTION get_efficiency_score_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  overall_score INTEGER,
  utilization_score INTEGER,
  cost_efficiency_score INTEGER,
  sustainability_score INTEGER,
  versatility_score INTEGER,
  curation_score INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    es.overall_score,
    es.utilization_score,
    es.cost_efficiency_score,
    es.sustainability_score,
    es.versatility_score,
    es.curation_score,
    es.created_at
  FROM efficiency_scores es
  WHERE es.user_id = p_user_id
  ORDER BY es.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get active efficiency goals for user
CREATE OR REPLACE FUNCTION get_active_efficiency_goals(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  target INTEGER,
  current INTEGER,
  deadline TIMESTAMPTZ,
  description TEXT,
  milestones JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eg.id,
    eg.type,
    eg.target,
    eg.current,
    eg.deadline,
    eg.description,
    eg.milestones,
    eg.created_at,
    eg.updated_at
  FROM efficiency_goals eg
  WHERE eg.user_id = p_user_id
    AND eg.is_active = TRUE
    AND eg.deadline > NOW()
  ORDER BY eg.deadline ASC;
END;
$$ LANGUAGE plpgsql;

-- Calculate efficiency percentile for user
CREATE OR REPLACE FUNCTION calculate_efficiency_percentile(
  p_user_id UUID,
  p_score_type TEXT DEFAULT 'overall'
)
RETURNS INTEGER AS $$
DECLARE
  user_score INTEGER;
  total_users INTEGER;
  better_users INTEGER;
  percentile INTEGER;
BEGIN
  -- Get user's latest score
  EXECUTE format('
    SELECT %I_score 
    FROM efficiency_scores 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  ', p_score_type) 
  INTO user_score 
  USING p_user_id;
  
  IF user_score IS NULL THEN
    RETURN 50; -- Default percentile if no score found
  END IF;
  
  -- Get total number of users with scores
  SELECT COUNT(DISTINCT user_id) INTO total_users
  FROM efficiency_scores;
  
  IF total_users = 0 THEN
    RETURN 50;
  END IF;
  
  -- Count users with lower scores
  EXECUTE format('
    SELECT COUNT(DISTINCT es.user_id)
    FROM efficiency_scores es
    INNER JOIN (
      SELECT user_id, MAX(created_at) as max_created
      FROM efficiency_scores
      GROUP BY user_id
    ) latest ON es.user_id = latest.user_id AND es.created_at = latest.max_created
    WHERE es.%I_score < $1
  ', p_score_type)
  INTO better_users
  USING user_score;
  
  -- Calculate percentile
  percentile := ROUND((better_users::DECIMAL / total_users::DECIMAL) * 100);
  
  RETURN percentile;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE efficiency_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE efficiency_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE efficiency_metrics_cache ENABLE ROW LEVEL SECURITY;

-- Efficiency scores policies
CREATE POLICY "Users can view their own efficiency scores" ON efficiency_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own efficiency scores" ON efficiency_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own efficiency scores" ON efficiency_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Efficiency goals policies
CREATE POLICY "Users can view their own efficiency goals" ON efficiency_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own efficiency goals" ON efficiency_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own efficiency goals" ON efficiency_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own efficiency goals" ON efficiency_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Efficiency metrics cache policies
CREATE POLICY "Users can view their own efficiency metrics cache" ON efficiency_metrics_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own efficiency metrics cache" ON efficiency_metrics_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own efficiency metrics cache" ON efficiency_metrics_cache
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own efficiency metrics cache" ON efficiency_metrics_cache
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE efficiency_scores IS 'Stores comprehensive efficiency scores for users wardrobe management';
COMMENT ON TABLE efficiency_goals IS 'Tracks user-defined efficiency improvement goals';
COMMENT ON TABLE efficiency_metrics_cache IS 'Caches expensive efficiency metric calculations';

COMMENT ON COLUMN efficiency_scores.overall_score IS 'Weighted average of all efficiency categories (0-100)';
COMMENT ON COLUMN efficiency_scores.utilization_score IS 'How effectively user utilizes their wardrobe (0-100)';
COMMENT ON COLUMN efficiency_scores.cost_efficiency_score IS 'Cost per wear optimization score (0-100)';
COMMENT ON COLUMN efficiency_scores.sustainability_score IS 'Sustainability and longevity practices score (0-100)';
COMMENT ON COLUMN efficiency_scores.versatility_score IS 'Wardrobe versatility and mix-match potential (0-100)';
COMMENT ON COLUMN efficiency_scores.curation_score IS 'Quality and curation of wardrobe items (0-100)';

COMMENT ON COLUMN efficiency_goals.type IS 'Type of efficiency goal: utilization, cost_efficiency, sustainability, versatility, or curation';
COMMENT ON COLUMN efficiency_goals.target IS 'Target score to achieve (0-100)';
COMMENT ON COLUMN efficiency_goals.current IS 'Current score in this category (0-100)';
COMMENT ON COLUMN efficiency_goals.milestones IS 'JSON array of milestone progress tracking';

COMMENT ON FUNCTION get_latest_efficiency_score(UUID) IS 'Returns the most recent efficiency score for a user';
COMMENT ON FUNCTION get_efficiency_score_history(UUID, INTEGER) IS 'Returns historical efficiency scores for trend analysis';
COMMENT ON FUNCTION get_active_efficiency_goals(UUID) IS 'Returns active efficiency goals for a user';
COMMENT ON FUNCTION calculate_efficiency_percentile(UUID, TEXT) IS 'Calculates user percentile ranking for efficiency scores';
