// Artistry Tab Bar - Floating Navigation Art
// A sophisticated navigation system that breathes with the app's artistic soul

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '../../theme/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

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

const ArtistryTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const activeIndicator = useSharedValue(0);
  const tabAnimations = state.routes.map(() => ({
    scale: useSharedValue(1),
    opacity: useSharedValue(0.6),
    glow: useSharedValue(0),
  }));

  // Update active indicator position
  useEffect(() => {
    const targetPosition = state.index / (state.routes.length - 1);
    activeIndicator.value = withSpring(targetPosition, {
      damping: 20,
      stiffness: 200,
    });

    // Update tab animations
    tabAnimations.forEach((animation, index) => {
      const isActive = index === state.index;
      
      animation.scale.value = withSpring(isActive ? 1.1 : 1, {
        damping: 15,
        stiffness: 300,
      });
      
      animation.opacity.value = withTiming(isActive ? 1 : 0.6, {
        duration: 300,
      });
      
      animation.glow.value = withTiming(isActive ? 1 : 0, {
        duration: 400,
      });
    });
  }, [state.index]);

  // Animated styles
  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = width / state.routes.length;
    const translateX = interpolate(
      activeIndicator.value,
      [0, 1],
      [0, (state.routes.length - 1) * tabWidth]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const config = tabConfigs[route.name];
    
    if (!config) return null;

    const isActive = state.index === index;
    const animation = tabAnimations[index];

    const tabStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: animation.scale.value }],
        opacity: animation.opacity.value,
      };
    });

    const glowStyle = useAnimatedStyle(() => {
      return {
        opacity: animation.glow.value,
        transform: [{ scale: interpolate(animation.glow.value, [0, 1], [0.8, 1.2]) }],
      };
    });

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

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tab}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.tabContent, tabStyle]}>
          {/* Glow Effect */}
          <Animated.View style={[styles.tabGlow, glowStyle]}>
            <LinearGradient
              colors={[
                DesignSystem.colors.sage[400],
                'transparent',
              ]}
              style={styles.glowGradient}
            />
          </Animated.View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={isActive ? config.activeIcon : config.icon}
              size={24}
              color={
                isActive
                  ? DesignSystem.colors.text.accent
        : DesignSystem.colors.text.tertiary
              }
            />
          </View>

          {/* Label */}
          <Text
            style={[
              styles.tabLabel,
              {
                color: isActive
                  ? DesignSystem.colors.text.accent
        : DesignSystem.colors.text.tertiary,
              },
            ]}
          >
            {config.label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Background Blur */}
      <BlurView intensity={40} style={styles.blur}>
        <LinearGradient
          colors={[
            'rgba(10, 10, 11, 0.95)',
            'rgba(26, 26, 28, 0.90)',
          ]}
          style={styles.backgroundGradient}
        />
      </BlurView>

      {/* Active Indicator */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            DesignSystem.colors.sage[400],
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.indicatorGradient}
        />
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => renderTab(route, index))}
      </View>

      {/* Floating Border */}
      <View style={styles.floatingBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    marginHorizontal: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    ...DesignSystem.elevation.soft,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DesignSystem.radius.lg,
  },
  backgroundGradient: {
    flex: 1,
    borderRadius: DesignSystem.radius.lg,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    width: width / 5, // Assuming 5 tabs
    borderRadius: 2,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.md,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -15,
    left: -15,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 30,
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.xs,
  },
  tabLabel: {
    ...DesignSystem.typography.caption,
    fontSize: 10,
    textAlign: 'center',
  },
  floatingBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: DesignSystem.colors.sage[200],
    opacity: 0.3,
  },
});

export default ArtistryTabBar;