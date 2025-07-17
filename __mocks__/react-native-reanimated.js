// Mock for react-native-reanimated
const Animated = {
  View: 'Animated.View',
  Text: 'Animated.Text',
  Pressable: 'Animated.Pressable',
  FadeInUp: {
    delay: jest.fn().mockReturnThis(),
    duration: jest.fn().mockReturnThis(),
  },
  FadeInDown: {
    delay: jest.fn().mockReturnThis(),
    duration: jest.fn().mockReturnThis(),
  },
  FadeIn: {
    duration: jest.fn().mockReturnThis(),
  },
};

export default Animated;