# İnternasyonalleşme (i18n) Analiz Raporu

## Mevcut Durum

### ✅ Var Olan Özellikler

- **Dil Seçimi**: `NamingPreferences.tsx`'de 5 dil seçeneği (EN, ES, FR, DE, IT)
- **Dil Tercihi Saklama**: `preferredLanguage` alanı veritabanında saklanıyor
- **AI İsimlendirme Dil Desteği**: AI servisinde dil tercihi kullanılıyor
- **Temel Tarih Formatları**: `toLocaleDateString()` kullanımı

### ❌ Eksik Olan Özellikler

- **Çeviri Framework'ü**: expo-localization ve i18n-js kurulu değil
- **Çeviri Dosyaları**: Dil dosyaları mevcut değil
- **UI Metinleri**: Tüm UI metinleri hardcoded İngilizce
- **Dinamik Dil Değişimi**: Runtime'da dil değiştirme sistemi yok
- **Pluralization**: Çoğul form desteği yok
- **RTL Desteği**: Sağdan sola yazılan diller için destek yok

## Teknik Analiz

### Mevcut Dil Altyapısı

```typescript
// NamingPreferences.tsx
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
];

// aynaMirror.ts
export interface NamingPreferences {
  preferredLanguage: string;
  // ...
}
```

### Hardcoded Metinler (Örnekler)

- "Descriptive", "Creative", "Minimal" (NamingPreferences.tsx)
- "Language", "Brand Focused" (UI etiketleri)
- "My Favorite Blue Sneakers" (örnek metinler)
- Error mesajları ve bildirimler
- Kategori isimleri ve açıklamalar

## İmplementasyon Planı

### Faz 1: Temel Altyapı (1-2 hafta)

#### 1.1 Paket Kurulumları

```bash
npx expo install expo-localization
npm install i18n-js
npm install @types/i18n-js --save-dev
```

#### 1.2 Dizin Yapısı

```
src/
├── locales/
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   ├── de.json
│   ├── it.json
│   └── index.ts
├── hooks/
│   └── useTranslation.ts
└── utils/
    └── i18n.ts
```

#### 1.3 i18n Konfigürasyonu

```typescript
// src/utils/i18n.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const i18n = new I18n({
  en: require('@/locales/en.json'),
  es: require('@/locales/es.json'),
  fr: require('@/locales/fr.json'),
  de: require('@/locales/de.json'),
  it: require('@/locales/it.json'),
});

i18n.locale = Localization.locale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
```

### Faz 2: Çeviri Dosyaları (2-3 hafta)

#### 2.1 Ana Kategoriler

- **UI Elementleri**: Butonlar, etiketler, başlıklar
- **Navigasyon**: Tab isimleri, screen başlıkları
- **Form Alanları**: Input placeholder'ları, validasyon mesajları
- **Error Mesajları**: Hata ve başarı bildirimleri
- **Kategori İsimleri**: Wardrobe kategorileri
- **AI İsimlendirme**: Stil şablonları ve örnekler

#### 2.2 Örnek Çeviri Dosyası (en.json)

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading..."
  },
  "navigation": {
    "wardrobe": "Wardrobe",
    "mirror": "Mirror",
    "discovery": "Discovery",
    "profile": "Profile"
  },
  "naming": {
    "styles": {
      "descriptive": "Descriptive",
      "creative": "Creative",
      "minimal": "Minimal",
      "brand_focused": "Brand Focused"
    },
    "examples": {
      "descriptive": "Blue Nike Running Shoes",
      "creative": "My Favorite Blue Sneakers"
    }
  },
  "categories": {
    "tops": "Tops",
    "bottoms": "Bottoms",
    "shoes": "Shoes",
    "accessories": "Accessories"
  }
}
```

### Faz 3: Hook ve Context (1 hafta)

#### 3.1 Translation Hook

```typescript
// src/hooks/useTranslation.ts
import { useCallback, useEffect, useState } from 'react';
import i18n from '@/utils/i18n';
import { useAuth } from './useAuth';

export const useTranslation = () => {
  const { user } = useAuth();
  const [locale, setLocale] = useState(i18n.locale);

  const t = useCallback(
    (key: string, options?: any) => {
      return i18n.t(key, options);
    },
    [locale],
  );

  const changeLanguage = useCallback(async (newLocale: string) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
    // Save to user preferences
  }, []);

  return { t, locale, changeLanguage };
};
```

### Faz 4: Component Güncellemeleri (2-3 hafta)

#### 4.1 Öncelikli Componentler

1. **NamingPreferences.tsx** - Dil seçimi ve stil seçenekleri
2. **Navigation** - Tab bar ve screen başlıkları
3. **WardrobeScreen** - Kategori isimleri
4. **Error Components** - Hata mesajları
5. **Form Components** - Input etiketleri

#### 4.2 Örnek Güncelleme

```typescript
// Önce
<Text>Descriptive</Text>

// Sonra
const { t } = useTranslation();
<Text>{t('naming.styles.descriptive')}</Text>
```

### Faz 5: Gelişmiş Özellikler (1-2 hafta)

#### 5.1 Pluralization

```json
{
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{{count}} items"
  }
}
```

#### 5.2 Date/Number Formatting

```typescript
const formatDate = (date: Date) => {
  return date.toLocaleDateString(i18n.locale);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(i18n.locale, {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

## Çeviri Stratejisi

### Öncelik Sırası

1. **Yüksek Öncelik**: Ana navigasyon, temel UI elementleri
2. **Orta Öncelik**: Form alanları, kategori isimleri
3. **Düşük Öncelik**: Açıklama metinleri, örnekler

### Çeviri Kaynakları

- **İngilizce**: Mevcut (kaynak dil)
- **İspanyolca**: Profesyonel çeviri gerekli
- **Fransızca**: Profesyonel çeviri gerekli
- **Almanca**: Profesyonel çeviri gerekli
- **İtalyanca**: Profesyonel çeviri gerekli

## Test Stratejisi

### Unit Tests

```typescript
describe('i18n', () => {
  it('should return correct translation', () => {
    i18n.locale = 'en';
    expect(i18n.t('common.save')).toBe('Save');
  });

  it('should fallback to default locale', () => {
    i18n.locale = 'unknown';
    expect(i18n.t('common.save')).toBe('Save');
  });
});
```

### Manual Testing

- Her dilde UI kontrolü
- Dil değiştirme fonksiyonalitesi
- Metin uzunluğu kontrolü (özellikle Almanca)
- Karakter encoding kontrolü

## Performans Considerations

### Bundle Size

- Lazy loading ile sadece aktif dil yüklensin
- Çeviri dosyalarını minimize et
- Tree shaking ile kullanılmayan çevirileri çıkar

### Memory Usage

- Çeviri cache'i optimize et
- Büyük çeviri dosyalarını böl

## Maintenance Plan

### Çeviri Güncellemeleri

- Yeni özellikler için çeviri checklist
- Çeviri dosyalarının versiyon kontrolü
- Missing translation detection

### Automation

- CI/CD'de eksik çeviri kontrolü
- Çeviri dosyası format validation
- Automated translation suggestions

## Tahmini Süre ve Kaynak

### Toplam Süre: 7-11 hafta

- Faz 1: 1-2 hafta (Altyapı)
- Faz 2: 2-3 hafta (Çeviri dosyaları)
- Faz 3: 1 hafta (Hook/Context)
- Faz 4: 2-3 hafta (Component güncellemeleri)
- Faz 5: 1-2 hafta (Gelişmiş özellikler)

### Kaynak İhtiyacı

- **Developer**: 1 full-time
- **Translator**: 4 dil için profesyonel çeviri
- **QA**: Her dil için test

## Risk Analizi

### Yüksek Risk

- **Metin Uzunluğu**: Almanca metinler UI'ı bozabilir
- **Çeviri Kalitesi**: Kötü çeviri UX'i olumsuz etkiler
- **Performance**: Büyük çeviri dosyaları yavaşlık yaratabilir

### Düşük Risk

- **Technical Implementation**: Expo ve React Native iyi destekliyor
- **Maintenance**: Established patterns mevcut

## Sonuç

Mevcut durumda sadece dil seçimi var, kapsamlı bir i18n sistemi eksik. Önerilen plan ile 7-11 hafta içinde tam özellikli çoklu dil desteği implementasyonu mümkün. Öncelik sırasına göre aşamalı geliştirme yapılması öneriliyor.
