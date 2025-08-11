# AYNA Mirror - Technical Documentation

## Overview

AYNA Mirror is a sophisticated AI-powered wardrobe management and style recommendation application built with React Native and Expo. The application combines computer vision, machine learning, and elegant design to provide personalized fashion advice and wardrobe organization.

## Architecture

### Technology Stack

- **Frontend**: React Native 0.79.5 with Expo 53.0.20
- **Navigation**: Expo Router 5.1.4
- **Styling**: @shopify/restyle 2.4.5 with custom design system
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI GPT-4 Vision, Google Vision API
- **Authentication**: Supabase Auth with Google OAuth and Apple Sign-In
- **State Management**: React Context API
- **Testing**: Jest with React Native Testing Library

### Project Structure

```
c:\AYNAMODA/
├── app/                    # Expo Router app directory
│   ├── (app)/             # Main app screens (protected routes)
│   │   ├── index.tsx      # Home screen
│   │   ├── wardrobe.tsx   # Wardrobe management
│   │   ├── ayna-mirror.tsx # AI mirror interface
│   │   ├── discover.tsx   # Style discovery
│   │   ├── profile.tsx    # User profile
│   │   └── settings.tsx   # App settings
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── services/          # Business logic and API calls
│   ├── theme/             # Design system and theming
│   ├── context/           # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── supabase/              # Database migrations and functions
└── __tests__/             # Test files
```

## Core Features

### 1. AI-Powered Wardrobe Analysis

**Image Recognition**: Uses OpenAI GPT-4 Vision and Google Vision API to analyze clothing items:
- Automatic categorization (tops, bottoms, dresses, etc.)
- Color extraction and analysis
- Style classification (casual, formal, business, etc.)
- Brand and price estimation

**Implementation**: `src/services/AIService.ts`
```typescript
export class AIService {
  async analyzeImage(imageUri: string): Promise<ImageAnalysis> {
    // OpenAI Vision API integration
    // Color analysis and style detection
    // Caching for performance
  }
}
```

### 2. Smart Wardrobe Management

**Features**:
- Digital wardrobe organization
- Item categorization and tagging
- Search and filtering capabilities
- Bulk operations (select, delete, update)
- Favorites and recently added items

**Implementation**: `src/services/wardrobeService.ts`
```typescript
export class WardrobeService {
  async getAllItems(userId?: string): Promise<WardrobeItem[]>
  async addItem(item: Partial<WardrobeItem>): Promise<WardrobeItem>
  async updateItem(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem>
  // Caching and offline support
}
```

### 3. Daily Style Recommendations

**AYNA Mirror Interface**: AI-powered daily outfit recommendations based on:
- Weather conditions
- Calendar events
- Personal style preferences
- Wardrobe availability
- Confidence scoring

**Implementation**: `src/services/aynaMirrorService.ts`
- Generates personalized daily recommendations
- Considers context (weather, events, mood)
- Provides confidence scores for each suggestion

### 4. Advanced Design System

**Unified Design Language**: Comprehensive design system with:
- Color palette (sage, gold, liquidGold, etc.)
- Typography scales (Playfair Display, Inter)
- Spacing system (xs to zen)
- Elevation and shadows
- Glassmorphism effects
- Border radius scales

**Implementation**: `src/theme/DesignSystem.ts`
```typescript
export const UNIFIED_COLORS = {
  primary: { 50: '#F8F7F4', 500: '#B8A082', 900: '#8B7355' },
  sage: { 50: '#F6F7F6', 500: '#9CA3AF', 900: '#374151' },
  // ... comprehensive color system
};

export const TYPOGRAPHY = {
  fontFamilies: {
    heading: 'PlayfairDisplay_400Regular',
    body: 'Inter_400Regular'
  },
  scale: {
    hero: { fontSize: 48, lineHeight: 56 },
    h1: { fontSize: 32, lineHeight: 40 },
    // ... complete typography scale
  }
};
```

## Database Schema

### Core Tables

**wardrobe_items**
```sql
CREATE TABLE wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  category TEXT,
  colors TEXT[],
  brand TEXT,
  price DECIMAL,
  image_uri TEXT,
  confidence_score DECIMAL,
  usage_count INTEGER DEFAULT 0,
  last_worn DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**daily_recommendations**
```sql
CREATE TABLE daily_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE,
  weather_context JSONB,
  calendar_context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**outfit_recommendations**
```sql
CREATE TABLE outfit_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_recommendation_id UUID REFERENCES daily_recommendations(id),
  item_ids UUID[],
  confidence_score DECIMAL,
  reasoning TEXT,
  is_quick_option BOOLEAN DEFAULT FALSE
);
```

## Authentication & Security

### Authentication Flow

1. **Multi-provider Support**: Google OAuth, Apple Sign-In, Email/Password
2. **Session Management**: Supabase Auth with JWT tokens
3. **Route Protection**: Expo Router with authentication guards

**Implementation**: `src/context/AuthContext.tsx`
```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Google OAuth integration
  const signInWithGoogle = async () => {
    // Google Sign-In flow with Supabase
  };
  
  // Apple Sign-In integration
  const signInWithApple = async () => {
    // Apple Authentication flow
  };
}
```

### Security Measures

- **Row Level Security (RLS)**: Database-level access control
- **API Key Management**: Environment-based configuration
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error messages without data leakage

## Performance Optimizations

### Caching Strategy

1. **AI Service Caching**: 24-hour cache for image analysis results
2. **Wardrobe Data**: AsyncStorage for offline access
3. **Image Optimization**: Lazy loading and compression

### Memory Management

- **Image Handling**: Efficient image loading and disposal
- **Component Optimization**: React.memo and useMemo usage
- **Animation Performance**: Reanimated 3 for 60fps animations

## Testing Strategy

### Test Coverage

- **Unit Tests**: Services, utilities, and hooks
- **Component Tests**: UI component behavior
- **Integration Tests**: API interactions and data flow
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load testing and memory profiling

**Current Status**: 221 passing tests with comprehensive coverage

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo-.*)/)',
  ],
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
  ],
};
```

## API Integration

### External Services

**OpenAI GPT-4 Vision**
- Image analysis and style recommendations
- Natural language processing for outfit descriptions
- Confidence scoring for recommendations

**Google Vision API**
- Clothing item detection
- Color analysis
- Text recognition (brand labels, tags)

**Weather API**
- Location-based weather data
- Seasonal recommendations
- Climate-appropriate styling

### Service Architecture

```typescript
// Service pattern with error handling and caching
export class BaseService {
  protected async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  protected handleError(error: unknown): void {
    // Centralized error handling
  }
}
```

## Deployment & DevOps

### Build Configuration

**Expo Application Services (EAS)**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "node": "18.18.0"
    }
  }
}
```

### Environment Management

- **Development**: Local Supabase instance
- **Staging**: Supabase staging environment
- **Production**: Supabase production with edge functions

### CI/CD Pipeline

1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Testing**: Automated test suite execution
3. **Security**: Dependency vulnerability scanning
4. **Build**: EAS Build for iOS and Android
5. **Deployment**: Automated deployment to app stores

## Monitoring & Analytics

### Error Tracking

- **Crash Reporting**: Expo crash analytics
- **Error Boundaries**: React error boundaries for graceful degradation
- **Logging**: Structured logging with different levels

### Performance Monitoring

- **Bundle Analysis**: Metro bundle analyzer
- **Memory Profiling**: React DevTools Profiler
- **Network Monitoring**: API response time tracking

## Future Enhancements

### Planned Features

1. **Social Features**: Outfit sharing and community recommendations
2. **AR Integration**: Virtual try-on capabilities
3. **Sustainability Metrics**: Environmental impact tracking
4. **Personal Stylist AI**: Advanced AI-powered styling advice
5. **Shopping Integration**: Direct purchase recommendations

### Technical Improvements

1. **Offline-First Architecture**: Enhanced offline capabilities
2. **Real-time Sync**: WebSocket-based real-time updates
3. **Advanced Caching**: Redis-based distributed caching
4. **Microservices**: Service decomposition for scalability

## Development Guidelines

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with React Native rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

### Component Development

```typescript
// Component template
import React from 'react';
import { View, Text } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  title: {
    fontSize: DesignSystem.typography.h2.fontSize,
    color: DesignSystem.colors.text.primary,
  },
});
```

### Service Development

```typescript
// Service template
export class ServiceName {
  private static readonly CACHE_PREFIX = 'service_cache_';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  
  async methodName(param: string): Promise<ReturnType> {
    try {
      // Check cache first
      const cached = await this.getCachedResult(param);
      if (cached) return cached;
      
      // Make API call
      const result = await this.makeAPICall(param);
      
      // Cache result
      await this.setCachedResult(param, result);
      
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}
```

## Conclusion

AYNA Mirror represents a sophisticated blend of AI technology, elegant design, and practical functionality. The application's modular architecture, comprehensive testing strategy, and focus on performance make it a robust platform for fashion and style management. The codebase follows modern React Native best practices and is well-positioned for future enhancements and scaling.

For detailed implementation examples and API documentation, refer to the individual service and component files within the codebase.