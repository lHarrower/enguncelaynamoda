// Test Setup - Global test configuration and utilities
import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import { configure } from '@testing-library/react-native';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Configure testing library
configure({
  asyncUtilTimeout: 5000,
  defaultHidden: true,
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
      isReduceMotionEnabled: jest.fn().mockResolvedValue(false),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      announceForAccessibility: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      Version: '14.0',
      select: jest.fn((obj) => obj.ios),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setBackgroundColor: jest.fn(),
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    Vibration: {
      vibrate: jest.fn(),
      cancel: jest.fn(),
    },
    PermissionsAndroid: {
      request: jest.fn(() => Promise.resolve('granted')),
      check: jest.fn(() => Promise.resolve(true)),
      PERMISSIONS: {
        CAMERA: 'android.permission.CAMERA',
        READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
        WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        NEVER_ASK_AGAIN: 'never_ask_again',
      },
    },
    useWindowDimensions: jest.fn(() => ({ width: 400, height: 800 })),
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: React.forwardRef(
      (
        { children, ...props }: { children?: React.ReactNode; [key: string]: unknown },
        ref: React.Ref<unknown>,
      ) => {
        return React.createElement('View', { ref, ...props }, children);
      },
    ),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      isFocused: jest.fn(() => true),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      getState: jest.fn(() => ({ routes: [], index: 0 })),
    }),
    useRoute: () => ({
      params: {},
      key: 'test-route',
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
    useNavigationState: jest.fn(() => ({ routes: [], index: 0 })),
    createNavigationContainerRef: () => ({
      current: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dispatch: jest.fn(),
        getState: jest.fn(() => ({ routes: [], index: 0 })),
      },
    }),
  };
});

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};
  Reanimated.FadeIn = {
    duration: jest.fn().mockReturnValue({}),
  };
  Reanimated.withTiming = jest.fn();
  Reanimated.withSpring = jest.fn();

  return Reanimated;
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
  };
});

// Mock Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-vector-icons/Feather', () => 'Feather');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

// Mock Image Picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn((options, callback) => {
    callback({
      assets: [
        {
          uri: 'file://test-image.jpg',
          type: 'image/jpeg',
          fileName: 'test-image.jpg',
          fileSize: 1024,
          width: 300,
          height: 400,
        },
      ],
    });
  }),
  launchCamera: jest.fn((options, callback) => {
    callback({
      assets: [
        {
          uri: 'file://camera-image.jpg',
          type: 'image/jpeg',
          fileName: 'camera-image.jpg',
          fileSize: 2048,
          width: 400,
          height: 600,
        },
      ],
    });
  }),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  utils: () => ({
    FilePath: {
      PICTURES_DIRECTORY: '/pictures',
      DOCUMENTS_DIRECTORY: '/documents',
    },
  }),
}));

jest.mock('@react-native-firebase/storage', () => ({
  storage: () => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(() => Promise.resolve({ downloadURL: 'https://test-url.com/image.jpg' })),
      getDownloadURL: jest.fn(() => Promise.resolve('https://test-url.com/image.jpg')),
      delete: jest.fn(() => Promise.resolve()),
    })),
  }),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  firestore: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(() => Promise.resolve()),
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            data: () => ({ id: 'test-doc', name: 'Test Document' }),
          }),
        ),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
        onSnapshot: jest.fn(),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
      where: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({
            docs: [
              {
                id: 'doc1',
                data: () => ({ name: 'Document 1' }),
              },
            ],
          }),
        ),
      })),
    })),
  }),
}));

// Mock AI Services
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(() =>
            Promise.resolve({
              choices: [
                {
                  message: {
                    content: 'Test AI response',
                  },
                },
              ],
            }),
          ),
        },
      },
      images: {
        analyze: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                description: 'A beautiful dress',
                confidence: 0.95,
              },
            ],
          }),
        ),
      },
    })),
  };
});

jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    labelDetection: jest.fn(() =>
      Promise.resolve([
        {
          labelAnnotations: [
            {
              description: 'Clothing',
              score: 0.9,
            },
          ],
        },
      ]),
    ),
    textDetection: jest.fn(() =>
      Promise.resolve([
        {
          textAnnotations: [
            {
              description: 'Brand Name',
            },
          ],
        },
      ]),
    ),
  })),
}));

// Mock Haptic Feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    selection: 'selection',
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
  },
}));

// Mock Network Info
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock Supabase
jest.mock('@/config/supabase', () => ({
  supabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Define global mocks
const mocks = {
  asyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  hapticFeedback: jest.fn(),
  netInfo: {
    isConnected: {
      fetch: jest.fn(() => Promise.resolve(true)),
    },
  },
  reanimated: {
    withTiming: jest.fn(),
    withSpring: jest.fn(),
    FadeIn: {
      duration: jest.fn().mockReturnValue({}),
    },
  },
  imagePicker: jest.fn(),
  location: jest.fn(),
};

if (!global.mocks) {
  global.mocks = mocks;
}

// Ensure global mocks are initialized
if (!global.mocks) {
  global.mocks = mocks;
}

// Define global mocks object and warnInDev
if (!global.mocks) {
  global.mocks = {
    asyncStorage: {},
    netInfo: {},
    hapticFeedback: {},
    imagePicker: {},
    location: {},
  };
}

global.warnInDev = jest.fn();

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn and console.error in tests unless explicitly needed
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Global test timeout
jest.setTimeout(10000);

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  process.stderr.write(`Unhandled Rejection: ${reason}\n`);
});

// Export test utilities
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

export const mockRoute = {
  params: {},
  key: 'test-route',
  name: 'TestScreen',
};

export const flushPromises = () => new Promise(setImmediate);

export const waitForNextUpdate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};
