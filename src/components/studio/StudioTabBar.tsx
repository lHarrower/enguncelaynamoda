// Studio Tab Bar - Clean, User-Friendly Navigation
// Bright, confident design with Poppi-inspired smooth interactions

import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { Route } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const tabConfigs: Record<string, TabConfig> = {
  index: {
    name: 'index',
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Home',
  },
  wardrobe: {
    name: 'wardrobe',
    icon: 'shirt-outline',
    activeIcon: 'shirt',
    label: 'Wardrobe',
  },
  'ayna-mirror': {
    name: 'ayna-mirror',
    icon: 'glasses-outline',
    activeIcon: 'glasses',
    label: 'Mirror',
  },
  discover: {
    name: 'discover',
    icon: 'sparkles-outline',
    activeIcon: 'sparkles',
    label: 'Discover',
  },
  profile: {
    name: 'profile',
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profile',
  },
};

// New TabButton component to encapsulate hooks per tab
const TabButton: React.FC<{
  isActive: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ isActive, icon, activeIcon, label, onPress }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.1 : 1, DesignSystem.animations.spring.smooth);
    translateY.value = withSpring(isActive ? -2 : 0, DesignSystem.animations.spring.smooth);
  }, [isActive, scale, translateY]);

  const tabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }] as any,
  }));

  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.tabContent, tabStyle]}>
        <Ionicons
          name={isActive ? activeIcon : icon}
          size={24}
          color={isActive ? DesignSystem.colors.sage[500] : DesignSystem.colors.text.tertiary}
        />
        <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const StudioTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Active indicator animation
  const activeIndicator = useSharedValue(0);

  useEffect(() => {
    // Update active indicator position
    const targetPosition = state.index / Math.max(1, state.routes.length - 1);
    activeIndicator.value = withSpring(targetPosition, DesignSystem.animations.spring.smooth);
  }, [state.index, state.routes.length, activeIndicator]);

  // Active indicator style
  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = width / state.routes.length;
    const translateX = interpolate(
      activeIndicator.value,
      [0, 1],
      [0, (state.routes.length - 1) * tabWidth],
    );

    return {
      transform: [{ translateX }] as any,
    };
  });

  const renderTab = (route: Route<string>, index: number) => {
    const descriptor = descriptors[route.key];
    if (!descriptor) {
      return null;
    }

    const config = tabConfigs[route.name];
    if (!config) {
      return null;
    }

    const isActive = state.index === index;

    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isActive && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return (
      <TabButton
        key={route.key}
        isActive={isActive}
        icon={config.icon}
        activeIcon={config.activeIcon}
        label={config.label}
        onPress={handlePress}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Background */}
      <View style={styles.background} />

      {/* Active Indicator */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]}>
        <LinearGradient
          colors={[DesignSystem.colors.sage[500], DesignSystem.colors.amber[500]]}
          style={styles.indicatorGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => renderTab(route, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    borderRadius: 2,
    height: 3,
    position: 'absolute',
    top: 0,
    width: width / 5, // Assuming 5 tabs
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DesignSystem.colors.background.elevated,
    borderTopColor: DesignSystem.colors.background.tertiary,
    borderTopWidth: 1,
    ...DesignSystem.elevation.soft,
  },
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  indicatorGradient: {
    borderRadius: 2,
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: DesignSystem.colors.sage[500],
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: DesignSystem.colors.text.tertiary,
    fontWeight: '400',
  },
  tabsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingTop: DesignSystem.spacing.md,
  },
});

export default StudioTabBar;
