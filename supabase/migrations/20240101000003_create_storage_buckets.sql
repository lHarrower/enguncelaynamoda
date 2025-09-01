-- AYNAMODA Storage Buckets Migration
-- Dosya yükleme için storage bucket'ları ve politikaları

-- Avatar bucket'ı oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Wardrobe images bucket'ı oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Avatar bucket politikaları

-- Herkes avatar'ları görebilir (public bucket)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Kullanıcılar kendi avatar'larını yükleyebilir
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Kullanıcılar kendi avatar'larını güncelleyebilir
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Kullanıcılar kendi avatar'larını silebilir
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Wardrobe images bucket politikaları

-- Kullanıcılar kendi gardırop resimlerini görebilir
CREATE POLICY "Users can view their own wardrobe images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'wardrobe-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Kullanıcılar kendi gardırop resimlerini yükleyebilir
CREATE POLICY "Users can upload their own wardrobe images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wardrobe-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Kullanıcılar kendi gardırop resimlerini güncelleyebilir
CREATE POLICY "Users can update their own wardrobe images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wardrobe-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Kullanıcılar kendi gardırop resimlerini silebilir
CREATE POLICY "Users can delete their own wardrobe images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wardrobe-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Dosya boyutu ve tip kısıtlamaları için fonksiyon
CREATE OR REPLACE FUNCTION public.validate_file_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Maksimum dosya boyutu: 10MB
  IF NEW.metadata->>'size' IS NOT NULL AND 
     (NEW.metadata->>'size')::bigint > 10485760 THEN
    RAISE EXCEPTION 'File size exceeds 10MB limit';
  END IF;
  
  -- İzin verilen dosya tipleri
  IF NEW.metadata->>'mimetype' IS NOT NULL AND 
     NEW.metadata->>'mimetype' NOT SIMILAR TO '(image/jpeg|image/png|image/webp|image/heic)' THEN
    RAISE EXCEPTION 'File type not allowed. Only JPEG, PNG, WebP, and HEIC images are permitted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dosya doğrulama trigger'ları
CREATE TRIGGER validate_avatar_upload
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION public.validate_file_upload();

CREATE TRIGGER validate_wardrobe_image_upload
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'wardrobe-images')
  EXECUTE FUNCTION public.validate_file_upload();