// Cloudinary Yükleme / Analiz Yanıtı (uygulamada kullanılan dar alt küme)
// Değişikliği minimize etmek için sadece eriştiğimiz alanları tipliyoruz.

export interface CloudinaryColorEntry {
  0?: string; // tuple-tarzı ilk eleman (isim veya hex)
  1?: unknown; // tuple ikinci eleman (skor)
  name?: string; // nesne tarzı
  value?: string; // nesne tarzı alternatif
}

export interface CloudinaryUploadResult {
  tags?: string[];
  colors?: CloudinaryColorEntry[] | string[]; // tuple/nesne veya basit string'lerin birleşimi
  confidence?: number;
  [key: string]: unknown; // ek alanları izin ver
}

export function isCloudinaryResult(v: unknown): v is CloudinaryUploadResult {
  if (!v || typeof v !== 'object') {
    return false;
  }
  const anyV = v as Record<string, unknown>;
  if (Array.isArray(anyV.tags) || Array.isArray(anyV.colors)) {
    return true;
  }
  return false;
}
