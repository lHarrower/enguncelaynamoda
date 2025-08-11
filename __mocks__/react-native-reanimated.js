// Comprehensive mock for react-native-reanimated
// This provides complete mocking for reanimated components, worklets, and gestures

const mockAnimatedValue = {
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  interpolate: jest.fn(() => mockAnimatedValue),
  animate: jest.fn(),
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  _value: 0,
  _offset: 0,
  delay: jest.fn().mockReturnThis(),
  duration: jest.fn().mockReturnThis(),
  withTiming: jest.fn().mockReturnThis(),
  withSpring: jest.fn().mockReturnThis(),
  withDelay: jest.fn().mockReturnThis(),
  withRepeat: jest.fn().mockReturnThis(),
  withSequence: jest.fn().mockReturnThis(),
};

const mockSharedValue = (initialValue) => ({
  value: initialValue,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  modify: jest.fn(),
});

const mockAnimatedComponent = (Component) => {
  const AnimatedComponent = (props) => {
    return Component(props);
  };
  AnimatedComponent.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
  return AnimatedComponent;
};

// Mock worklet function
const mockWorklet = (fn) => {
  fn._workletHash = Math.random();
  fn.__workletHash = Math.random();
  return fn;
};

// Mock runOnJS
const mockRunOnJS = (fn) => {
  return (...args) => fn(...args);
};

// Mock runOnUI
const mockRunOnUI = (fn) => {
  return (...args) => fn(...args);
};

const Animated = {
  View: 'Animated.View',
  Text: 'Animated.Text',
  Pressable: 'Animated.Pressable',
  ScrollView: 'Animated.ScrollView',
  FlatList: 'Animated.FlatList',
  Image: 'Animated.Image',
  
  // Entering animations
  FadeIn: mockAnimatedValue,
  FadeInUp: mockAnimatedValue,
  FadeInDown: mockAnimatedValue,
  FadeInLeft: mockAnimatedValue,
  FadeInRight: mockAnimatedValue,
  SlideInUp: mockAnimatedValue,
  SlideInDown: mockAnimatedValue,
  SlideInLeft: mockAnimatedValue,
  SlideInRight: mockAnimatedValue,
  ZoomIn: mockAnimatedValue,
  ZoomInRotate: mockAnimatedValue,
  ZoomInLeft: mockAnimatedValue,
  ZoomInRight: mockAnimatedValue,
  ZoomInUp: mockAnimatedValue,
  ZoomInDown: mockAnimatedValue,
  
  // Exiting animations
  FadeOut: mockAnimatedValue,
  FadeOutUp: mockAnimatedValue,
  FadeOutDown: mockAnimatedValue,
  FadeOutLeft: mockAnimatedValue,
  FadeOutRight: mockAnimatedValue,
  SlideOutUp: mockAnimatedValue,
  SlideOutDown: mockAnimatedValue,
  SlideOutLeft: mockAnimatedValue,
  SlideOutRight: mockAnimatedValue,
  ZoomOut: mockAnimatedValue,
  ZoomOutRotate: mockAnimatedValue,
  ZoomOutLeft: mockAnimatedValue,
  ZoomOutRight: mockAnimatedValue,
  ZoomOutUp: mockAnimatedValue,
  ZoomOutDown: mockAnimatedValue,
  
  // Layout animations
  Layout: mockAnimatedValue,
  LinearTransition: mockAnimatedValue,
  FadingTransition: mockAnimatedValue,
  SequencedTransition: mockAnimatedValue,
  JumpingTransition: mockAnimatedValue,
  CurvedTransition: mockAnimatedValue,
  EntryExitTransition: mockAnimatedValue,
  
  // Hooks and utilities
  useSharedValue: jest.fn((initial) => ({ value: initial })),
  useAnimatedStyle: jest.fn((fn) => ({})),
  useAnimatedProps: jest.fn((fn) => ({})),
  useAnimatedGestureHandler: jest.fn((handlers) => handlers),
  useAnimatedScrollHandler: jest.fn((handler) => handler),
  useAnimatedRef: jest.fn(() => ({ current: null })),
  useDerivedValue: jest.fn((fn) => ({ value: fn() })),
  useAnimatedReaction: jest.fn(),
  
  // Animation functions
  withTiming: jest.fn((value, config, callback) => value),
  withSpring: jest.fn((value, config, callback) => value),
  withDelay: jest.fn((delay, animation) => animation),
  withRepeat: jest.fn((animation, numberOfReps, reverse) => animation),
  withSequence: jest.fn((...animations) => animations[0]),
  cancelAnimation: jest.fn(),
  
  // Easing
  Easing: {
    linear: jest.fn(() => (t) => t),
    ease: jest.fn(() => (t) => t),
    quad: jest.fn(() => (t) => t * t),
    cubic: jest.fn(() => (t) => t * t * t),
    poly: jest.fn(() => (t) => t),
    sin: jest.fn(() => (t) => t),
    circle: jest.fn(() => (t) => t),
    exp: jest.fn(() => (t) => t),
    elastic: jest.fn(() => (t) => t),
    back: jest.fn(() => (t) => t),
    bounce: jest.fn(() => (t) => t),
    bezier: jest.fn(() => (t) => t),
    in: jest.fn((fn) => fn),
    out: jest.fn((fn) => fn),
    inOut: jest.fn((fn) => fn),
  },
  
  // Gesture handler
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
  
  // Interpolation
  interpolate: jest.fn(),
  interpolateColor: jest.fn(),
  
  // Create animated component
  createAnimatedComponent: jest.fn((component) => component),
};

// Export both default and named exports
export default Animated;
export const {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  Image,
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  ZoomInRotate,
  FadeOut,
  FadeOutUp,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  SlideOutUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  ZoomOut,
  ZoomOutRotate,
  Layout,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useDerivedValue,
  useAnimatedReaction,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  runOnJS,
  runOnUI,
  interpolate,
  interpolateColor,
  createAnimatedComponent,
} = Animated;

// Additional exports for comprehensive mocking
export const useWorkletCallback = jest.fn((fn) => mockWorklet(fn));
export const withDecay = jest.fn((config, callback) => {
  if (callback) callback(true);
  return config.velocity || 0;
});
export const measure = jest.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  pageX: 0,
  pageY: 0,
}));
export const scrollTo = jest.fn();
export const isWorklet = jest.fn(() => false);
export const makeShareable = jest.fn((value) => value);

// Gesture exports
export const Gesture = {
  Tap: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
    shouldCancelWhenOutside: jest.fn().mockReturnThis(),
  })),
  Pan: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
    minDistance: jest.fn().mockReturnThis(),
    activeOffsetX: jest.fn().mockReturnThis(),
    activeOffsetY: jest.fn().mockReturnThis(),
  })),
  Pinch: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
  Rotation: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
  Fling: jest.fn(() => ({
    direction: jest.fn().mockReturnThis(),
    numberOfPointers: jest.fn().mockReturnThis(),
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
  LongPress: jest.fn(() => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
    minDuration: jest.fn().mockReturnThis(),
  })),
  Race: jest.fn((...gestures) => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
  Simultaneous: jest.fn((...gestures) => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
  Exclusive: jest.fn((...gestures) => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  })),
};

export const GestureDetector = 'GestureDetector';
export const GestureHandlerRootView = 'GestureHandlerRootView';

// Additional animation exports
export const BounceIn = mockAnimatedValue;
export const BounceOut = mockAnimatedValue;
export const FlipInXUp = mockAnimatedValue;
export const FlipOutXUp = mockAnimatedValue;
export const FadingTransition = mockAnimatedValue;
export const SequencedTransition = mockAnimatedValue;
export const JumpingTransition = mockAnimatedValue;
export const CurvedTransition = mockAnimatedValue;
export const EntryExitTransition = mockAnimatedValue;

// Extrapolate constants
export const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

// Layout animation config
export const LayoutAnimationConfig = {
  duration: 300,
  create: {
    type: 'linear',
    property: 'opacity',
  },
  update: {
    type: 'linear',
  },
  delete: {
    type: 'linear',
    property: 'opacity',
  },
};

// Reanimated 3 APIs
export const configureReanimatedLogger = jest.fn();
export const isConfigured = jest.fn(() => true);
export const addWhitelistedNativeProps = jest.fn();
export const addWhitelistedUIProps = jest.fn();

// CommonJS exports for compatibility
module.exports = {
  default: Animated,
  ...Animated,
  useWorkletCallback: jest.fn((fn) => mockWorklet(fn)),
  withDecay: jest.fn((config, callback) => {
    if (callback) callback(true);
    return config.velocity || 0;
  }),
  measure,
  scrollTo,
  isWorklet,
  makeShareable,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  BounceIn: mockAnimatedValue,
  BounceOut: mockAnimatedValue,
  FlipInXUp: mockAnimatedValue,
  FlipOutXUp: mockAnimatedValue,
  FadingTransition: mockAnimatedValue,
  SequencedTransition: mockAnimatedValue,
  JumpingTransition: mockAnimatedValue,
  CurvedTransition: mockAnimatedValue,
  EntryExitTransition: mockAnimatedValue,
  Extrapolate,
  LayoutAnimationConfig,
  configureReanimatedLogger,
  isConfigured,
  addWhitelistedNativeProps,
  addWhitelistedUIProps,
};