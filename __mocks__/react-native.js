// Mock for react-native
const mockComponent = (name) => {
  const Component = (props) => {
    return React.createElement(name, props, props.children);
  };
  Component.displayName = name;
  return Component;
};

const React = require('react');

const ReactNative = {
  // Core components
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  Image: mockComponent('Image'),
  ScrollView: mockComponent('ScrollView'),
  FlatList: mockComponent('FlatList'),
  SectionList: mockComponent('SectionList'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
  Pressable: mockComponent('Pressable'),
  TextInput: mockComponent('TextInput'),
  Switch: mockComponent('Switch'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Modal: mockComponent('Modal'),
  SafeAreaView: mockComponent('SafeAreaView'),
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
  RefreshControl: mockComponent('RefreshControl'),

  // Animated
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    ScrollView: mockComponent('Animated.ScrollView'),
    FlatList: mockComponent('Animated.FlatList'),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      interpolate: jest.fn(() => ({ setValue: jest.fn() })),
    })),
    ValueXY: jest.fn(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
      extractOffset: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      resetAnimation: jest.fn(),
      getLayout: jest.fn(() => ({ left: 0, top: 0 })),
      getTranslateTransform: jest.fn(() => []),
      x: { setValue: jest.fn(), addListener: jest.fn() },
      y: { setValue: jest.fn(), addListener: jest.fn() },
    })),
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
    event: jest.fn(() => jest.fn()),
    createAnimatedComponent: jest.fn((component) => component),
  },

  // Easing - This is the critical part for fixing the Animation.ts issue
  Easing: {
    linear: jest.fn((t) => t),
    ease: jest.fn((t) => t),
    quad: jest.fn((t) => t * t),
    cubic: jest.fn((t) => t * t * t),
    poly: jest.fn((n) => (t) => Math.pow(t, n)),
    sin: jest.fn((t) => 1 - Math.cos((t * Math.PI) / 2)),
    circle: jest.fn((t) => 1 - Math.sqrt(1 - t * t)),
    exp: jest.fn((t) => Math.pow(2, 10 * (t - 1))),
    elastic: jest.fn((bounciness) => (t) => t),
    back: jest.fn((s) => (t) => t),
    bounce: jest.fn((t) => t),
    bezier: jest.fn((x1, y1, x2, y2) => (t) => t), // Critical for Animation.ts
    in: jest.fn((easing) => easing),
    out: jest.fn((easing) => (t) => 1 - easing(1 - t)),
    inOut: jest.fn(
      (easing) => (t) => (t < 0.5 ? easing(t * 2) / 2 : (2 - easing((1 - t) * 2)) / 2),
    ),
    step0: jest.fn((t) => (t >= 1 ? 1 : 0)),
    step1: jest.fn((t) => (t > 0 ? 1 : 0)),
  },

  // Dimensions
  Dimensions: {
    get: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // Platform
  Platform: {
    OS: 'ios',
    Version: '14.0',
    isPad: false,
    isTVOS: false,
    isTV: false,
    select: jest.fn((obj) => obj.ios || obj.default),
  },

  // StyleSheet
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    compose: (style1, style2) => [style1, style2],
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
  },

  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((layoutSize) => layoutSize * 2),
    roundToNearestPixel: jest.fn((layoutSize) => Math.round(layoutSize)),
  },

  // Alert
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },

  // AppState
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // Keyboard
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
  },

  // Linking
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },

  // BackHandler
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },

  // StatusBar
  StatusBar: {
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
    setHidden: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
    setTranslucent: jest.fn(),
    currentHeight: 24,
  },

  // DeviceEventEmitter
  DeviceEventEmitter: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  },

  // NativeEventEmitter
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  })),

  // NativeModules
  NativeModules: {},

  // findNodeHandle
  findNodeHandle: jest.fn(),

  // requireNativeComponent
  requireNativeComponent: jest.fn((name) => mockComponent(name)),

  // processColor
  processColor: jest.fn((color) => color),

  // ColorPropType
  ColorPropType: jest.fn(),

  // EdgeInsetsPropType
  EdgeInsetsPropType: jest.fn(),

  // PointPropType
  PointPropType: jest.fn(),

  // ViewPropTypes
  ViewPropTypes: {
    style: jest.fn(),
  },

  // TextPropTypes
  TextPropTypes: {
    style: jest.fn(),
  },

  // ImagePropTypes
  ImagePropTypes: {
    style: jest.fn(),
    source: jest.fn(),
  },
};

module.exports = ReactNative;
