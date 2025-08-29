// Jest setup file for AYNA Mirror tests

// Setup jest-axe for accessibility testing
import 'jest-axe/extend-expect';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }),
);

// Mock loadNotifications function globally
global.loadNotifications = jest.fn().mockResolvedValue({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-token' }),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn(),
  AndroidImportance: {
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
  },
  AndroidNotificationPriority: {
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
    MIN: 'min',
    MAX: 'max',
  },
});

// Mock React Native APIs FIRST
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    findNodeHandle: jest.fn(() => 1),
    AccessibilityInfo: {
      setAccessibilityFocus: jest.fn(),
      announceForAccessibility: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock StyleSheet FIRST before any other imports
const mockStyleSheet = {
  create: jest.fn((styles) => styles),
  flatten: jest.fn((style) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style.filter(Boolean));
    }
    return style || {};
  }),
  compose: jest.fn((style1, style2) => [style1, style2]),
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  hairlineWidth: 1,
};

// Make StyleSheet available globally IMMEDIATELY
global.StyleSheet = mockStyleSheet;

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock react-native with all necessary hooks and modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setBackgroundColor: jest.fn(),
    },
    AccessibilityInfo: {
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
      removeEventListener: jest.fn(),
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
      announceForAccessibility: jest.fn(),
    },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const mockSharedValue = (initialValue) => ({
    value: initialValue,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  });

  const View = require('react-native').View;
  const Text = require('react-native').Text;

  return {
    useSharedValue: jest.fn(mockSharedValue),
    useAnimatedStyle: jest.fn((fn) => fn()),
    useAnimatedProps: jest.fn((fn) => fn()),
    useDerivedValue: jest.fn((fn) => ({ value: fn() })),
    useAnimatedReaction: jest.fn(),
    useAnimatedRef: jest.fn(() => ({ current: null })),
    useAnimatedScrollHandler: jest.fn(() => ({})),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useWorkletCallback: jest.fn((fn) => fn),
    useFrameCallback: jest.fn(),
    useAnimatedKeyboard: jest.fn(() => ({ height: { value: 0 } })),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withDecay: jest.fn((value) => value),
    withDelay: jest.fn((delay, animation) => animation),
    withRepeat: jest.fn((animation) => animation),
    withSequence: jest.fn((...animations) => animations[0]),
    cancelAnimation: jest.fn(),
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    interpolate: jest.fn(),
    interpolateColor: jest.fn(),
    Extrapolate: {
      EXTEND: 'extend',
      CLAMP: 'clamp',
      IDENTITY: 'identity',
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      poly: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      back: jest.fn(),
      bounce: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
    // Animated components
    default: {
      View: View,
      Text: Text,
      ScrollView: View,
      Image: View,
      createAnimatedComponent: jest.fn((component) => component),
    },
    // Named exports for Animated components
    View: View,
    Text: Text,
    ScrollView: View,
    Image: View,
    createAnimatedComponent: jest.fn((component) => component),
    // Layout animations
    Layout: {
      springify: jest.fn(),
      damping: jest.fn(),
      mass: jest.fn(),
      stiffness: jest.fn(),
      overshootClamping: jest.fn(),
      restDisplacementThreshold: jest.fn(),
      restSpeedThreshold: jest.fn(),
    },
    SlideInLeft: jest.fn(),
    SlideInRight: jest.fn(),
    SlideInUp: jest.fn(),
    SlideInDown: jest.fn(),
    SlideOutLeft: jest.fn(),
    SlideOutRight: jest.fn(),
    SlideOutUp: jest.fn(),
    SlideOutDown: jest.fn(),
    FadeIn: jest.fn(),
    FadeInLeft: jest.fn(),
    FadeInRight: jest.fn(),
    FadeInUp: jest.fn(),
    FadeInDown: jest.fn(),
    FadeOut: jest.fn(),
    FadeOutLeft: jest.fn(),
    FadeOutRight: jest.fn(),
    FadeOutUp: jest.fn(),
    FadeOutDown: jest.fn(),
    ZoomIn: jest.fn(),
    ZoomInLeft: jest.fn(),
    ZoomInRight: jest.fn(),
    ZoomInUp: jest.fn(),
    ZoomInDown: jest.fn(),
    ZoomOut: jest.fn(),
    ZoomOutLeft: jest.fn(),
    ZoomOutRight: jest.fn(),
    ZoomOutUp: jest.fn(),
    ZoomOutDown: jest.fn(),
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  return {
    BlurView: React.forwardRef(({ children, ...props }, ref) => {
      const { View } = require('react-native');
      return React.createElement(View, { ...props, ref }, children);
    }),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: React.forwardRef(({ children, ...props }, ref) => {
      const { View } = require('react-native');
      return React.createElement(View, { ...props, ref }, children);
    }),
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
  Feather: 'Feather',
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
    fromModule: jest.fn(() => ({ uri: 'mock-asset-uri' })),
  },
}));

// Mock Supabase client
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
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
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      rangeGt: jest.fn().mockReturnThis(),
      rangeGte: jest.fn().mockReturnThis(),
      rangeLt: jest.fn().mockReturnThis(),
      rangeLte: jest.fn().mockReturnThis(),
      rangeAdjacent: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
      })),
    },
  },
}));

import { mockSupabaseClient } from './src/__tests__/mocks';

// Initialize global mocks
global.mocks = {
  supabase: mockSupabaseClient,
  asyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  reanimated: {
    withTiming: jest.fn().mockImplementation((value) => value),
    withSpring: jest.fn().mockImplementation((value) => value),
    withDecay: jest.fn().mockImplementation((value) => value),
  },
};



// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(() => []),
  multiGet: jest.fn(() => []),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock react-native-gesture-handler
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

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
    withSafeAreaInsets: (Component) => Component,
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    NavigationContainer: ({ children }) => React.createElement(View, {}, children),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => false),
      getId: jest.fn(() => 'test-id'),
      getParent: jest.fn(),
      getState: jest.fn(() => ({})),
    }),
    useRoute: () => ({
      key: 'test-route',
      name: 'TestScreen',
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
    useNavigationState: jest.fn(() => ({})),
    createNavigationContainerRef: jest.fn(() => ({
      current: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        reset: jest.fn(),
        getRootState: jest.fn(() => ({})),
        getCurrentRoute: jest.fn(() => ({ name: 'TestScreen' })),
        getCurrentOptions: jest.fn(() => ({})),
        isReady: jest.fn(() => true),
      },
    })),
    CommonActions: {
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
    },
    StackActions: {
      push: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
      replace: jest.fn(),
    },
    TabActions: {
      jumpTo: jest.fn(),
    },
    DrawerActions: {
      openDrawer: jest.fn(),
      closeDrawer: jest.fn(),
      toggleDrawer: jest.fn(),
    },
  };
});

// Mock ThemeProvider to always render children
jest.mock('@/theme/ThemeProvider', () => {
  return {
    ThemeProvider: ({ children }) => children,
    useTheme: () => ({
      theme: {},
      colors: {},
      typography: {},
      spacing: {},
      layout: {},
      elevation: {},
      borderRadius: {},
      components: {},
    }),
    useColors: () => ({}),
    useTypography: () => ({}),
    useSpacing: () => ({}),
    useLayout: () => ({}),
    useElevation: () => ({}),
    useBorderRadius: () => ({}),
    useComponents: () => ({}),
    useThemeWithDark: () => ({ isDark: false }),
  };
});

// Mock other providers
jest.mock('@/providers/AnimationProvider', () => ({
  AnimationProvider: ({ children }) => children,
  useAnimation: () => ({ reducedMotion: false }),
}));

jest.mock('@/providers/HapticProvider', () => ({
  HapticProvider: ({ children }) => children,
  useHaptic: () => ({ trigger: jest.fn() }),
}));

jest.mock('@/providers/ErrorProvider', () => ({
  ErrorProvider: ({ children }) => children,
  useError: () => ({ reportError: jest.fn() }),
}));

jest.mock('@/providers/WardrobeProvider', () => ({
  WardrobeProvider: ({ children }) => children,
  useWardrobe: () => ({
    state: { items: [], favorites: [] },
    dispatch: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    toggleFavorite: jest.fn(),
  }),
}));

jest.mock('@/providers/AIProvider', () => ({
  AIProvider: ({ children }) => children,
  useAI: () => ({
    analyzeImage: jest.fn(),
    getStyleAdvice: jest.fn(),
  }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
  Feather: 'Feather',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock react-native-reanimated for WardrobeCard
jest.mock('react-native-reanimated', () => {
  const { View, Text, ScrollView, Image } = require('react-native');
  return {
    default: {
      View,
      Text,
      ScrollView,
      Image,
      createAnimatedComponent: jest.fn((component) => component),
      call: jest.fn(),
    },
    View,
    Text,
    ScrollView,
    Image,
    useSharedValue: jest.fn(() => ({ value: 1 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: 'clamp' },
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
  };
});

// Mock useHapticFeedback hook
jest.mock('@/hooks/useHapticFeedback', () => ({
  useHapticFeedback: () => ({
    trigger: jest.fn(),
    triggerHaptic: jest.fn(),
    triggerImpact: jest.fn(),
    triggerNotification: jest.fn(),
    triggerSelection: jest.fn(),
  }),
}));

// Mock @react-navigation/stack
jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, {}, children),
      Screen: ({ children }) => React.createElement(View, {}, children),
    }),
    TransitionPresets: {
      SlideFromRightIOS: {},
      ModalSlideFromBottomIOS: {},
      FadeFromBottomAndroid: {},
      RevealFromBottomAndroid: {},
    },
    CardStyleInterpolators: {
      forHorizontalIOS: {},
      forVerticalIOS: {},
      forModalPresentationIOS: {},
      forFadeFromBottomAndroid: {},
      forRevealFromBottomAndroid: {},
    },
    HeaderStyleInterpolators: {
      forUIKit: {},
      forFade: {},
      forStatic: {},
    },
  };
});

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => React.createElement(View, {}, children),
      Screen: ({ children }) => React.createElement(View, {}, children),
    }),
  };
});

// Reinitialize global.mocks to fix undefined errors
if (!global.mocks) {
  global.mocks = {
    supabase: mockSupabaseClient,
    asyncStorage: jest.fn(),
    hapticFeedback: jest.fn(),
    reanimated: {
      withTiming: jest.fn((value) => value),
      withSpring: jest.fn((value) => value),
    },
  };
}
