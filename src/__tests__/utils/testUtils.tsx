// Test Utilities - Helper functions and components for testing
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AnimationProvider } from '@/providers/AnimationProvider';
import { HapticProvider } from '@/providers/HapticProvider';
import { ErrorProvider } from '@/providers/ErrorProvider';
import { WardrobeProvider } from '@/providers/WardrobeProvider';
import { AIProvider } from '@/providers/AIProvider';
import { AppError, ErrorSeverity, ErrorCategory, RecoveryStrategy } from '@/utils/ErrorHandler';
import { WardrobeItem } from '@/types/aynaMirror';
import { WardrobeCategory, WardrobeColor } from '@/types/wardrobe';
import { User } from '@/types/user';

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
    initialParams?: Record<string, unknown>;
  };
  providerProps?: {
    theme?: Record<string, unknown>;
    animation?: Record<string, unknown>;
    haptic?: Record<string, unknown>;
    error?: Record<string, unknown>;
    wardrobe?: Record<string, unknown>;
    ai?: Record<string, unknown>;
  };
}

function AllTheProviders({
  children,
  ...props
}: { children: React.ReactNode } & CustomRenderOptions) {
  const { initialState = {}, navigationOptions = {}, providerProps = {} } = props;

  // Mock provider setup for testing - use simple wrappers that just render children
  const MockProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  
  return (
    <NavigationContainer>
      <MockProvider>
        <MockProvider>
          <MockProvider>
            <MockProvider>
              <MockProvider>
                <MockProvider>
                  {children}
                </MockProvider>
              </MockProvider>
            </MockProvider>
          </MockProvider>
        </MockProvider>
      </MockProvider>
    </NavigationContainer>
  );
}

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} {...options} />,
    ...options,
  });
}

/**
 * Create mock wardrobe item
 */
// Test-only extension of WardrobeItem to avoid polluting production domain model
interface TestWardrobeItem extends WardrobeItem {
  isFavorite?: boolean;
  isArchived?: boolean;
  material?: string;
  season?: string[];
  occasion?: string[];
  style?: string;
  condition?: string;
  aiAnalysis?: {
    confidence: number;
    detectedItems: string[];
    suggestedTags: string[];
    colorAnalysis: { dominantColors: string[]; colorHarmony: string };
    styleAnalysis: { style: string; formality: string; season: string[] };
  };
  name?: string; // aynamirror WardrobeItem already has optional name
  brand?: string;
  size?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  notes?: string;
}

export function createMockWardrobeItem(overrides: Partial<TestWardrobeItem> = {}): WardrobeItem {
  const baseId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const base: TestWardrobeItem = {
    id: baseId,
    name: 'Test Dress',
    category: WardrobeCategory.DRESSES,
    colors: [WardrobeColor.BLUE],
    tags: ['casual', 'summer'],
    imageUri: 'file://test-image.jpg',
    processedImageUri: 'file://test-image-processed.jpg',
    userId: 'test-user',
    usageStats: {
      itemId: baseId,
      totalWears: 0,
      lastWorn: null,
      averageRating: 0,
      complimentsReceived: 0,
      costPerWear: 0,
    },
    styleCompatibility: {},
    confidenceHistory: [],
    nameOverride: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isFavorite: false,
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
  // Return as WardrobeItem (excess props ignored in tests)
  return base as WardrobeItem;
}

/**
 * Create mock user
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-1',
    email: 'test@aynamoda.app',
    name: 'Test User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
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
// Test-only extension for AppError missing fields (code, timestamp, recoveryStrategies)
interface TestAppError extends AppError {
  code?: string;
  timestamp?: number;
  recoveryStrategies?: RecoveryStrategy[];
  context: AppError['context'] & { test?: boolean };
}

export function createMockError(overrides: Partial<TestAppError> = {}): AppError {
  const base: TestAppError = {
    id: 'test-error-1',
    message: 'Test error message',
    userMessage: 'Something went wrong. Please try again.',
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.UNKNOWN,
    context: {
      timestamp: Date.now(),
      platform: 'test',
      userId: 'test-user',
      test: true,
    },
    isRecoverable: true,
    retryable: false,
    reportable: false,
    code: 'TEST_ERROR',
    timestamp: Date.now(),
    recoveryStrategies: [],
    ...overrides,
  };
  return base as AppError;
}
export const createMockAppError = createMockError; // legacy alias expected by some tests

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

  return jest.fn(
    () =>
      new Promise<Response>((resolve, reject) => {
        setTimeout(() => {
          if (shouldReject) {
            reject(new Error('Network error'));
          } else {
            resolve({
              ok: (response as any)?.status < 400,
              status: (response as any)?.status || 200,
              json: () => Promise.resolve(response),
              text: () => Promise.resolve(JSON.stringify(response)),
            } as Response);
          }
        }, delay);
      }),
  );
}

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const flushPromises = () => new Promise(setImmediate);

export const waitForNextUpdate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Mock gesture events
 */
export const mockGestureEvent = (overrides: Record<string, unknown> = {}) => ({
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
interface AnimatedValueMock {
  setValue: jest.Mock;
  setOffset: jest.Mock;
  flattenOffset: jest.Mock;
  extractOffset: jest.Mock;
  addListener: jest.Mock<string, unknown[]>;
  removeListener: jest.Mock;
  removeAllListeners: jest.Mock;
  stopAnimation: jest.Mock;
  resetAnimation: jest.Mock;
  interpolate: jest.Mock<AnimatedValueMock, unknown[]>;
  animate: jest.Mock;
  stopTracking: jest.Mock;
  track: jest.Mock;
  _value: number;
}

export const mockAnimatedValue = (initialValue: number = 0): AnimatedValueMock => {
  const obj: AnimatedValueMock = {
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    addListener: jest.fn(() => 'listener-id'),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    stopAnimation: jest.fn(),
    resetAnimation: jest.fn(),
    interpolate: jest.fn(() => mockAnimatedValue(initialValue)),
    animate: jest.fn(),
    stopTracking: jest.fn(),
    track: jest.fn(),
    _value: initialValue,
  };
  return obj;
};

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
    }),
  );
};

export const generateErrors = (count: number): AppError[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockError({
      code: `ERROR_${index + 1}`,
      message: `Test error ${index + 1}`,
    }),
  );
};

/**
 * Custom matchers
 */
expect.extend({
  toBeValidWardrobeItem(received: unknown) {
    const pass =
      typeof received === 'object' &&
      received !== null &&
      typeof (received as any).id === 'string' &&
      typeof (received as any).name === 'string' &&
      Object.values(WardrobeCategory).includes((received as any).category) &&
      Array.isArray((received as any).colors) &&
      Array.isArray((received as any).tags) &&
      typeof (received as any).imageUri === 'string';

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid wardrobe item`
          : `Expected ${received} to be a valid wardrobe item`,
      pass,
    };
  },

  toBeValidError(received: unknown) {
    const pass =
      typeof received === 'object' &&
      received !== null &&
      typeof (received as any).code === 'string' &&
      typeof (received as any).message === 'string' &&
      Object.values(ErrorSeverity).includes((received as any).severity) &&
      Object.values(ErrorCategory).includes((received as any).category);

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
