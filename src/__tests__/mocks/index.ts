// Mock implementations for external services and dependencies
import { WardrobeItem, WardrobeCategory, WardrobeColor } from '../../types/wardrobe';
import { User } from '../../types/user';
import { createMockWardrobeItem, createMockUser } from '../utils/testUtils';

/**
 * Supabase Client Mock
 */
export const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
      getPublicUrl: jest.fn(),
      createSignedUrl: jest.fn(),
    })),
  },
  rpc: jest.fn(),
};

/**
 * Firebase Mock
 */
export const mockFirebase = {
  app: {
    initializeApp: jest.fn(),
    getApp: jest.fn(),
    getApps: jest.fn(() => []),
  },
  storage: {
    getStorage: jest.fn(),
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
    listAll: jest.fn(),
  },
  firestore: {
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    onSnapshot: jest.fn(),
  },
};

/**
 * AI Services Mock
 */
export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              category: WardrobeCategory.DRESSES,
              colors: [WardrobeColor.BLUE],
              tags: ['casual', 'summer'],
              style: 'bohemian',
              confidence: 0.95,
            }),
          },
        }],
      }),
    },
  },
  images: {
    analyze: jest.fn().mockResolvedValue({
      data: [{
        url: 'https://example.com/analyzed-image.jpg',
      }],
    }),
  },
};

export const mockGoogleVision = {
  labelDetection: jest.fn().mockResolvedValue({
    labelAnnotations: [
      { description: 'Dress', score: 0.95 },
      { description: 'Blue', score: 0.90 },
      { description: 'Casual', score: 0.85 },
    ],
  }),
  objectLocalization: jest.fn().mockResolvedValue({
    localizedObjectAnnotations: [
      {
        name: 'Dress',
        score: 0.95,
        boundingPoly: {
          normalizedVertices: [
            { x: 0.1, y: 0.1 },
            { x: 0.9, y: 0.1 },
            { x: 0.9, y: 0.9 },
            { x: 0.1, y: 0.9 },
          ],
        },
      },
    ],
  }),
  textDetection: jest.fn().mockResolvedValue({
    textAnnotations: [
      { description: 'Brand Name', score: 0.90 },
    ],
  }),
};

/**
 * Image Picker Mock
 */
export const mockImagePicker = {
  launchImageLibrary: jest.fn((options, callback) => {
    const mockResponse = {
      didCancel: false,
      errorMessage: null,
      assets: [{
        uri: 'file://test-image.jpg',
        type: 'image/jpeg',
        fileName: 'test-image.jpg',
        fileSize: 1024000,
        width: 1080,
        height: 1920,
      }],
    };
    if (callback) callback(mockResponse);
    return Promise.resolve(mockResponse);
  }),
  launchCamera: jest.fn((options, callback) => {
    const mockResponse = {
      didCancel: false,
      errorMessage: null,
      assets: [{
        uri: 'file://camera-image.jpg',
        type: 'image/jpeg',
        fileName: 'camera-image.jpg',
        fileSize: 2048000,
        width: 1080,
        height: 1920,
      }],
    };
    if (callback) callback(mockResponse);
    return Promise.resolve(mockResponse);
  }),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
};

/**
 * Expo Location Mock
 */
export const mockLocation = {
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    granted: true,
  }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([
    {
      city: 'San Francisco',
      country: 'United States',
      district: null,
      isoCountryCode: 'US',
      name: '1 Hacker Way',
      postalCode: '94301',
      region: 'CA',
      street: 'Hacker Way',
      streetNumber: '1',
      subregion: 'Santa Clara County',
      timezone: 'America/Los_Angeles',
    },
  ]),
};

/**
 * AsyncStorage Mock
 */
export const mockAsyncStorage = {
  getItem: jest.fn((key: string) => {
    const storage: Record<string, string> = {
      'user_preferences': JSON.stringify({
        theme: 'light',
        notifications: true,
        hapticFeedback: true,
      }),
      'wardrobe_cache': JSON.stringify([createMockWardrobeItem()]),
      'user_profile': JSON.stringify(createMockUser()),
    };
    return Promise.resolve(storage[key] || null);
  }),
  setItem: jest.fn((key: string, value: string) => {
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    return Promise.resolve();
  }),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve(['user_preferences', 'wardrobe_cache'])),
  multiGet: jest.fn((keys: string[]) => {
    return Promise.resolve(keys.map(key => [key, null]));
  }),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => {
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    return Promise.resolve();
  }),
};

/**
 * Network Info Mock
 */
export const mockNetInfo = {
  fetch: jest.fn().mockResolvedValue({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'TestWiFi',
      bssid: '00:00:00:00:00:00',
      strength: 99,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
    },
  }),
  addEventListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
  useNetInfo: jest.fn(() => ({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
  })),
};

/**
 * Haptic Feedback Mock
 */
export const mockHapticFeedback = {
  trigger: jest.fn(),
  impact: jest.fn(),
  notification: jest.fn(),
  selection: jest.fn(),
  HapticFeedbackTypes: {
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
    selection: 'selection',
  },
};

/**
 * Permissions Mock
 */
export const mockPermissions = {
  request: jest.fn().mockResolvedValue('granted'),
  check: jest.fn().mockResolvedValue('granted'),
  requestMultiple: jest.fn().mockResolvedValue({
    'android.permission.CAMERA': 'granted',
    'android.permission.READ_EXTERNAL_STORAGE': 'granted',
    'android.permission.WRITE_EXTERNAL_STORAGE': 'granted',
  }),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
};

/**
 * Gesture Handler Mock
 */
export const mockGestureHandler = {
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
  State: {
    UNDETERMINED: 0,
    FAILED: 1,
    BEGAN: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  SwipeGestureHandler: 'SwipeGestureHandler',
};

/**
 * Reanimated Mock
 */
export const mockReanimated = {
  useSharedValue: jest.fn((initial) => ({ value: initial })),
  useAnimatedStyle: jest.fn((fn) => fn()),
  useAnimatedGestureHandler: jest.fn((handlers) => handlers),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  withDecay: jest.fn((config) => config.velocity || 0),
  withDelay: jest.fn((delay, animation) => animation),
  withRepeat: jest.fn((animation) => animation),
  withSequence: jest.fn((...animations) => animations[0]),
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
  interpolate: jest.fn((value, inputRange, outputRange) => outputRange[0]),
  interpolateColor: jest.fn((value, inputRange, outputRange) => outputRange[0]),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    bezier: jest.fn(),
  },
};

/**
 * Vector Icons Mock
 */
export const mockVectorIcons = {
  createIconSet: jest.fn(() => 'Icon'),
  createIconSetFromFontello: jest.fn(() => 'Icon'),
  createIconSetFromIcoMoon: jest.fn(() => 'Icon'),
};

/**
 * Date/Time Mock
 */
export const mockDateTime = {
  now: jest.fn(() => new Date('2024-01-01T12:00:00Z')),
  format: jest.fn((date, format) => '2024-01-01'),
  parse: jest.fn((dateString) => new Date(dateString)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  differenceInDays: jest.fn((date1, date2) => 1),
  isToday: jest.fn(() => true),
  isYesterday: jest.fn(() => false),
  isTomorrow: jest.fn(() => false),
};

/**
 * Export all mocks
 */
export const mocks = {
  supabase: mockSupabaseClient,
  firebase: mockFirebase,
  openai: mockOpenAI,
  googleVision: mockGoogleVision,
  imagePicker: mockImagePicker,
  location: mockLocation,
  asyncStorage: mockAsyncStorage,
  netInfo: mockNetInfo,
  hapticFeedback: mockHapticFeedback,
  permissions: mockPermissions,
  gestureHandler: mockGestureHandler,
  reanimated: mockReanimated,
  vectorIcons: mockVectorIcons,
  dateTime: mockDateTime,
};

export default mocks;