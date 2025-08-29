/**
 * Floating Tab Bar
 *
 * A premium floating navigation bar inspired by Poppi, Spotify, and iOS design.
 * Features pill-shaped frosted glass design with soft gold accents and Turkish labels.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ORIGINAL_COLORS,
  ORIGINAL_SPACING,
  ORIGINAL_TYPOGRAPHY,
} from '@/components/auth/originalLoginStyles';

const { width: screenWidth } = Dimensions.get('window');

export interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

export interface FloatingTabBarProps {
  /** Array of tab items */
  tabs: TabItem[];

  /** Currently active tab ID */
  activeTab: string;

  /** Callback when tab is pressed */
  onTabPress: (tabId: string) => void;

  /** Whether to show labels below icons */
  showLabels?: boolean;

  /** Whether to hide on scroll */
  hideOnScroll?: boolean;

  /** Scroll offset for hide animation */
  scrollY?: Animated.Value;

  /** Custom style for the container */
  style?: ViewStyle;
}

// Default tabs with Turkish labels
export const DEFAULT_TABS: TabItem[] = [
  {
    id: 'home',
    label: 'Anasayfa',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    id: 'search',
    label: 'Ara',
    icon: 'search-outline',
    activeIcon: 'search',
  },
  {
    id: 'favorites',
    label: 'Favoriler',
    icon: 'heart-outline',
    activeIcon: 'heart',
    badge: 3,
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabPress,
  showLabels = false,
  hideOnScroll = false,
  scrollY,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const [tabAnimations] = useState(() =>
    tabs.reduce(
      (acc, tab) => {
        acc[tab.id] = {
          scale: new Animated.Value(1),
          glow: new Animated.Value(activeTab === tab.id ? 1 : 0),
        };
        return acc;
      },
      {} as Record<string, { scale: Animated.Value; glow: Animated.Value }>,
    ),
  );

  // Hide/show animation based on scroll
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hideOnScroll && scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        const shouldHide = value > 100; // Hide after scrolling 100px

        Animated.timing(translateY, {
          toValue: shouldHide ? 100 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });

      return () => scrollY.removeListener(listener);
    }
  }, [hideOnScroll, scrollY, translateY]);

  // Update glow animations when active tab changes
  useEffect(() => {
    tabs.forEach((tab) => {
      const isActive = activeTab === tab.id;

      const anim = tabAnimations[tab.id];
      if (!anim) {
        return;
      }
      Animated.timing(anim.glow, {
        toValue: isActive ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [activeTab, tabs, tabAnimations]);

  const handleTabPress = (tab: TabItem) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale animation
    const anim = tabAnimations[tab.id];
    if (!anim) {
      return;
    }
    const scaleAnim = anim.scale;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onTabPress(tab.id);
  };

  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.id;
    const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
    const anim = tabAnimations[tab.id];
    if (!anim) {
      return null;
    }
    const scaleAnim = anim.scale;
    const glowAnim = anim.glow;

    // Interpolate glow color
    const glowColor = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', '#FFD700'], // Soft gold
    });

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabButton}
        onPress={() => handleTabPress(tab)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glow Effect */}
          <Animated.View
            style={[
              styles.tabGlow,
              {
                backgroundColor: glowColor,
                opacity: glowAnim,
              },
            ]}
          />

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={iconName}
              size={24}
              color={isActive ? '#FFD700' : ORIGINAL_COLORS.secondaryText}
            />

            {/* Badge */}
            {tab.badge && tab.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? '99+' : tab.badge.toString()}
                </Text>
              </View>
            )}
          </View>

          {/* Label */}
          {showLabels && (
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? '#FFD700' : ORIGINAL_COLORS.secondaryText,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 16,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {/* Background Blur */}
      <BlurView intensity={80} style={styles.blurContainer}>
        {/* Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.9)',
            'rgba(255, 255, 255, 0.7)',
            'rgba(255, 255, 255, 0.9)',
          ]}
          style={styles.gradientOverlay}
        >
          {/* Tab Container */}
          <View style={styles.tabContainer}>{tabs.map(renderTab)}</View>
        </LinearGradient>
      </BlurView>

      {/* Shadow */}
      <View style={styles.shadow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: '#FF4444',
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    position: 'absolute',
    right: -8,
    top: -8,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },

  container: {
    left: ORIGINAL_SPACING.containerHorizontal,
    position: 'absolute',
    right: ORIGINAL_SPACING.containerHorizontal,
    zIndex: 1000,
  },

  gradientOverlay: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 28,
    borderWidth: 1,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  shadow: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    bottom: 0,
    elevation: 8,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: ORIGINAL_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    top: 0,
    zIndex: -1,
  },

  tabButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  tabContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },

  tabGlow: {
    borderRadius: 20,
    bottom: 0,
    left: 0,
    opacity: 0.3,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  tabLabel: {
    fontFamily: ORIGINAL_TYPOGRAPHY.secondary.fontFamily,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default FloatingTabBar;
