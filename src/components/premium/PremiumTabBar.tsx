import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AynamodaColors } from '@/theme/AynamodaColors';
import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 64; // Base tab bar height without safe area inset
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

interface PremiumTabBarProps {
  state: BottomTabBarProps['state'];
  descriptors: BottomTabBarProps['descriptors'];
  navigation: BottomTabBarProps['navigation'];
}

const tabs: TabItem[] = [
  {
    key: 'index',
    title: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    key: 'wardrobe',
    title: 'Wardrobe',
    icon: 'shirt-outline',
    iconFocused: 'shirt',
  },
  {
    key: 'ayna-mirror',
    title: 'Mirror',
    icon: 'glasses-outline',
    iconFocused: 'glasses',
  },
  {
    key: 'discover',
    title: 'Discover',
    icon: 'sparkles-outline',
    iconFocused: 'sparkles',
  },
  {
    key: 'profile',
    title: 'Profile',
    icon: 'person-circle-outline',
    iconFocused: 'person-circle',
  },
];

// Child component so hooks are used at the top level of a component, not inside a loop/callback
const TabButton: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}> = ({ tab, isActive, onPress, onLongPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1.1 : 1, DesignSystem.animations.spring.confident);
    opacity.value = withTiming(isActive ? 1 : 0.6, { duration: 200 });
    translateY.value = withSpring(isActive ? -2 : 0, DesignSystem.animations.spring.gentle);
  }, [isActive, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
    opacity: opacity.value,
  }));

  return React.createElement(
    AnimatedTouchableOpacity,
    {
      style: [styles.tab, animatedStyle],
      onPress,
      onLongPress,
      activeOpacity: 0.7,
      accessibilityRole: 'tab',
      accessibilityLabel: tab.title,
      accessibilityHint: `Navigate to ${tab.title} screen`,
      accessibilityState: { selected: isActive },
    },
    React.createElement(
      View,
      { style: styles.tabContent },
      React.createElement(Ionicons, {
        name: isActive ? tab.iconFocused : tab.icon,
        size: 24,
        color: isActive ? AynamodaColors.primary.terracotta : AynamodaColors.text.secondary,
      }),
      React.createElement(
        Text,
        {
          style: [
            styles.tabLabel,
            {
              color: isActive ? AynamodaColors.primary.terracotta : AynamodaColors.text.secondary,
              fontWeight: isActive ? '600' : '400',
            },
          ],
        },
        tab.title,
      ),
      isActive && React.createElement(View, { style: styles.activeIndicator }),
    ),
  );
};

const PremiumTabBar: React.FC<PremiumTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;

  // Floating indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorOpacity = useSharedValue(1);

  React.useEffect(() => {
    // Update indicator position
    const tabWidth = (width - DesignSystem.spacing.xl * 2) / tabs.length;
    indicatorPosition.value = withSpring(
      activeIndex * tabWidth,
      DesignSystem.animations.spring.gentle,
    );
  }, [activeIndex, indicatorPosition]);

  const floatingIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (width - DesignSystem.spacing.xl * 2) / tabs.length;

    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth,
      opacity: indicatorOpacity.value,
    };
  });

  return React.createElement(
    View,
    { style: [styles.container, { paddingBottom: insets.bottom }] },
    React.createElement(
      View,
      { style: styles.tabBarBackground },
      React.createElement(BlurView, {
        intensity: 95,
        tint: 'light',
        style: StyleSheet.absoluteFill,
      }),
      React.createElement(LinearGradient, {
        colors: AynamodaColors.gradients.cream,
        style: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      }),
    ),
    React.createElement(Animated.View, {
      style: [styles.floatingIndicator, floatingIndicatorStyle],
    }),
    React.createElement(
      View,
      { style: styles.tabsContainer },
      state.routes.map((route, index) => {
        const tab = tabs[index];
        if (!tab) {
          return null;
        }
        const isActive = index === activeIndex;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return React.createElement(TabButton, {
          key: tab.key,
          tab,
          isActive,
          onPress,
          onLongPress,
        });
      }),
    ),
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    backgroundColor: AynamodaColors.primary.terracotta,
    borderRadius: 3,
    bottom: -DesignSystem.spacing.md,
    height: 6,
    position: 'absolute',
    width: 6,
    ...DesignSystem.elevation.soft,
  },
  container: {
    bottom: 0,
    left: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    position: 'absolute',
    right: DesignSystem.spacing.lg,
  },
  floatingIndicator: {
    backgroundColor: AynamodaColors.primary.terracotta,
    borderRadius: 2,
    height: 4,
    position: 'absolute',
    top: DesignSystem.spacing.xs,
    ...DesignSystem.elevation.soft,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: DesignSystem.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingTop: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
});

export default PremiumTabBar;
