-- AYNAMODA Wardrobe Items Table Migration
-- Gardırop öğeleri tablosu ve RLS politikaları

-- Enum types oluştur
CREATE TYPE item_category AS ENUM (
  'tops',
  'bottoms', 
  'dresses',
  'shoes',
  'accessories',
  'outerwear',
  'activewear'
);

CREATE TYPE item_size AS ENUM (
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46',
  'One Size'
);

-- Wardrobe items tablosu oluştur
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category item_category NOT NULL,
  subcategory TEXT,
  brand TEXT,
  color TEXT,
  size item_size,
  price DECIMAL(10,2),
  purchase_date DATE,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  ai_generated_name TEXT,
  style_dna JSONB DEFAULT '{}',
  sustainability_score INTEGER CHECK (sustainability_score >= 0 AND sustainability_score <= 100),
  wear_count INTEGER DEFAULT 0 CHECK (wear_count >= 0),
  last_worn TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS'yi etkinleştir
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi gardırop öğelerini görebilir
CREATE POLICY "Users can view own wardrobe items" ON public.wardrobe_items
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi gardırop öğelerini ekleyebilir
CREATE POLICY "Users can insert own wardrobe items" ON public.wardrobe_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi gardırop öğelerini güncelleyebilir
CREATE POLICY "Users can update own wardrobe items" ON public.wardrobe_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi gardırop öğelerini silebilir
CREATE POLICY "Users can delete own wardrobe items" ON public.wardrobe_items
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger'ı
CREATE TRIGGER wardrobe_items_updated_at
  BEFORE UPDATE ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- İndeksler
CREATE INDEX IF NOT EXISTS wardrobe_items_user_id_idx ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS wardrobe_items_category_idx ON public.wardrobe_items(category);
CREATE INDEX IF NOT EXISTS wardrobe_items_brand_idx ON public.wardrobe_items(brand);
CREATE INDEX IF NOT EXISTS wardrobe_items_color_idx ON public.wardrobe_items(color);
CREATE INDEX IF NOT EXISTS wardrobe_items_tags_idx ON public.wardrobe_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS wardrobe_items_created_at_idx ON public.wardrobe_items(created_at);
CREATE INDEX IF NOT EXISTS wardrobe_items_last_worn_idx ON public.wardrobe_items(last_worn);
CREATE INDEX IF NOT EXISTS wardrobe_items_wear_count_idx ON public.wardrobe_items(wear_count);
CREATE INDEX IF NOT EXISTS wardrobe_items_is_favorite_idx ON public.wardrobe_items(is_favorite);
CREATE INDEX IF NOT EXISTS wardrobe_items_is_archived_idx ON public.wardrobe_items(is_archived);

-- Gardırop istatistikleri için view
CREATE OR REPLACE VIEW public.wardrobe_stats AS
SELECT 
  user_id,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE category = 'tops') as tops_count,
  COUNT(*) FILTER (WHERE category = 'bottoms') as bottoms_count,
  COUNT(*) FILTER (WHERE category = 'dresses') as dresses_count,
  COUNT(*) FILTER (WHERE category = 'shoes') as shoes_count,
  COUNT(*) FILTER (WHERE category = 'accessories') as accessories_count,
  COUNT(*) FILTER (WHERE category = 'outerwear') as outerwear_count,
  COUNT(*) FILTER (WHERE category = 'activewear') as activewear_count,
  SUM(wear_count) as total_wears,
  AVG(wear_count) as average_wears,
  COUNT(*) FILTER (WHERE wear_count = 0) as unworn_items,
  COUNT(*) FILTER (WHERE is_favorite = true) as favorite_items,
  COUNT(*) FILTER (WHERE is_archived = true) as archived_items,
  AVG(sustainability_score) FILTER (WHERE sustainability_score IS NOT NULL) as avg_sustainability_score,
  MAX(created_at) as last_added_item,
  MAX(last_worn) as last_worn_item
FROM public.wardrobe_items
GROUP BY user_id;

-- RLS for wardrobe_stats view
ALTER VIEW public.wardrobe_stats SET (security_invoker = true);