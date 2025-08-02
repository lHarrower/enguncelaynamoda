-- Create Style DNA Profiles Table
-- This table stores AI-generated style profiles based on user photo uploads

CREATE TABLE IF NOT EXISTS style_dna_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Visual Analysis Results
  visual_analysis JSONB NOT NULL DEFAULT '{}',
  
  -- Style Personality
  style_personality JSONB NOT NULL DEFAULT '{}',
  
  -- Color Palette
  color_palette JSONB NOT NULL DEFAULT '{}',
  
  -- Style Preferences
  style_preferences JSONB NOT NULL DEFAULT '{}',
  
  -- AI Recommendations
  recommendations JSONB NOT NULL DEFAULT '{}',
  
  -- Confidence Score (0.0 to 1.0)
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0),
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_style_dna_profiles_user_id ON style_dna_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_style_dna_profiles_created_at ON style_dna_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_style_dna_profiles_confidence ON style_dna_profiles(confidence);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_style_dna_profiles_updated_at
    BEFORE UPDATE ON style_dna_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE style_dna_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own style DNA profiles"
  ON style_dna_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own style DNA profiles"
  ON style_dna_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own style DNA profiles"
  ON style_dna_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own style DNA profiles"
  ON style_dna_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE style_dna_profiles IS 'Stores AI-generated style profiles based on user photo uploads';
COMMENT ON COLUMN style_dna_profiles.visual_analysis IS 'JSON containing dominant colors, style categories, patterns, textures, etc.';
COMMENT ON COLUMN style_dna_profiles.style_personality IS 'JSON containing primary/secondary personality and description';
COMMENT ON COLUMN style_dna_profiles.color_palette IS 'JSON containing primary, accent, and neutral color arrays';
COMMENT ON COLUMN style_dna_profiles.style_preferences IS 'JSON containing formality, energy, and silhouette preferences';
COMMENT ON COLUMN style_dna_profiles.recommendations IS 'JSON containing strengths, suggestions, and avoidances';
COMMENT ON COLUMN style_dna_profiles.confidence IS 'AI confidence score from 0.0 to 1.0';