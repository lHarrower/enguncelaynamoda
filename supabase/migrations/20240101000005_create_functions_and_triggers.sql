-- AYNAMODA Database Functions and Triggers Migration
-- Veritabanı fonksiyonları ve trigger'ları

-- Updated_at trigger fonksiyonu (eğer yoksa)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profil oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Varsayılan kullanıcı tercihleri oluştur
  INSERT INTO public.user_preferences (user_id, style_preferences, notification_preferences)
  VALUES (
    NEW.id, 
    '{
      "preferred_styles": [],
      "avoided_styles": [],
      "style_personality": "casual",
      "risk_tolerance": "medium"
    }',
    '{
      "outfit_suggestions": true,
      "wardrobe_reminders": true,
      "style_insights": true,
      "marketing_emails": false
    }'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni kullanıcı trigger'ı
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Gardırop istatistikleri fonksiyonu
CREATE OR REPLACE FUNCTION public.get_wardrobe_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_items', COUNT(*),
    'categories', json_object_agg(category, category_count),
    'colors', json_object_agg(primary_color, color_count),
    'brands', json_object_agg(brand, brand_count),
    'seasons', json_object_agg(season, season_count),
    'unworn_items', COUNT(*) FILTER (WHERE times_worn = 0),
    'most_worn_item', MAX(times_worn),
    'average_wear_count', AVG(times_worn),
    'total_value', SUM(COALESCE(purchase_price, 0)),
    'items_added_this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  ) INTO stats
  FROM (
    SELECT 
      category,
      primary_color,
      brand,
      season,
      times_worn,
      purchase_price,
      created_at,
      COUNT(*) OVER (PARTITION BY category) as category_count,
      COUNT(*) OVER (PARTITION BY primary_color) as color_count,
      COUNT(*) OVER (PARTITION BY brand) as brand_count,
      COUNT(*) OVER (PARTITION BY season) as season_count
    FROM public.wardrobe_items 
    WHERE user_id = user_uuid
  ) subquery;
  
  RETURN COALESCE(stats, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stil analizi güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_style_analysis(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  analysis_data JSONB;
  color_data JSONB;
  brand_data JSONB;
  category_data JSONB;
  wear_data JSONB;
BEGIN
  -- Renk tercihleri analizi
  SELECT jsonb_object_agg(primary_color, color_count) INTO color_data
  FROM (
    SELECT primary_color, COUNT(*) as color_count
    FROM public.wardrobe_items 
    WHERE user_id = user_uuid AND primary_color IS NOT NULL
    GROUP BY primary_color
    ORDER BY color_count DESC
    LIMIT 10
  ) color_stats;
  
  -- Marka tercihleri analizi
  SELECT jsonb_object_agg(brand, brand_count) INTO brand_data
  FROM (
    SELECT brand, COUNT(*) as brand_count
    FROM public.wardrobe_items 
    WHERE user_id = user_uuid AND brand IS NOT NULL
    GROUP BY brand
    ORDER BY brand_count DESC
    LIMIT 10
  ) brand_stats;
  
  -- Kategori dağılımı
  SELECT jsonb_object_agg(category, category_count) INTO category_data
  FROM (
    SELECT category, COUNT(*) as category_count
    FROM public.wardrobe_items 
    WHERE user_id = user_uuid
    GROUP BY category
  ) category_stats;
  
  -- Giyim alışkanlıkları
  SELECT jsonb_build_object(
    'most_worn_categories', most_worn_cats,
    'least_worn_categories', least_worn_cats,
    'seasonal_preferences', seasonal_prefs,
    'average_wear_frequency', avg_wear
  ) INTO wear_data
  FROM (
    SELECT 
      jsonb_agg(jsonb_build_object('category', category, 'avg_wear', avg_wear) ORDER BY avg_wear DESC) FILTER (WHERE rn_desc <= 3) as most_worn_cats,
      jsonb_agg(jsonb_build_object('category', category, 'avg_wear', avg_wear) ORDER BY avg_wear ASC) FILTER (WHERE rn_asc <= 3) as least_worn_cats,
      jsonb_object_agg(season, season_wear) as seasonal_prefs,
      AVG(avg_wear) as avg_wear
    FROM (
      SELECT 
        category,
        season,
        AVG(times_worn) as avg_wear,
        AVG(times_worn) OVER (PARTITION BY season) as season_wear,
        ROW_NUMBER() OVER (ORDER BY AVG(times_worn) DESC) as rn_desc,
        ROW_NUMBER() OVER (ORDER BY AVG(times_worn) ASC) as rn_asc
      FROM public.wardrobe_items 
      WHERE user_id = user_uuid
      GROUP BY category, season
    ) wear_analysis
  ) wear_summary;
  
  -- Stil profili oluştur
  analysis_data := jsonb_build_object(
    'dominant_style', 'casual', -- Bu AI ile belirlenebilir
    'color_palette_preference', 'neutral', -- Renk analizine göre
    'brand_loyalty_score', CASE 
      WHEN jsonb_array_length(jsonb_object_keys(brand_data)) <= 5 THEN 'high'
      WHEN jsonb_array_length(jsonb_object_keys(brand_data)) <= 15 THEN 'medium'
      ELSE 'low'
    END,
    'wardrobe_diversity_score', jsonb_array_length(jsonb_object_keys(category_data)),
    'sustainability_score', 75 -- Hesaplanabilir metrik
  );
  
  -- Analizi kaydet veya güncelle
  INSERT INTO public.style_analytics (
    user_id, 
    analysis_date, 
    style_profile, 
    color_preferences, 
    brand_preferences, 
    category_distribution, 
    wear_patterns
  )
  VALUES (
    user_uuid,
    CURRENT_DATE,
    analysis_data,
    COALESCE(color_data, '{}'::jsonb),
    COALESCE(brand_data, '{}'::jsonb),
    COALESCE(category_data, '{}'::jsonb),
    COALESCE(wear_data, '{}'::jsonb)
  )
  ON CONFLICT (user_id, analysis_date)
  DO UPDATE SET
    style_profile = EXCLUDED.style_profile,
    color_preferences = EXCLUDED.color_preferences,
    brand_preferences = EXCLUDED.brand_preferences,
    category_distribution = EXCLUDED.category_distribution,
    wear_patterns = EXCLUDED.wear_patterns,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kombin önerisi fonksiyonu
CREATE OR REPLACE FUNCTION public.suggest_outfits(
  user_uuid UUID,
  occasion_filter TEXT DEFAULT NULL,
  season_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE(
  outfit_id UUID,
  outfit_name TEXT,
  items JSONB,
  style_score NUMERIC,
  color_harmony_score NUMERIC
) AS $$
BEGIN
  -- Bu fonksiyon AI algoritması ile geliştirilebilir
  -- Şimdilik basit bir öneri sistemi
  RETURN QUERY
  SELECT 
    o.id as outfit_id,
    o.name as outfit_name,
    jsonb_agg(
      jsonb_build_object(
        'id', wi.id,
        'name', wi.name,
        'category', wi.category,
        'color', wi.primary_color,
        'image_url', wi.image_url
      )
    ) as items,
    (RANDOM() * 5)::NUMERIC(3,2) as style_score, -- Placeholder
    (RANDOM() * 5)::NUMERIC(3,2) as color_harmony_score -- Placeholder
  FROM public.outfits o
  JOIN public.outfit_items oi ON o.id = oi.outfit_id
  JOIN public.wardrobe_items wi ON oi.wardrobe_item_id = wi.id
  WHERE o.user_id = user_uuid
    AND (occasion_filter IS NULL OR o.occasion = occasion_filter)
    AND (season_filter IS NULL OR o.season = season_filter)
  GROUP BY o.id, o.name
  ORDER BY o.rating DESC NULLS LAST, o.wear_count ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gardırop temizlik önerileri fonksiyonu
CREATE OR REPLACE FUNCTION public.get_wardrobe_cleanup_suggestions(user_uuid UUID)
RETURNS TABLE(
  suggestion_type TEXT,
  item_id UUID,
  item_name TEXT,
  reason TEXT,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Hiç giyilmeyen eski ürünler
  SELECT 
    'unworn_old_items'::TEXT as suggestion_type,
    id as item_id,
    name as item_name,
    'Bu ürün ' || EXTRACT(DAYS FROM (NOW() - created_at)) || ' gündür gardırobunuzda ama hiç giyilmemiş.' as reason,
    3 as priority
  FROM public.wardrobe_items
  WHERE user_id = user_uuid 
    AND times_worn = 0 
    AND created_at < NOW() - INTERVAL '6 months'
  
  UNION ALL
  
  -- Çok az giyilen pahalı ürünler
  SELECT 
    'underused_expensive'::TEXT as suggestion_type,
    id as item_id,
    name as item_name,
    'Bu pahalı ürün çok az giyiliyor. Daha fazla kombin oluşturmayı deneyin.' as reason,
    2 as priority
  FROM public.wardrobe_items
  WHERE user_id = user_uuid 
    AND times_worn < 3
    AND purchase_price > 200
    AND created_at < NOW() - INTERVAL '3 months'
  
  UNION ALL
  
  -- Benzer çok fazla ürün
  SELECT 
    'duplicate_items'::TEXT as suggestion_type,
    id as item_id,
    name as item_name,
    'Bu kategoride çok fazla benzer ürününüz var.' as reason,
    1 as priority
  FROM (
    SELECT 
      *,
      COUNT(*) OVER (PARTITION BY category, primary_color) as similar_count
    FROM public.wardrobe_items
    WHERE user_id = user_uuid
  ) similar_items
  WHERE similar_count > 5
  
  ORDER BY priority ASC, item_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gardırop değeri hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION public.calculate_wardrobe_value(user_uuid UUID)
RETURNS TABLE(
  total_value NUMERIC,
  average_item_value NUMERIC,
  most_valuable_category TEXT,
  cost_per_wear NUMERIC,
  roi_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(COALESCE(purchase_price, 0)) as total_value,
    AVG(COALESCE(purchase_price, 0)) as average_item_value,
    (
      SELECT category 
      FROM public.wardrobe_items 
      WHERE user_id = user_uuid 
      GROUP BY category 
      ORDER BY SUM(COALESCE(purchase_price, 0)) DESC 
      LIMIT 1
    ) as most_valuable_category,
    CASE 
      WHEN SUM(times_worn) > 0 THEN SUM(COALESCE(purchase_price, 0)) / SUM(times_worn)
      ELSE NULL
    END as cost_per_wear,
    CASE 
      WHEN SUM(COALESCE(purchase_price, 0)) > 0 THEN 
        (SUM(times_worn) * 10.0) / SUM(COALESCE(purchase_price, 0)) * 100
      ELSE 0
    END as roi_score
  FROM public.wardrobe_items
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otomatik stil analizi trigger'ı
CREATE OR REPLACE FUNCTION public.trigger_style_analysis_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni ürün eklendiğinde veya mevcut ürün güncellendiğinde stil analizini güncelle
  PERFORM public.update_style_analysis(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Gardırop değişikliklerinde stil analizi güncelleme
CREATE TRIGGER wardrobe_style_analysis_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_style_analysis_update();

-- Kombin değişikliklerinde stil analizi güncelleme
CREATE TRIGGER outfit_style_analysis_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.outfits
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_style_analysis_update();