import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

// const { width: screenWidth } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface UltraPremiumTabBarProps {
  state: BottomTabBarProps['state'];
  descriptors: BottomTabBarProps['descriptors'];
  navigation: BottomTabBarProps['navigation'];
}

const tabs: TabItem[] = [
  {
    key: 'index',
    title: 'Home',
    icon: 'home-outline',
  },
  {
    key: 'wardrobe',
    title: 'Wardrobe',
    icon: 'shirt-outline',
  },
  {
    key: 'ayna-mirror',
    title: 'Mirror',
    icon: 'glasses-outline',
  },
  {
    key: 'discover',
    title: 'Discover',
    icon: 'sparkles-outline',
  },
  {
    key: 'profile',
    title: 'Profile',
    icon: 'person-outline',
  },
];

// Dedicated tab button to keep hooks at component top-level
const TabButton: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}> = ({ tab, isActive, onPress, onLongPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withTiming(isActive ? 1.05 : 1, { duration: 200 });
    opacity.value = withTiming(isActive ? 1 : 0.6, { duration: 200 });
  }, [isActive, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return React.createElement(
    AnimatedTouchableOpacity,
    {
      style: [styles.tab, animatedStyle],
      onPress,
      onLongPress,
      activeOpacity: 0.8,
    },
    React.createElement(
      View,
      { style: [styles.tabContent, isActive && styles.tabContentActive] },
      React.createElement(Ionicons, {
        name: tab.icon,
        size: 20,
        color: isActive ? DesignSystem.colors.text.primary : DesignSystem.colors.text.tertiary,
      }),
      React.createElement(
        Text,
        {
          style: [styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive],
        },
        tab.title,
      ),
    ),
  );
};

const UltraPremiumTabBar: React.FC<UltraPremiumTabBarProps> = ({
  state,
  descriptors: _descriptors,
  navigation,
}) => {
  const activeIndex = state.index;

  return React.createElement(
    SafeAreaView,
    { style: styles.container, edges: ['bottom'] },
    React.createElement(
      View,
      { style: styles.tabBar },
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
    ),
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabBar: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderTopColor: DesignSystem.colors.border.secondary,
    borderTopWidth: 1,
    paddingBottom: DesignSystem.spacing.sm,
    paddingTop: DesignSystem.spacing.md,
  },
  tabContent: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.sm,
    justifyContent: 'center',
    minWidth: 60,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  tabContentActive: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.secondary,
    borderWidth: 1,
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: DesignSystem.colors.text.primary,
  },
  tabLabelInactive: {
    color: DesignSystem.colors.text.tertiary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.sm,
  },
});

export default UltraPremiumTabBar;
