// Artistry Tab Bar - Floating Navigation Art
// A sophisticated navigation system that breathes with the app's artistic soul

import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '../../theme/DesignSystem';

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
    label: 'Sanctuary',
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

// Encapsulate hook usage per tab to comply with Rules of Hooks
// TabButton component moved outside to fix React hooks rules violation
const TabButton: React.FC<{
  isActive: boolean;
  config: TabConfig;
  onPress: () => void;
}> = ({ isActive, config, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const glow = useSharedValue(0);

  useEffect(() => {
    // Animate to active/inactive states
    scale.value = withSpring(isActive ? 1.1 : 1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(isActive ? 1 : 0.6, { duration: 300 });
    glow.value = withTiming(isActive ? 1 : 0, { duration: 400 });
  }, [isActive, scale, opacity, glow]);

  const tabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: interpolate(glow.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.tabContent, tabStyle]}>
        {/* Glow Effect */}
        <Animated.View style={[styles.tabGlow, glowStyle]}>
          <LinearGradient
            colors={[DesignSystem.colors.sage[400], 'transparent']}
            style={styles.glowGradient}
          />
        </Animated.View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={isActive ? config.activeIcon : config.icon}
            size={24}
            color={isActive ? DesignSystem.colors.text.accent : DesignSystem.colors.text.tertiary}
          />
        </View>

        {/* Label */}
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? DesignSystem.colors.text.accent : DesignSystem.colors.text.tertiary,
            },
          ]}
        >
          {config.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const ArtistryTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  // Animation values
  const activeIndicator = useSharedValue(0);

  // Update active indicator position only (per-tab animations live inside TabButton)
  useEffect(() => {
    const targetPosition = state.index / Math.max(1, state.routes.length - 1);
    activeIndicator.value = withSpring(targetPosition, {
      damping: 20,
      stiffness: 200,
    });
  }, [state.index, state.routes.length, activeIndicator]);

  // Animated styles
  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = width / state.routes.length;
    const translateX = interpolate(
      activeIndicator.value,
      [0, 1],
      [0, (state.routes.length - 1) * tabWidth],
    );

    return {
      transform: [{ translateX }],
    };
  });

  const renderTab = (route: { key: string; name: string; params?: object }, index: number) => {
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
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isActive && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return <TabButton key={route.key} isActive={isActive} config={config} onPress={handlePress} />;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Background Blur */}
      <BlurView intensity={40} style={styles.blur}>
        <LinearGradient
          colors={['rgba(10, 10, 11, 0.95)', 'rgba(26, 26, 28, 0.90)']}
          style={styles.backgroundGradient}
        />
      </BlurView>

      {/* Active Indicator */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]}>
        <LinearGradient
          colors={['transparent', DesignSystem.colors.sage[400], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.indicatorGradient}
        />
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, i) => renderTab(route, i))}
      </View>

      {/* Floating Border */}
      <View style={styles.floatingBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    width: width / 5, // Assuming 5 tabs
    borderRadius: 2,
  },
  backgroundGradient: {
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DesignSystem.radius.lg,
  },
  container: {
    borderRadius: DesignSystem.radius.lg,
    bottom: 0,
    height: 90,
    left: 0,
    marginBottom: DesignSystem.spacing.md,
    marginHorizontal: DesignSystem.spacing.md,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    ...DesignSystem.elevation.soft,
  },
  floatingBorder: {
    backgroundColor: DesignSystem.colors.sage[200],
    height: 1,
    left: 0,
    opacity: 0.3,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  glowGradient: {
    borderRadius: 30,
    flex: 1,
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.xs,
  },
  indicatorGradient: {
    borderRadius: 2,
    flex: 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.md,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabGlow: {
    borderRadius: 30,
    height: 60,
    left: -15,
    position: 'absolute',
    top: -15,
    width: 60,
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    fontSize: 10,
    textAlign: 'center',
  },
  tabsContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.xs,
  },
});

export default ArtistryTabBar;
