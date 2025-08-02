/**
 * Floating Tab Bar
 * 
 * A premium floating navigation bar inspired by Poppi, Spotify, and iOS design.
 * Features pill-shaped frosted glass design with soft gold accents and Turkish labels.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
  ORIGINAL_BORDER_RADIUS,
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
  style?: any;
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
    tabs.reduce((acc, tab) => {
      acc[tab.id] = {
        scale: new Animated.Value(1),
        glow: new Animated.Value(activeTab === tab.id ? 1 : 0),
      };
      return acc;
    }, {} as Record<string, { scale: Animated.Value; glow: Animated.Value }>)
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
  }, [hideOnScroll, scrollY]);

  // Update glow animations when active tab changes
  useEffect(() => {
    tabs.forEach((tab) => {
      const isActive = activeTab === tab.id;
      
      Animated.timing(tabAnimations[tab.id].glow, {
        toValue: isActive ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [activeTab, tabs]);

  const handleTabPress = (tab: TabItem) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      const { impactAsync, ImpactFeedbackStyle } = require('expo-haptics');
      impactAsync(ImpactFeedbackStyle.Light);
    }

    // Scale animation
    const scaleAnim = tabAnimations[tab.id].scale;
    
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
    const scaleAnim = tabAnimations[tab.id].scale;
    const glowAnim = tabAnimations[tab.id].glow;

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
          <View style={styles.tabContainer}>
            {tabs.map(renderTab)}
          </View>
        </LinearGradient>
      </BlurView>

      {/* Shadow */}
      <View style={styles.shadow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: ORIGINAL_SPACING.containerHorizontal,
    right: ORIGINAL_SPACING.containerHorizontal,
    zIndex: 1000,
  },

  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },

  gradientOverlay: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 56,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  tabGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.3,
  },

  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: ORIGINAL_TYPOGRAPHY.secondary.fontFamily,
  },

  shadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: 'transparent',
    shadowColor: ORIGINAL_COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: -1,
  },
});

export default FloatingTabBar;