// Test Utilities - Helper functions and components for testing
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimationProvider } from '../../providers/AnimationProvider';
import { HapticProvider } from '../../providers/HapticProvider';
import { ErrorProvider } from '../../providers/ErrorProvider';
import { WardrobeProvider } from '../../providers/WardrobeProvider';
import { AIProvider } from '../../providers/AIProvider';
import { AppError, ErrorSeverity, ErrorCategory } from '../../utils/ErrorHandler';
import { WardrobeItem } from '../../types/aynaMirror';
import { WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { User } from '../../types/user';

/**
 * Custom render function with all providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: {
    wardrobe?: WardrobeItem[];
    user?: User;
    theme?: 'light' | 'dark';
    errors?: AppError[];
  };
  navigationOptions?: {
    initialRouteName?: string;
    initialParams?: Record<string, any>;
  };
  providerProps?: {
    theme?: any;
    animation?: any;
    haptic?: any;
    error?: any;
    wardrobe?: any;
    ai?: any;
  };
}

function AllTheProviders({ children, ...props }: { children: React.ReactNode } & CustomRenderOptions) {
  const { initialState = {}, navigationOptions = {}, providerProps = {} } = props;
  
  return (
    <NavigationContainer>
      <ThemeProvider {...providerProps.theme}>
        <AnimationProvider {...providerProps.animation}>
          <HapticProvider {...providerProps.haptic}>
            <ErrorProvider {...providerProps.error}>
              <AIProvider {...providerProps.ai}>
                <WardrobeProvider 
                  initialItems={initialState.wardrobe}
                  {...providerProps.wardrobe}
                >
                  {children}
                </WardrobeProvider>
              </AIProvider>
            </ErrorProvider>
          </HapticProvider>
        </AnimationProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} {...options} />,
    ...options,
  });
}

/**
 * Create mock wardrobe item
 */
export function createMockWardrobeItem(overrides: Partial<WardrobeItem> = {}): WardrobeItem {
  return {
    id: 'test-item-1',
    name: 'Test Dress',
    category: WardrobeCategory.DRESSES,
    colors: [WardrobeColor.BLUE],
    tags: ['casual', 'summer'],
    imageUri: 'file://test-image.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isFavorite: false,
    isArchived: false,
    brand: 'Test Brand',
    size: 'M',
    material: 'Cotton',
    season: ['summer'],
    occasion: ['casual'],
    style: 'bohemian',
    condition: 'excellent',
    purchaseDate: new Date('2023-12-01'),
    purchasePrice: 50,
    notes: 'Beautiful summer dress',
    aiAnalysis: {
      confidence: 0.95,
      detectedItems: ['dress'],
      suggestedTags: ['casual', 'summer'],
      colorAnalysis: {
        dominantColors: ['blue'],
        colorHarmony: 'monochromatic',
      },
      styleAnalysis: {
        style: 'bohemian',
        formality: 'casual',
        season: ['summer'],
      },
    },
    ...overrides,
  };
}

/**
 * Create mock user
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    preferences: {
      theme: 'light',
      notifications: true,
      hapticFeedback: true,
      autoBackup: true,
      aiSuggestions: true,
      privacyMode: false,
    },
    profile: {
      style: 'bohemian',
      favoriteColors: [WardrobeColor.BLUE, WardrobeColor.GREEN],
      bodyType: 'pear',
      lifestyle: 'active',
      budget: 'medium',
      sustainabilityGoals: ['reduce_waste', 'buy_less'],
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      expiresAt: new Date('2024-12-31'),
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create mock error
 */
export function createMockError(overrides: Partial<AppError> = {}): AppError {
  return {
    code: 'TEST_ERROR',
    message: 'Test error message',
    userMessage: 'Something went wrong. Please try again.',
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.UNKNOWN,
    timestamp: Date.now(),
    context: { test: true },
    recoveryStrategies: [],
    ...overrides,
  };
}

/**
 * Mock API responses
 */
export const mockApiResponses = {
  wardrobeItems: {
    success: {
      data: [createMockWardrobeItem()],
      status: 200,
    },
    error: {
      error: 'Failed to fetch wardrobe items',
      status: 500,
    },
  },
  aiAnalysis: {
    success: {
      data: {
        confidence: 0.95,
        detectedItems: ['dress'],
        suggestedTags: ['casual', 'summer'],
        colorAnalysis: {
          dominantColors: ['blue'],
          colorHarmony: 'monochromatic',
        },
        styleAnalysis: {
          style: 'bohemian',
          formality: 'casual',
          season: ['summer'],
        },
      },
      status: 200,
    },
    error: {
      error: 'AI analysis failed',
      status: 500,
    },
  },
  outfitSuggestions: {
    success: {
      data: {
        outfits: [
          {
            id: 'outfit-1',
            items: [createMockWardrobeItem()],
            occasion: 'casual',
            confidence: 0.9,
          },
        ],
      },
      status: 200,
    },
    error: {
      error: 'Failed to generate outfit suggestions',
      status: 500,
    },
  },
};

/**
 * Mock fetch function
 */
export function mockFetch(response: any, options: { delay?: number; shouldReject?: boolean } = {}) {
  const { delay = 0, shouldReject = false } = options;
  
  return jest.fn(() => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldReject) {
          reject(new Error('Network error'));
        } else {
          resolve({
            ok: response.status < 400,
            status: response.status,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response)),
          });
        }
      }, delay);
    })
  );
}

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(setImmediate);

export const waitForNextUpdate = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Mock gesture events
 */
export const mockGestureEvent = (overrides: any = {}) => ({
  nativeEvent: {
    translationX: 0,
    translationY: 0,
    velocityX: 0,
    velocityY: 0,
    scale: 1,
    rotation: 0,
    state: 4, // ACTIVE
    ...overrides,
  },
});

/**
 * Mock animation values
 */
export const mockAnimatedValue = (initialValue: number = 0) => ({
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(() => 'listener-id'),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  interpolate: jest.fn(() => mockAnimatedValue()),
  animate: jest.fn(),
  stopTracking: jest.fn(),
  track: jest.fn(),
  _value: initialValue,
});

/**
 * Mock navigation props
 */
export const mockNavigationProps = {
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(() => 'test-screen'),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      index: 0,
      routes: [{ name: 'TestScreen', key: 'test-key' }],
    })),
    reset: jest.fn(),
    setParams: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    replace: jest.fn(),
  },
  route: {
    key: 'test-route',
    name: 'TestScreen',
    params: {},
  },
};

/**
 * Test data generators
 */
export const generateWardrobeItems = (count: number): WardrobeItem[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockWardrobeItem({
      id: `item-${index + 1}`,
      name: `Test Item ${index + 1}`,
    })
  );
};

export const generateErrors = (count: number): AppError[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockError({
      code: `ERROR_${index + 1}`,
      message: `Test error ${index + 1}`,
    })
  );
};

/**
 * Custom matchers
 */
expect.extend({
  toBeValidWardrobeItem(received: any) {
    const pass = 
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.name === 'string' &&
      Object.values(WardrobeCategory).includes(received.category) &&
      Array.isArray(received.colors) &&
      Array.isArray(received.tags) &&
      typeof received.imageUri === 'string';
    
    return {
      message: () => 
        pass 
          ? `Expected ${received} not to be a valid wardrobe item`
          : `Expected ${received} to be a valid wardrobe item`,
      pass,
    };
  },
  
  toBeValidError(received: any) {
    const pass = 
      typeof received === 'object' &&
      typeof received.code === 'string' &&
      typeof received.message === 'string' &&
      Object.values(ErrorSeverity).includes(received.severity) &&
      Object.values(ErrorCategory).includes(received.category);
    
    return {
      message: () => 
        pass 
          ? `Expected ${received} not to be a valid error`
          : `Expected ${received} to be a valid error`,
      pass,
    };
  },
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidWardrobeItem(): R;
      toBeValidError(): R;
    }
  }
}

export * from '@testing-library/react-native';
export { renderWithProviders as render };