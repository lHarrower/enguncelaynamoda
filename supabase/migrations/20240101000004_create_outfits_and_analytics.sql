-- AYNAMODA Outfits and Analytics Tables Migration
-- Kombin ve analitik tabloları ile RLS politikaları

-- Outfits tablosu oluştur
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  season TEXT,
  weather_conditions JSONB DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  color_palette TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  wear_count INTEGER DEFAULT 0 CHECK (wear_count >= 0),
  last_worn TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Outfit items junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.outfit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(outfit_id, wardrobe_item_id)
);

-- Style analytics tablosu
CREATE TABLE IF NOT EXISTS public.style_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE NOT NULL,
  style_profile JSONB DEFAULT '{}',
  color_preferences JSONB DEFAULT '{}',
  brand_preferences JSONB DEFAULT '{}',
  category_distribution JSONB DEFAULT '{}',
  wear_patterns JSONB DEFAULT '{}',
  sustainability_metrics JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, analysis_date)
);

-- User preferences tablosu
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  style_preferences JSONB DEFAULT '{}',
  color_preferences JSONB DEFAULT '{}',
  brand_preferences JSONB DEFAULT '{}',
  size_preferences JSONB DEFAULT '{}',
  budget_preferences JSONB DEFAULT '{}',
  sustainability_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- RLS politikaları - Outfits
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits" ON public.outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits" ON public.outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits" ON public.outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits" ON public.outfits
  FOR DELETE USING (auth.uid() = user_id);

-- RLS politikaları - Outfit Items
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfit items" ON public.outfit_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own outfit items" ON public.outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.wardrobe_items 
      WHERE wardrobe_items.id = outfit_items.wardrobe_item_id 
      AND wardrobe_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own outfit items" ON public.outfit_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own outfit items" ON public.outfit_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

-- RLS politikaları - Style Analytics
ALTER TABLE public.style_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON public.style_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.style_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.style_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics" ON public.style_analytics
  FOR DELETE USING (auth.uid() = user_id);

-- RLS politikaları - User Preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger'ları
CREATE TRIGGER outfits_updated_at
  BEFORE UPDATE ON public.outfits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER style_analytics_updated_at
  BEFORE UPDATE ON public.style_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- İndeksler
CREATE INDEX IF NOT EXISTS outfits_user_id_idx ON public.outfits(user_id);
CREATE INDEX IF NOT EXISTS outfits_occasion_idx ON public.outfits(occasion);
CREATE INDEX IF NOT EXISTS outfits_season_idx ON public.outfits(season);
CREATE INDEX IF NOT EXISTS outfits_style_tags_idx ON public.outfits USING GIN(style_tags);
CREATE INDEX IF NOT EXISTS outfits_created_at_idx ON public.outfits(created_at);
CREATE INDEX IF NOT EXISTS outfits_last_worn_idx ON public.outfits(last_worn);
CREATE INDEX IF NOT EXISTS outfits_is_favorite_idx ON public.outfits(is_favorite);

CREATE INDEX IF NOT EXISTS outfit_items_outfit_id_idx ON public.outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS outfit_items_wardrobe_item_id_idx ON public.outfit_items(wardrobe_item_id);

CREATE INDEX IF NOT EXISTS style_analytics_user_id_idx ON public.style_analytics(user_id);
CREATE INDEX IF NOT EXISTS style_analytics_analysis_date_idx ON public.style_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Outfit istatistikleri için view
CREATE OR REPLACE VIEW public.outfit_stats AS
SELECT 
  user_id,
  COUNT(*) as total_outfits,
  COUNT(*) FILTER (WHERE is_favorite = true) as favorite_outfits,
  SUM(wear_count) as total_outfit_wears,
  AVG(wear_count) as average_outfit_wears,
  COUNT(*) FILTER (WHERE wear_count = 0) as unworn_outfits,
  AVG(rating) FILTER (WHERE rating IS NOT NULL) as average_rating,
  MAX(created_at) as last_created_outfit,
  MAX(last_worn) as last_worn_outfit
FROM public.outfits
GROUP BY user_id;

-- RLS for outfit_stats view
ALTER VIEW public.outfit_stats SET (security_invoker = true);