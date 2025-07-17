-- AYNA Mirror User Preferences Migration
-- Migration: 003_user_preferences.sql
-- Description: Create user preferences table and related functions

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

-- Index for timezone queries (for notification scheduling)
CREATE INDEX IF NOT EXISTS idx_user_preferences_timezone 
ON user_preferences(timezone);

-- Index for notification time queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_notification_time 
ON user_preferences(notification_time);

-- Index for engagement tracking
CREATE INDEX IF NOT EXISTS idx_user_preferences_engagement 
ON user_preferences USING GIN (engagement_history);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user_preferences table
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PREFERENCE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to get user preferences with defaults
CREATE OR REPLACE FUNCTION get_user_preferences_with_defaults(user_uuid UUID)
RETURNS TABLE(
  user_id UUID,
  notification_time TIME,
  timezone TEXT,
  style_preferences JSONB,
  privacy_settings JSONB,
  engagement_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Try to get existing preferences
  RETURN QUERY
  SELECT 
    up.user_id,
    up.notification_time,
    up.timezone,
    up.style_preferences,
    up.privacy_settings,
    up.engagement_history,
    up.created_at,
    up.updated_at
  FROM user_preferences up
  WHERE up.user_id = user_uuid;
  
  -- If no preferences found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      user_uuid as user_id,
      '06:00:00'::TIME as notification_time,
      'UTC'::TEXT as timezone,
      '{
        "preferredColors": [],
        "preferredStyles": [],
        "bodyTypePreferences": [],
        "occasionPreferences": {},
        "confidencePatterns": [],
        "confidenceNoteStyle": "encouraging"
      }'::JSONB as style_preferences,
      '{
        "shareUsageData": false,
        "allowLocationTracking": true,
        "enableSocialFeatures": true,
        "dataRetentionDays": 365
      }'::JSONB as privacy_settings,
      '{
        "totalDaysActive": 0,
        "streakDays": 0,
        "averageRating": 0,
        "lastActiveDate": null,
        "preferredInteractionTimes": []
      }'::JSONB as engagement_history,
      NOW() as created_at,
      NOW() as updated_at;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update engagement streak
CREATE OR REPLACE FUNCTION update_engagement_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_engagement JSONB;
  last_active_date DATE;
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  new_streak INTEGER;
  total_days INTEGER;
BEGIN
  -- Get current engagement history
  SELECT engagement_history INTO current_engagement
  FROM user_preferences
  WHERE user_id = user_uuid;
  
  -- If no preferences exist, create them first
  IF current_engagement IS NULL THEN
    INSERT INTO user_preferences (user_id, engagement_history)
    VALUES (user_uuid, '{
      "totalDaysActive": 1,
      "streakDays": 1,
      "averageRating": 0,
      "lastActiveDate": "' || today || '",
      "preferredInteractionTimes": []
    }')
    ON CONFLICT (user_id) DO UPDATE SET
      engagement_history = EXCLUDED.engagement_history,
      updated_at = NOW();
    RETURN;
  END IF;
  
  -- Parse last active date
  last_active_date := (current_engagement->>'lastActiveDate')::DATE;
  
  -- Skip if already updated today
  IF last_active_date = today THEN
    RETURN;
  END IF;
  
  -- Calculate new streak
  IF last_active_date = yesterday THEN
    -- Streak continues
    new_streak := COALESCE((current_engagement->>'streakDays')::INTEGER, 0) + 1;
  ELSE
    -- Streak resets
    new_streak := 1;
  END IF;
  
  -- Calculate total days
  total_days := COALESCE((current_engagement->>'totalDaysActive')::INTEGER, 0) + 1;
  
  -- Update engagement history
  UPDATE user_preferences
  SET 
    engagement_history = jsonb_set(
      jsonb_set(
        jsonb_set(
          current_engagement,
          '{totalDaysActive}',
          to_jsonb(total_days)
        ),
        '{streakDays}',
        to_jsonb(new_streak)
      ),
      '{lastActiveDate}',
      to_jsonb(today::TEXT)
    ),
    updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users by timezone (for notification scheduling)
CREATE OR REPLACE FUNCTION get_users_by_timezone(target_timezone TEXT)
RETURNS TABLE(
  user_id UUID,
  notification_time TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.notification_time
  FROM user_preferences up
  WHERE up.timezone = target_timezone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users for notification at specific time
CREATE OR REPLACE FUNCTION get_users_for_notification(
  target_timezone TEXT,
  target_time TIME
)
RETURNS TABLE(
  user_id UUID,
  notification_time TIME,
  timezone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.user_id,
    up.notification_time,
    up.timezone
  FROM user_preferences up
  WHERE up.timezone = target_timezone
    AND up.notification_time = target_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_preferences_with_defaults(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_engagement_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_timezone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_notification(TEXT, TIME) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;

-- ============================================================================
-- SAMPLE DATA (Optional - for development)
-- ============================================================================

-- Uncomment the following to insert sample preferences for testing
-- Note: This should only be used in development environments

/*
-- Sample user preferences (replace with actual user IDs in development)
INSERT INTO user_preferences (
  user_id,
  notification_time,
  timezone,
  style_preferences,
  privacy_settings,
  engagement_history
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID, -- Replace with actual user ID
  '06:00:00',
  'America/New_York',
  '{
    "preferredColors": ["blue", "black", "white"],
    "preferredStyles": ["casual", "professional"],
    "bodyTypePreferences": [],
    "occasionPreferences": {"work": 0.8, "casual": 0.9},
    "confidencePatterns": [],
    "confidenceNoteStyle": "encouraging"
  }',
  '{
    "shareUsageData": false,
    "allowLocationTracking": true,
    "enableSocialFeatures": true,
    "dataRetentionDays": 365
  }',
  '{
    "totalDaysActive": 5,
    "streakDays": 3,
    "averageRating": 4.2,
    "lastActiveDate": "2024-01-15",
    "preferredInteractionTimes": ["06:00:00", "18:30:00"]
  }'
) ON CONFLICT (user_id) DO NOTHING;
*/