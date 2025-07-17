-- AYNAMODA Database Setup Script
-- Run this in your Supabase SQL Editor to set up the user_profiles table

-- Create user_profiles table for storing Style DNA and onboarding data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Style DNA data from onboarding survey
  style_dna JSONB,
  
  -- First outfit choice during onboarding
  first_outfit_choice JSONB,
  
  -- Onboarding completion status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_date TIMESTAMPTZ,
  confidence_loop_experienced BOOLEAN DEFAULT FALSE,
  
  -- User preferences learned over time
  preferred_brands TEXT[],
  preferred_colors TEXT[],
  preferred_styles TEXT[],
  favorite_boutiques TEXT[],
  
  -- AI learning data
  confidence_threshold INTEGER DEFAULT 90,
  disliked_patterns TEXT[],
  
  -- Behavioral tracking
  total_swipes INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_dislikes INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(onboarding_completed);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 'user_profiles table created successfully!' as status;