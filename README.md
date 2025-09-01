# AYNAMODA - AI-Powered Wardrobe Management Platform 👗✨

> "Sakin Teknoloji" ve "Dişil Zarafet" prensipleriyle tasarlanmış, kullanıcıların gardıroplarını akıllıca yönetmelerine yardımcı olan platform.

## 🚀 Proje Durumu

**Faz 1: "Çelik Çekirdek" Operasyonu** ✅ TAMAMLANDI
- Go API Dockerize edildi
- Terraform ile GCP altyapısı hazırlandı
- GitHub Actions CI/CD pipeline'ı oluşturuldu
- Kubernetes manifests'leri hazırlandı
- Monitoring ve logging altyapısı kuruldu
- **Canlı Geliştirme Endpoint'i:** `api.dev.aynamoda.com` hazır

**Faz 2: "İlk Işık" Operasyonu** 🔄 BAŞLIYOR
- React Native frontend entegrasyonu
- Stil DNA testi ve manuel ürün ekleme akışı
- 50 kişilik "Kurucu Ortak" kapalı beta

## 🌟 Features

### 👔 Digital Wardrobe Management
- **Smart Cataloging**: Photograph and automatically categorize your clothing items
- **AI-Powered Tagging**: Automatic color, style, and brand recognition
- **Wear Tracking**: Monitor usage patterns and cost-per-wear analytics
- **Seasonal Organization**: Smart seasonal wardrobe management

### 🤖 AI Style Assistant
- **Personalized Recommendations**: AI-driven outfit suggestions based on your style DNA
- **Weather Integration**: Outfit recommendations based on weather conditions
- **Occasion Matching**: Perfect outfits for any event or setting
- **Color Harmony Analysis**: Scientifically-backed color coordination

### 🌱 Sustainability Focus
- **Carbon Footprint Tracking**: Monitor your fashion environmental impact
- **Sustainable Brand Discovery**: Find eco-friendly fashion alternatives
- **Wardrobe Optimization**: Reduce waste through better utilization
- **Circular Fashion**: Promote reuse, resale, and recycling

### 📱 Advanced Features
- **Virtual Mirror (Ayna)**: AR-powered virtual try-on experiences
- **Style Analytics**: Deep insights into your fashion preferences
- **Social Sharing**: Connect with fashion-conscious community
- **Smart Shopping**: AI-powered purchase recommendations

## 🎯 Project Overview

AynaModa is a hyper-personalized fashion app that saves users from discount noise and decision fatigue by recommending sales on items that complement their existing virtual wardrobe.

## 🏗️ Mimari Genel Bakış

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Web Frontend  │    │   Admin Panel   │
│   Mobile App    │    │   (Future)      │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Load Balancer         │
                    │     (GCP Load Balancer)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Kubernetes Cluster    │
                    │     (Google GKE)          │
                    │                           │
                    │  ┌─────────────────────┐  │
                    │  │   AYNAMODA API      │  │
                    │  │   (Go + Gin)        │  │
                    │  └─────────┬───────────┘  │
                    │            │              │
                    │  ┌─────────┴───────────┐  │
                    │  │   PostgreSQL        │  │
                    │  │   (Cloud SQL)       │  │
                    │  └─────────────────────┘  │
                    │                           │
                    │  ┌─────────────────────┐  │
                    │  │   Redis Cache       │  │
                    │  │   (Memorystore)     │  │
                    │  └─────────────────────┘  │
                    └───────────────────────────┘
```

## 🛠️ Teknoloji Stack

### Backend
- **Go 1.21+** - Ana programlama dili
- **Gin** - HTTP web framework
- **GORM** - ORM kütüphanesi
- **PostgreSQL** - Ana veritabanı (PGVector ile)
- **Redis** - Cache ve session yönetimi
- **JWT** - Authentication
- **Docker** - Containerization

### Infrastructure
- **Google Cloud Platform (GCP)** - Cloud provider
- **Google Kubernetes Engine (GKE)** - Container orchestration
- **Cloud SQL** - Managed PostgreSQL
- **Cloud Storage** - File storage
- **Artifact Registry** - Container registry
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD

### Monitoring & Observability
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **AlertManager** - Alert management

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

## 🚀 Kurulum ve Deployment

### Gereksinimler

- Go 1.21+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Terraform 1.6+
- kubectl
- gcloud CLI

### Yerel Geliştirme Ortamı

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/your-org/aynamoda.git
   cd aynamoda
   ```

2. **Environment dosyalarını ayarlayın:**
   ```bash
   cp .env.development .env
   # .env dosyasını düzenleyin
   ```

3. **Docker Compose ile servisleri başlatın:**
   ```bash
   cd api
   docker-compose up -d
   ```

4. **Veritabanı migration'larını çalıştırın:**
   ```bash
   cd scripts
   chmod +x migrate.sh
   ./migrate.sh --environment development --action up
   ```

5. **API'yi başlatın:**
   ```bash
   cd api
   go mod download
   go run main.go
   ```

API şu adreste çalışacak: `http://localhost:8080`

### Production Deployment

#### Ön Gereksinimler

1. **GCP Projesi oluşturun:**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   
   # Gerekli API'leri etkinleştir
   gcloud services enable container.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   gcloud services enable compute.googleapis.com
   gcloud services enable storage.googleapis.com
   ```

2. **Service Account oluşturun:**
   ```bash
   gcloud iam service-accounts create aynamoda-terraform \
     --display-name="AYNAMODA Terraform Service Account"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:aynamoda-terraform@your-project-id.iam.gserviceaccount.com" \
     --role="roles/editor"
   
   gcloud iam service-accounts keys create terraform-key.json \
     --iam-account=aynamoda-terraform@your-project-id.iam.gserviceaccount.com
   ```

#### GitHub Secrets Ayarlama

GitHub repository'nizde şu secrets'ları ayarlayın:

```
GCP_PROJECT_ID=your-project-id
GCP_SA_KEY=<terraform-key.json içeriği>
TF_STATE_BUCKET=your-project-id-terraform-state
DB_PASSWORD=<güçlü-veritabanı-şifresi>
JWT_SECRET=<güçlü-jwt-secret>
```

#### Infrastructure Deployment

1. **Terraform değişkenlerini ayarlayın:**
   ```bash
   cd infrastructure/terraform
   cp terraform.tfvars.example terraform.tfvars
   # terraform.tfvars dosyasını düzenleyin
   ```

2. **Terraform ile altyapıyı oluşturun:**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

3. **Kubernetes cluster'a bağlanın:**
   ```bash
   gcloud container clusters get-credentials aynamoda-cluster \
     --region europe-west1 --project your-project-id
   ```

#### Otomatik Deployment

GitHub Actions otomatik deployment için:

1. `main` branch'ine push yapın
2. GitHub Actions otomatik olarak:
   - Testleri çalıştırır
   - Docker image'ını build eder
   - GKE'ye deploy eder
   - Health check yapar

## 📚 API Dokümantasyonu

### Ana Endpoint'ler

#### Authentication
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `POST /api/v1/auth/refresh` - Token yenileme
- `POST /api/v1/auth/logout` - Çıkış

#### Users
- `GET /api/v1/users/profile` - Profil bilgileri
- `PUT /api/v1/users/profile` - Profil güncelleme
- `POST /api/v1/users/style-dna` - Stil DNA testi
- `POST /api/v1/users/reset-password` - Şifre sıfırlama

#### Products
- `GET /api/v1/products` - Ürün listesi
- `POST /api/v1/products` - Ürün ekleme
- `GET /api/v1/products/:id` - Ürün detayı
- `PUT /api/v1/products/:id` - Ürün güncelleme
- `DELETE /api/v1/products/:id` - Ürün silme
- `POST /api/v1/products/:id/images` - Ürün resmi yükleme

#### Categories
- `GET /api/v1/categories` - Kategori listesi
- `POST /api/v1/categories` - Kategori ekleme (Admin)
- `GET /api/v1/categories/:id/products` - Kategoriye göre ürünler

#### Outfits
- `GET /api/v1/outfits` - Kombin listesi
- `POST /api/v1/outfits` - Kombin oluşturma
- `GET /api/v1/outfits/:id` - Kombin detayı
- `PUT /api/v1/outfits/:id` - Kombin güncelleme
- `DELETE /api/v1/outfits/:id` - Kombin silme

### Health Check
- `GET /health` - Sistem durumu
- `GET /metrics` - Prometheus metrikleri

---

**Current Status**: ✅ Faz 1 "Çelik Çekirdek" Operasyonu Tamamlandı  
**Latest Update**: Production-ready infrastructure ve CI/CD pipeline hazır  
**Next Phase**: Faz 2 "İlk Işık" - Frontend entegrasyonu  
**Version**: 2.0.0

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
const androidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || googleExtra.androidClientId;
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

---

## 🛡️ Continuous Governance & Audit (Pipeline Overview)

The repository includes an autonomous multi-domain audit pipeline (see `scripts/audit`):

Domains covered:

- Static Quality: ESLint (baseline diff), dead exports (ts-prune)
- Security: Semgrep, dependency vulns (OSV/Snyk normalized), secrets (gitleaks), RLS negative tests, risk acceptance
- Supply Chain: SBOM (CycloneDX), license policy allow/deny, vulnerability dedupe
- Test Integrity: Coverage thresholds, mutation score (Stryker)
- Performance: Startup latency percentiles & frame drop parsing (Detox trace parser scaffold)
- Accessibility: Label coverage & contrast metrics (scan scaffold)
- Reporting: master-report.json, SUMMARY.md, HTML (`audit/out/report.html`), optional PDF, SVG badges, trend + deltas, history snapshots (rotated)

Key paths:

```
audit/out/
  master-report.json
  SUMMARY.md
  report.html / report.pdf (opsiyonel)
  badges/*.svg
  trend.json
  perf/perf.json
  a11y/a11y.json
```

Badges (embed example):

```
![Coverage](audit/out/badges/coverage.svg)
![Mutation](audit/out/badges/mutation.svg)
![ESLint New](audit/out/badges/eslint-new.svg)
![Security HC](audit/out/badges/security-hc.svg)
```

Risk Acceptance (`config/audit/risk-acceptance.json`): regex tabanlı geçici kabuller; süresi dolanlar gate failure üretir.

Ekstralar: master-report.json artık `gatesDetailed` (domain + name + message) içerir; `run-deps.ps1` Snyk CLI + `SNYK_TOKEN` varsa `deps/snyk.json` üretip OSV ile normalize edilir.

Commands:

```
npm run audit:pr      # Hafif PR hattı
npm run audit:full    # Gece / push tam kapsam
npm run audit:pdf     # PDF rapor (puppeteer varsa)
```

History pruning: `config/audit/history.config.json` ile `{"maxFiles": N}` tanımlayarak geçmiş dosya sınırı.

> Not: Performans ve a11y parser'ları gerçek ölçüm entegrasyonu için iskelet; Detox / axe-core çıktıları `audit/in/**` altına bırakıldığında otomatik rapora dahil olur.