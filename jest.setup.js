// Jest setup file for AYNA Mirror tests

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Ensure elements created with data-testid can also be found by RN Testing Library's testID
try {
  const React = require('react');
  if (React && React.createElement) {
    const origCreate = React.createElement;
    React.createElement = (type, props, ...children) => {
      if (props && typeof props === 'object' && 'data-testid' in props && !('testID' in props)) {
        props = { ...props, testID: props['data-testid'] };
      }
      return origCreate(type, props, ...children);
    };
  }
} catch {}

// Mock React Native modules (removed problematic NativeAnimatedHelper mock)

// Mock React Native components
jest.mock('react-native', () => {
  // Mock Animated.Value class
  class MockAnimatedValue {
    constructor(value) {
      this._value = value;
      this._listeners = [];
    }
    
    setValue(value) {
      this._value = value;
    }
    
    addListener(callback) {
      this._listeners.push(callback);
      return this._listeners.length - 1;
    }
    
    removeListener(id) {
      this._listeners.splice(id, 1);
    }
    
    removeAllListeners() {
      this._listeners = [];
    }
    
    stopAnimation(callback) {
      if (callback) callback(this._value);
    }
    
    resetAnimation(callback) {
      if (callback) callback(this._value);
    }
    
    interpolate(config) {
      return new MockAnimatedValue(this._value);
    }
  }
  
  return {
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => style,
      compose: (style1, style2) => [style1, style2],
      absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
      absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
      hairlineWidth: 1,
    },
    Animated: {
      Value: MockAnimatedValue,
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      decay: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      stagger: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      loop: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
        reset: jest.fn(),
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
      Image: 'Animated.Image',
      FlatList: 'Animated.FlatList',
      createAnimatedComponent: jest.fn((component) => component),
      add: jest.fn((a, b) => new MockAnimatedValue(0)),
      subtract: jest.fn((a, b) => new MockAnimatedValue(0)),
      multiply: jest.fn((a, b) => new MockAnimatedValue(0)),
      divide: jest.fn((a, b) => new MockAnimatedValue(0)),
      modulo: jest.fn((a, b) => new MockAnimatedValue(0)),
      diffClamp: jest.fn((a, min, max) => new MockAnimatedValue(0)),
      event: jest.fn(() => jest.fn()),
    },
    Easing: {
      linear: (t) => t,
      ease: (t) => t,
      quad: (t) => t * t,
      cubic: (t) => t * t * t,
      poly: (n) => (t) => Math.pow(t, n),
      sin: (t) => 1 - Math.cos(t * Math.PI / 2),
      circle: (t) => 1 - Math.sqrt(1 - t * t),
      exp: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
      elastic: (bounciness = 1) => (t) => t,
      back: (s = 1.70158) => (t) => t,
      bounce: (t) => t,
      bezier: (x1, y1, x2, y2) => (t) => t,
      in: (easing) => easing,
      out: (easing) => (t) => 1 - easing(1 - t),
      inOut: (easing) => (t) => t < 0.5 ? easing(t * 2) / 2 : (2 - easing((1 - t) * 2)) / 2,
    },
    useWindowDimensions: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    })),
    AccessibilityInfo: {
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
      removeEventListener: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    Image: 'Image',
    TextInput: 'TextInput',
    SafeAreaView: 'SafeAreaView',
    StatusBar: 'StatusBar',
    FlatList: 'FlatList',
    SectionList: 'SectionList',
    Modal: 'Modal',
    Pressable: 'Pressable',
    ActivityIndicator: 'ActivityIndicator',
    Switch: 'Switch',
    Slider: 'Slider',
  };
});

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'mock-url',
        supabaseAnonKey: 'mock-key',
        google: {
          iosClientId: 'test-ios-client-id',
          androidClientId: 'test-android-client-id',
        },
      },
    },
  },
}));

// Mock Expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Expo notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: {
    HIGH: 'high',
    DEFAULT: 'default',
    LOW: 'low',
  },
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
}));

// Mock Expo image picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock Expo camera
jest.mock('expo-camera', () => ({
  requestCameraPermissionsAsync: jest.fn(),
}));

// Mock Expo router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
  useSegments: jest.fn(() => []),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// react-native-reanimated is mapped to its official mock via moduleNameMapper in jest.config.js

// Global test timeout
jest.setTimeout(10000);

// Enhance testing-library queries to expose a textContent convenience property
jest.mock('@testing-library/react-native', () => {
  const actual = jest.requireActual('@testing-library/react-native');
  const computeText = (node) => {
    if (!node) return '';
    const flatten = (n) => {
      if (n == null) return '';
      if (typeof n === 'string' || typeof n === 'number') return String(n);
      if (n.children && Array.isArray(n.children)) return n.children.map(flatten).join('');
      if (Array.isArray(n)) return n.map(flatten).join('');
      if (n.props && n.props.children) return flatten(n.props.children);
      return '';
    };
    return flatten(node);
  };
  const wrapInstance = (inst) => new Proxy(inst, {
    get(target, prop) {
      if (prop === 'textContent') return computeText(target);
      return target[prop];
    }
  });
  const wrapResult = (res) => {
    const safeGetByTestId = (id) => {
      try {
        return wrapInstance(res.getByTestId(id));
      } catch (e) {
        // If multiple elements found, fall back to first match
        try {
          const all = res.getAllByTestId(id);
          if (all && all.length > 0) return wrapInstance(all[0]);
        } catch {}
        throw e;
      }
    };
    const safeQueryByTestId = (id) => {
      try {
        return wrapInstance(res.getByTestId(id));
      } catch (e) {
        try {
          const all = res.getAllByTestId(id);
          return all && all.length > 0 ? wrapInstance(all[0]) : null;
        } catch {
          return null;
        }
      }
    };
    const safeFindByTestId = async (id) => {
      try {
        return wrapInstance(await res.findByTestId(id));
      } catch (e) {
        try {
          const all = await res.findAllByTestId(id);
          if (all && all.length > 0) return wrapInstance(all[0]);
        } catch {}
        throw e;
      }
    };
    return {
      ...res,
      getByTestId: safeGetByTestId,
      queryByTestId: safeQueryByTestId,
      findByTestId: safeFindByTestId,
    };
  };
  return {
    ...actual,
    render: (...args) => wrapResult(actual.render(...args)),
  };
});