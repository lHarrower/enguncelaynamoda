# Developer Guide

## Welcome to AYNAMODA Development! 👋

This guide will help you understand the AYNAMODA codebase, architecture, and development workflow. Whether you're a new contributor or team member, this document will get you up to speed quickly.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Strategy](#testing-strategy)
- [Debugging Guide](#debugging-guide)
- [Performance Guidelines](#performance-guidelines)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Project Overview

AYNAMODA is a React Native application that helps users manage their wardrobe sustainably using AI-powered features. The app focuses on:

- **Wardrobe Management**: Digital catalog of clothing items
- **AI-Powered Insights**: Style analysis and outfit suggestions
- **Sustainability**: Promoting conscious fashion choices
- **Social Features**: Sharing and discovering fashion inspiration

### Key Technologies

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI/ML**: HuggingFace Transformers, Custom ML models
- **State Management**: React Context + Custom hooks
- **Navigation**: React Navigation v6
- **Styling**: StyleSheet with custom theme system
- **Testing**: Jest + React Native Testing Library

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Supabase      │    │   AI Services   │
│  (React Native) │◄──►│   Backend       │◄──►│  (HuggingFace)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                   │
├─────────────────────────────────────────────────────────────┤
│  Screens/        │  Components/     │  Navigation/         │
│  - WardrobeScreen│  - ClothingItem  │  - AppNavigator      │
│  - ProfileScreen │  - OutfitCard    │  - TabNavigator      │
│  - AIScreen      │  - StyleButton   │  - StackNavigator    │
├─────────────────────────────────────────────────────────────┤
│                        Business Logic Layer                 │
├─────────────────────────────────────────────────────────────┤
│  Hooks/          │  Services/       │  Utils/              │
│  - useWardrobe   │  - authService   │  - imageUtils        │
│  - useAuth       │  - wardrobeService│ - validationUtils   │
│  - useAI         │  - aiService     │  - dateUtils         │
├─────────────────────────────────────────────────────────────┤
│                        Data Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Context/        │  Types/          │  Constants/          │
│  - AuthContext   │  - User.ts       │  - colors.ts         │
│  - ThemeContext  │  - Wardrobe.ts   │  - dimensions.ts     │
│  - WardrobeContext│ - AI.ts         │  - endpoints.ts      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Interaction** → Screen Component
2. **Screen Component** → Custom Hook
3. **Custom Hook** → Service Layer
4. **Service Layer** → Supabase/External APIs
5. **Response** → Service Layer → Hook → Component → UI Update

## Development Setup

### Prerequisites

- Node.js (v18.0.0+)
- npm or yarn
- Expo CLI
- Git
- VS Code (recommended)
- Android Studio / Xcode (for device testing)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/aynamoda.git
cd aynamoda

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm start
```

### Environment Setup

1. **Supabase Setup**:
   - Create a Supabase project
   - Run database migrations
   - Configure authentication providers
   - Set up storage buckets

2. **External Services**:
   - HuggingFace API token
   - Google OAuth credentials
   - Sentry DSN (optional)

3. **Development Tools**:
   - Install Expo Go app on your device
   - Set up VS Code extensions
   - Configure ESLint and Prettier

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Generic components (Button, Input, etc.)
│   ├── wardrobe/        # Wardrobe-specific components
│   ├── ai/              # AI-related components
│   └── social/          # Social features components
├── screens/             # Screen components
│   ├── auth/            # Authentication screens
│   ├── wardrobe/        # Wardrobe management screens
│   ├── ai/              # AI features screens
│   └── profile/         # User profile screens
├── navigation/          # Navigation configuration
│   ├── AppNavigator.tsx # Main app navigation
│   ├── AuthNavigator.tsx# Authentication flow
│   └── TabNavigator.tsx # Bottom tab navigation
├── services/            # API and business logic
│   ├── supabaseClient.js# Supabase client configuration
│   ├── authService.js   # Authentication service
│   ├── wardrobeService.js# Wardrobe management
│   └── aiService.js     # AI/ML service integration
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useWardrobe.ts   # Wardrobe management hook
│   └── useTheme.ts      # Theme management hook
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Authentication context
│   ├── ThemeContext.tsx # Theme context
│   └── WardrobeContext.tsx# Wardrobe context
├── styles/              # Styling and theming
│   ├── theme.js         # Theme configuration
│   ├── colors.js        # Color palette
│   └── typography.js    # Typography system
├── utils/               # Utility functions
│   ├── imageUtils.ts    # Image processing utilities
│   ├── validationUtils.ts# Form validation
│   └── dateUtils.ts     # Date formatting utilities
├── types/               # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── wardrobe.ts      # Wardrobe types
│   └── common.ts        # Common types
└── constants/           # App constants
    ├── colors.ts        # Color constants
    ├── dimensions.ts    # Screen dimensions
    └── endpoints.ts     # API endpoints
```

## Development Workflow

### Git Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make Changes**:
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation

3. **Test Changes**:
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**:
   ```bash
   git push origin feature/new-feature-name
   ```

### Code Review Process

- All changes require code review
- PRs must pass CI/CD checks
- Address reviewer feedback promptly
- Squash commits before merging

## Coding Standards

### TypeScript Guidelines

```typescript
// Use interfaces for object shapes
interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageUrl?: string;
  createdAt: Date;
}

// Use enums for constants
enum ClothingCategory {
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories'
}

// Use proper typing for functions
const addClothingItem = async (
  item: Omit<ClothingItem, 'id' | 'createdAt'>
): Promise<ClothingItem> => {
  // Implementation
};
```

### React Component Guidelines

```typescript
// Functional components with proper typing
interface Props {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export const CustomButton: React.FC<Props> = ({ 
  title, 
  onPress, 
  disabled = false 
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color: theme.colors.onPrimary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

### Styling Guidelines

```typescript
// Use theme system
const { theme } = useTheme();

// Create styles with theme
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
});

// Use in component
const styles = createStyles(theme);
```

### Custom Hooks Guidelines

```typescript
// Custom hook example
export const useWardrobe = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback(async (item: NewClothingItem) => {
    try {
      setLoading(true);
      const newItem = await wardrobeService.addItem(item);
      setItems(prev => [...prev, newItem]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
  };
};
```

## Testing Strategy

### Unit Tests

```typescript
// Component testing
import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from '@/CustomButton';

describe('CustomButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(<CustomButton title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton title="Test" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// Service testing
import { wardrobeService } from '../wardrobeService';

describe('WardrobeService', () => {
  it('should add clothing item', async () => {
    const newItem = {
      name: 'Test Shirt',
      category: ClothingCategory.TOPS,
    };
    
    const result = await wardrobeService.addItem(newItem);
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Shirt');
  });
});
```

### E2E Tests

```typescript
// Detox E2E testing
describe('Wardrobe Flow', () => {
  it('should add new clothing item', async () => {
    await element(by.id('add-item-button')).tap();
    await element(by.id('item-name-input')).typeText('New Shirt');
    await element(by.id('save-button')).tap();
    
    await expect(element(by.text('New Shirt'))).toBeVisible();
  });
});
```

## Debugging Guide

### React Native Debugger

1. Install React Native Debugger
2. Enable remote debugging in Expo
3. Use Redux DevTools for state inspection

### Common Debugging Techniques

```typescript
// Console logging with context
console.log('[WardrobeScreen] Loading items:', { userId, filters });

// Error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to crash reporting service
  }
}

// Network debugging
const debugNetworkCall = async (url: string, options: RequestInit) => {
  console.log(`[API] ${options.method} ${url}`);
  const response = await fetch(url, options);
  console.log(`[API] Response:`, response.status);
  return response;
};
```

### Performance Debugging

```typescript
// Performance monitoring
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`[Performance] ${componentName}: ${endTime - startTime}ms`);
    };
  }, [componentName]);
};

// Memory leak detection
const useMemoryMonitor = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (__DEV__) {
        console.log('[Memory] JS Heap:', performance.memory?.usedJSHeapSize);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
};
```

## Performance Guidelines

### React Native Optimization

```typescript
// Use React.memo for expensive components
const ClothingItem = React.memo<Props>(({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <Image source={{ uri: item.imageUrl }} />
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
});

// Use useCallback for event handlers
const handleItemPress = useCallback((itemId: string) => {
  navigation.navigate('ItemDetail', { itemId });
}, [navigation]);

// Use useMemo for expensive calculations
const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.category === selectedCategory &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [items, selectedCategory, searchQuery]);
```

### Image Optimization

```typescript
// Optimized image component
const OptimizedImage: React.FC<ImageProps> = ({ uri, style }) => {
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      loadingIndicatorSource={require('../assets/placeholder.png')}
    />
  );
};

// Image caching
const useImageCache = () => {
  const cacheImage = useCallback(async (uri: string) => {
    try {
      await Image.prefetch(uri);
    } catch (error) {
      console.warn('Failed to cache image:', uri);
    }
  }, []);
  
  return { cacheImage };
};
```

## Common Patterns

### Error Handling

```typescript
// Centralized error handling
const useErrorHandler = () => {
  const showError = useCallback((error: Error) => {
    console.error('Application error:', error);
    
    // Show user-friendly message
    Alert.alert(
      'Something went wrong',
      'Please try again later.',
      [{ text: 'OK' }]
    );
    
    // Log to crash reporting
    crashlytics().recordError(error);
  }, []);
  
  return { showError };
};

// Service error handling
const handleServiceError = (error: unknown): never => {
  if (error instanceof NetworkError) {
    throw new Error('Network connection failed');
  }
  
  if (error instanceof AuthError) {
    throw new Error('Authentication required');
  }
  
  throw new Error('An unexpected error occurred');
};
```

### Loading States

```typescript
// Loading state management
const useAsyncOperation = <T>(
  operation: () => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [operation]);
  
  return { data, loading, error, execute };
};
```

### Form Handling

```typescript
// Form validation hook
const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);
  
  const validate = useCallback(() => {
    const newErrors: Partial<T> = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = values[field];
      
      if (rule.required && !value) {
        newErrors[field] = `${field} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);
  
  return { values, errors, setValue, validate };
};
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues**:
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**:
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **Dependency conflicts**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Commands

```bash
# Check bundle size
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-release.bundle --analyze

# Profile app performance
npx react-native run-android --variant=release

# Check for memory leaks
npx flipper
```

### Useful VS Code Extensions

- React Native Tools
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

---

## Getting Help

- **Documentation**: Check this guide and README.md
- **Issues**: Search existing GitHub issues
- **Discord**: Join our developer channel
- **Code Review**: Ask for help in PR comments
- **Team Chat**: Reach out to team members

**Happy coding! 🚀**