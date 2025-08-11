# AynaModa Mobile Application

## 🎯 Project Overview
AynaModa is a hyper-personalized fashion app that saves users from discount noise and decision fatigue by recommending sales on items that complement their existing virtual wardrobe.

## 📱 Mobile UI Skeleton (v1.0)

### ✅ Step 2 Completed: Mobile UI Skeleton

We have successfully built the complete mobile UI skeleton with:

#### Technical Stack
- **Platform**: Expo SDK 53
- **Frontend**: React Native + TypeScript (strict mode)  
- **Navigation**: expo-router (file-based routing)
- **UI Components**: Native React Native components with custom styling
- **Icons**: @expo/vector-icons (Ionicons)

#### App Structure
```
app/
├── _layout.tsx          # Root layout with tab navigation
├── index.tsx            # Home screen (personalized recommendations)
├── wardrobe.tsx         # Virtual wardrobe management
├── discover.tsx         # Browse sales and boutiques
├── favorites.tsx        # Liked items and boutiques
└── profile.tsx          # User profile and settings
```

#### Key Features Implemented

**🏠 Home Screen**
- Personalized greeting and welcome message
- Smart recommendations section with CTA
- Quick action buttons (Add to Wardrobe, Browse Sales, Find Boutiques)
- Recent activity section

**👕 Wardrobe Screen**
- Empty state with guidance for new users
- Multiple options to add items (camera, gallery, browse)
- Category grid (Tops, Bottoms, Dresses, Shoes)

**🔍 Discover Screen**
- Search functionality with search bar
- Quick filter chips (All, On Sale, New Arrivals, Designer, Accessories)
- Featured boutiques carousel

**❤️ Favorites Screen**
- Tab-based interface (Items vs Boutiques)
- Empty states for both tabs

**👤 Profile Screen** 
- Guest user state with sign-in prompt
- User stats and comprehensive settings menu

#### 🎨 Design System & Colors
- **Colorful Theme**: Vibrant and modern mid-tone palette
  - **Sea Green** (#2E8B57) - Primary actions, home screen accents
  - **Steel Blue** (#4682B4) - Secondary actions, wardrobe features  
  - **Peach** (#FFB347) - Highlights, discover functionality
  - **Coral** (#FF6B6B) - Favorites, emotional connections
  - **Purple** (#9370DB) - Profile, personalization features
- **Screen-Specific Backgrounds**: Each screen has its own color theme
- **Enhanced Navigation**: Fixed bottom spacing to prevent overlap with phone nav buttons
- **Interactive Elements**: Colorful borders and accents on cards and buttons
- **Typography**: System fonts optimized for readability across color themes

## 🚀 Getting Started

### Prerequisites
- Node.js (18+)
- Expo CLI
- Expo Go app on your mobile device

### Installation & Setup
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Scan QR code with Expo Go app

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS (macOS only)
- `npm run web` - Run on web

---

**Current Status**: ✅ Mobile UI Skeleton Complete + Colorful Design ✨  
**Latest Update**: Enhanced with vibrant mid-tone color palette and fixed navigation spacing  
**Next Phase**: Backend Foundation  
**Version**: 1.1.0

---

## 🔮 AI Models (Updated)

- Default model for vision + chat tasks: `gpt-4o`
- Lightweight/cost-sensitive tasks: `gpt-4o-mini`

AIService centralizes model names and calls via OpenAI Chat Completions (or the ai-proxy when enabled).

Example usage:

```ts
import { AIService } from '@/services/AIService';

const ai = new AIService();
// Image analysis (vision + chat)
const analysis = await ai.analyzeImage(uri);
// Categorization (lightweight)
const cat = await ai.categorizeItem('blue cotton shirt');
// Colors and style advice
const colors = await ai.extractColors(uri);
const advice = await ai.generateStyleAdvice(userProfile, wardrobeItems);
```

## 🔐 Google OAuth (Updated)

Do not hardcode client IDs. Provide them via env and EAS secrets, surfaced to the app using Expo Constants.

Required env vars (client-side):

- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

These are exposed through `app.json` → `extra.google` and read in `AuthContext` using:

```ts
import Constants from 'expo-constants';

const googleExtra = (Constants.expoConfig?.extra as any)?.google || {};
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || googleExtra.iosClientId;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleExtra.androidClientId;
```

EAS secrets (examples):

```bash
eas secret:create --name prod_GOOGLE_IOS_CLIENT_ID --value <client-id>
eas secret:create --name prod_GOOGLE_ANDROID_CLIENT_ID --value <client-id>
eas secret:create --name preview_GOOGLE_IOS_CLIENT_ID --value <client-id>
eas secret:create --name preview_GOOGLE_ANDROID_CLIENT_ID --value <client-id>
```

## 🗄️ Supabase Functions & Migrations (Updated)

- `functions.ai-proxy` now enforces `verify_jwt = true` in `supabase/config.toml`. Clients must include an `Authorization` header (handled by the Supabase client in the app).
- AI analysis persistence: added AI-specific columns to `public.wardrobe_items`:
  - `ai_cache JSONB`
  - `ai_main_category TEXT`
  - `ai_sub_category TEXT`
  - `ai_dominant_colors TEXT[]`
  - Migration: `supabase/migrations/20250809_add_ai_columns.sql`

## 🚢 Deployment

1. Apply latest Supabase migrations
2. Deploy updated Edge Functions
   - `ai-analysis` (uses wardrobe_items and writes AI columns)
   - `ai-proxy` (now requires JWT)
3. Re-build the Expo app so EAS-injected env variables are available at runtime

## ✅ Docs validation

- Removed references to deprecated models.
- No hardcoded OAuth client IDs remain in docs.