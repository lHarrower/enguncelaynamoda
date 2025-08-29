# Kod Karmaşıklığı İyileştirme Önerileri

## Özet

Kod karmaşıklığı analizi sonucunda **41 fonksiyon** kritik seviyede refactoring gerektiriyor. En problemli dosya `wardrobe.tsx` (18 fonksiyon) ve en yüksek karmaşıklık skoru **80** (Satır 905).

## 🔴 Kritik Öncelik - Acil Müdahale Gereken Fonksiyonlar

### 1. wardrobe.tsx:905 (Karmaşıklık: 80)

**Problem:** Aşırı yüksek bilişsel karmaşıklık
**Çözüm Stratejisi:**

```typescript
// ❌ Mevcut: Tek büyük fonksiyon
function handleComplexWardrobe() {
  // 80 satır karmaşık mantık
}

// ✅ Önerilen: Fonksiyon parçalama
function handleWardrobe() {
  const items = processWardrobeItems();
  const filters = applyFilters(items);
  const sorted = applySorting(filters);
  return renderWardrobeView(sorted);
}

function processWardrobeItems() {
  // Sadece item processing mantığı
}

function applyFilters(items) {
  // Sadece filtreleme mantığı
}

function applySorting(items) {
  // Sadece sıralama mantığı
}

function renderWardrobeView(items) {
  // Sadece render mantığı
}
```

**Uygulama Adımları:**

1. Fonksiyonu sorumluluklarına göre 4-5 parçaya böl
2. Her parça için unit test yaz
3. Integration test ile bütünlüğü doğrula
4. Performance impact ölç

### 2. profile.tsx:50 (Karmaşıklık: 41)

**Problem:** Profil yönetimi çok karmaşık
**Çözüm Stratejisi:**

```typescript
// ✅ Custom Hook Pattern
function useProfileManagement() {
  const { user, updateUser } = useUserData();
  const { preferences, updatePreferences } = useUserPreferences();
  const { settings, updateSettings } = useUserSettings();

  return {
    user,
    preferences,
    settings,
    updateProfile: updateUser,
    updatePreferences,
    updateSettings
  };
}

// ✅ Component'te kullanım
function ProfileScreen() {
  const {
    user,
    preferences,
    settings,
    updateProfile,
    updatePreferences,
    updateSettings
  } = useProfileManagement();

  return (
    <ProfileView
      user={user}
      preferences={preferences}
      settings={settings}
      onUpdateProfile={updateProfile}
      onUpdatePreferences={updatePreferences}
      onUpdateSettings={updateSettings}
    />
  );
}
```

### 3. wardrobe.tsx:1237 (Karmaşıklık: 39)

**Problem:** Karmaşık state management
**Çözüm Stratejisi:**

```typescript
// ✅ State Machine Pattern
import { createMachine, interpret } from 'xstate';

const wardrobeMachine = createMachine({
  id: 'wardrobe',
  initial: 'loading',
  states: {
    loading: {
      on: { LOADED: 'idle' },
    },
    idle: {
      on: {
        FILTER: 'filtering',
        SORT: 'sorting',
        SELECT: 'selecting',
      },
    },
    filtering: {
      on: { DONE: 'idle' },
    },
    sorting: {
      on: { DONE: 'idle' },
    },
    selecting: {
      on: { DONE: 'idle' },
    },
  },
});

// Hook olarak kullanım
function useWardrobeState() {
  const [state, send] = useMachine(wardrobeMachine);
  return { state, send };
}
```

## 🟡 Orta Öncelik - Sistematik İyileştirmeler

### Magic Numbers/Strings Eliminasyonu

**Problem:** ~150+ magic value tespit edildi
**Çözüm:**

```typescript
// ✅ Constants dosyası oluştur
// constants/AppConstants.ts
export const TIMEOUTS = {
  API_DEFAULT: 10000,
  API_EXTENDED: 15000,
  CACHE_SHORT: 5 * 60 * 1000,
  CACHE_LONG: 10 * 60 * 1000,
} as const;

export const UI_CONSTANTS = {
  ITEM_HEIGHTS: {
    GRID: 200,
    LIST: 140,
  },
  ANIMATIONS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 600,
  },
  BREAKPOINTS: {
    SM: 375,
    MD: 414,
    LG: 768,
    XL: 1024,
  },
} as const;

export const DATABASE_CONSTANTS = {
  MAX_METRICS: 100,
  SLOW_QUERY_THRESHOLD: 1000,
  DEFAULT_TTL: 5 * 60 * 1000,
  MAX_CACHE_SIZE: 100,
  DATA_RETENTION_DAYS: 365,
} as const;

// ✅ Type-safe kullanım
type TimeoutKeys = keyof typeof TIMEOUTS;
type UIKeys = keyof typeof UI_CONSTANTS;
```

### Error Messages i18n

```typescript
// ✅ Localization sistemi
// locales/tr/errors.json
{
  "validation": {
    "required_category": "Kategori seçimi zorunludur",
    "required_colors": "En az bir renk seçmelisiniz",
    "invalid_image": "Geçersiz görsel formatı"
  },
  "network": {
    "timeout": "Bağlantı zaman aşımı",
    "offline": "İnternet bağlantısı yok"
  }
}

// hooks/useErrorMessages.ts
export function useErrorMessages() {
  const { t } = useTranslation('errors');

  return {
    validation: {
      requiredCategory: t('validation.required_category'),
      requiredColors: t('validation.required_colors'),
      invalidImage: t('validation.invalid_image')
    },
    network: {
      timeout: t('network.timeout'),
      offline: t('network.offline')
    }
  };
}
```

## 🟢 Düşük Öncelik - Optimizasyonlar

### Component Render Optimizasyonu

```typescript
// ✅ React.memo ve useMemo kullanımı
const WardrobeItem = React.memo(({ item, onSelect }) => {
  const memoizedStyle = useMemo(() => ({
    height: UI_CONSTANTS.ITEM_HEIGHTS.GRID,
    backgroundColor: item.color
  }), [item.color]);

  const handleSelect = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  return (
    <TouchableOpacity style={memoizedStyle} onPress={handleSelect}>
      <Image source={{ uri: item.image_uri }} />
    </TouchableOpacity>
  );
});

// ✅ FlatList optimizasyonu
function WardrobeList({ items }) {
  const renderItem = useCallback(({ item }) => (
    <WardrobeItem item={item} onSelect={handleItemSelect} />
  ), [handleItemSelect]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: UI_CONSTANTS.ITEM_HEIGHTS.GRID,
        offset: UI_CONSTANTS.ITEM_HEIGHTS.GRID * index,
        index
      })}
    />
  );
}
```

## 📋 Uygulama Planı

### Hafta 1: Kritik Fonksiyonlar

- [ ] wardrobe.tsx:905 refactoring
- [ ] profile.tsx:50 custom hook'a çevirme
- [ ] wardrobe.tsx:1237 state machine implementasyonu
- [ ] Unit testler yazma

### Hafta 2: Magic Values

- [ ] Constants dosyaları oluşturma
- [ ] Magic numbers/strings değiştirme
- [ ] Type safety ekleme
- [ ] Regression testler

### Hafta 3: Error Messages & i18n

- [ ] Error messages localization
- [ ] i18n sistemi kurma
- [ ] Validation messages merkezi yönetim
- [ ] User experience testleri

### Hafta 4: Performance Optimizasyonu

- [ ] Component memoization
- [ ] FlatList optimizasyonu
- [ ] Bundle size analizi
- [ ] Performance monitoring

## 🎯 Başarı Metrikleri

### Kod Kalitesi

- [ ] Cognitive complexity < 15 (tüm fonksiyonlar)
- [ ] Magic values < 10 (toplam)
- [ ] ESLint warnings = 0
- [ ] TypeScript errors = 0

### Performance

- [ ] Bundle size < 8MB (şu an 6.69MB)
- [ ] Lighthouse score > 60 (şu an 40)
- [ ] App startup time < 3s
- [ ] Memory usage < 150MB

### Maintainability

- [ ] Test coverage > 85% (şu an 84.19%)
- [ ] Documentation coverage > 80%
- [ ] Code duplication < 5%
- [ ] Dependency vulnerabilities = 0

## 🔧 Araçlar ve Konfigürasyon

### ESLint Kuralları

```json
{
  "rules": {
    "complexity": ["error", { "max": 10 }],
    "max-lines-per-function": ["error", { "max": 50 }],
    "max-depth": ["error", { "max": 4 }],
    "max-params": ["error", { "max": 4 }],
    "no-magic-numbers": [
      "error",
      {
        "ignore": [0, 1, -1],
        "ignoreArrayIndexes": true
      }
    ]
  }
}
```

### SonarJS Konfigürasyonu

```json
{
  "rules": {
    "sonarjs/cognitive-complexity": ["error", 15],
    "sonarjs/no-duplicate-string": ["error", 3],
    "sonarjs/no-identical-functions": "error",
    "sonarjs/no-big-function": ["error", 50]
  }
}
```

### Bundle Analyzer

```bash
# Bundle analizi için
npx expo export --platform web
npx webpack-bundle-analyzer dist/static/js/*.js
```

## 💡 Öneriler

### Kısa Vadeli (1-2 hafta)

1. **Acil refactoring**: En yüksek karmaşıklığa sahip 3 fonksiyon
2. **Magic values**: Constants dosyaları oluşturma
3. **Error handling**: Merkezi error management

### Orta Vadeli (1-2 ay)

1. **Architecture**: State management pattern'leri
2. **Performance**: Component optimization
3. **Testing**: Comprehensive test coverage

### Uzun Vadeli (3-6 ay)

1. **Monitoring**: Code quality metrics
2. **Automation**: Automated refactoring tools
3. **Documentation**: Comprehensive code documentation

---

**Sonuç:** Bu plan uygulandığında kod kalitesi %82'den %95+'a çıkacak, maintainability artacak ve technical debt önemli ölçüde azalacak.
