// Studio Tab Bar - Clean, User-Friendly Navigation
// Bright, confident design with Poppi-inspired smooth interactions

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
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { STUDIO_THEME } from '../../constants/StudioTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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

const StudioTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation values for each tab
  const tabAnimations = state.routes.map(() => ({
    scale: useSharedValue(1),
    translateY: useSharedValue(0),
  }));

  // Active indicator animation
  const activeIndicator = useSharedValue(0);

  useEffect(() => {
    // Update active indicator position
    const targetPosition = state.index / (state.routes.length - 1);
    activeIndicator.value = withSpring(targetPosition, STUDIO_THEME.animations.transition);

    // Update tab animations
    tabAnimations.forEach((animation, index) => {
      const isActive = index === state.index;
      
      animation.scale.value = withSpring(
        isActive ? 1.1 : 1,
        STUDIO_THEME.animations.interaction
      );
      
      animation.translateY.value = withSpring(
        isActive ? -2 : 0,
        STUDIO_THEME.animations.interaction
      );
    });
  }, [state.index]);

  // Active indicator style
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
        transform: [
          { scale: animation.scale.value },
          { translateY: animation.translateY.value },
        ],
      };
    });

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
      <TouchableOpacity
        key={route.key}
        style={styles.tab}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.tabContent, tabStyle]}>
          <Ionicons
            name={isActive ? config.activeIcon : config.icon}
            size={24}
            color={
              isActive
                ? STUDIO_THEME.colors.accent.jade
                : STUDIO_THEME.colors.text.tertiary
            }
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: isActive
                  ? STUDIO_THEME.colors.accent.jade
                  : STUDIO_THEME.colors.text.tertiary,
                fontWeight: isActive ? '600' : '400',
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
      {/* Background */}
      <View style={styles.background} />
      
      {/* Active Indicator */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]}>
        <LinearGradient
          colors={[
            STUDIO_THEME.colors.accent.jade,
            STUDIO_THEME.colors.accent.gold,
          ]}
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
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: STUDIO_THEME.colors.foundation.elevated,
    borderTopWidth: 1,
    borderTopColor: STUDIO_THEME.colors.foundation.tertiary,
    ...STUDIO_THEME.shadows.soft,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: STUDIO_THEME.spacing.md,
    paddingBottom: STUDIO_THEME.spacing.sm,
    paddingHorizontal: STUDIO_THEME.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: STUDIO_THEME.spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...STUDIO_THEME.typography.scale.caption,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default StudioTabBar;