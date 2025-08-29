// Invisible Navigation - Minimalist, Contextual Navigation System
// Replaces generic tab bar with elegant, full-screen blurred overlay

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import type { ViewStyle } from 'react-native';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');

interface NavigationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface InvisibleNavigationProps {
  items: NavigationItem[];
  currentRoute?: string;
}

const InvisibleNavigation: React.FC<InvisibleNavigationProps> = ({ items, currentRoute }) => {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.95);
  const triggerRotation = useSharedValue(0);
  const triggerScale = useSharedValue(1);

  // Open navigation overlay
  const openNavigation = () => {
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    overlayOpacity.value = withTiming(1, { duration: 400 });
    overlayScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    triggerRotation.value = withTiming(45, { duration: 300 });
  };

  // Close navigation overlay
  const closeNavigation = () => {
    overlayOpacity.value = withTiming(0, { duration: 300 });
    overlayScale.value = withTiming(0.95, { duration: 300 });
    triggerRotation.value = withTiming(0, { duration: 300 });

    setTimeout(() => setIsOpen(false), 300);
  };

  // Handle navigation item press
  const handleItemPress = (item: NavigationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeNavigation();
    setTimeout(() => item.onPress(), 300);
  };

  // Trigger button press animation
  const handleTriggerPress = () => {
    triggerScale.value = withSpring(0.9, { damping: 15, stiffness: 400 }, () => {
      triggerScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    });

    if (isOpen) {
      closeNavigation();
    } else {
      openNavigation();
    }
  };

  // Animated styles
  const overlayStyle = useAnimatedStyle((): ViewStyle => {
    return {
      opacity: overlayOpacity.value,
      transform: [{ scale: overlayScale.value }],
    };
  });

  const triggerStyle = useAnimatedStyle((): ViewStyle => {
    return {
      transform: [{ rotate: `${triggerRotation.value}deg` }, { scale: triggerScale.value }],
    };
  });

  return (
    <>
      {/* Navigation Trigger - Floating in corner */}
      <View style={[styles.triggerContainer, { top: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={handleTriggerPress}
          activeOpacity={0.8}
          style={styles.trigger}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          accessibilityHint="Double tap to open the navigation overlay"
        >
          <Animated.View style={[styles.triggerContent, triggerStyle]}>
            <LinearGradient
              colors={[DesignSystem.colors.sage[400], DesignSystem.colors.sage[500]]}
              style={styles.triggerGradient}
            >
              <Ionicons name="add" size={20} color={DesignSystem.colors.background.primary} />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Full-Screen Navigation Overlay */}
      {isOpen && (
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <StatusBar barStyle="light-content" />

          {/* Blurred Background */}
          <BlurView intensity={80} style={styles.blurBackground}>
            <LinearGradient
              colors={[
                'rgba(11, 11, 13, 0.95)',
                'rgba(26, 26, 30, 0.90)',
                'rgba(11, 11, 13, 0.95)',
              ]}
              style={styles.overlayGradient}
            />
          </BlurView>

          {/* Navigation Content */}
          <View style={[styles.navigationContent, { paddingTop: insets.top + 80 }]}>
            {/* Header */}
            <View style={styles.navigationHeader}>
              <Text style={styles.navigationTitle}>Navigate</Text>
              <Text style={styles.navigationSubtitle}>Where would you like to go?</Text>
            </View>

            {/* Navigation Items */}
            <View style={styles.navigationItems}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navigationItem,
                    currentRoute === item.id && styles.activeNavigationItem,
                  ]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${item.title}`}
                  accessibilityHint={item.subtitle}
                  accessibilityState={{ selected: currentRoute === item.id }}
                >
                  <View style={styles.navigationItemContent}>
                    <View style={styles.navigationItemIcon}>
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={
                          currentRoute === item.id
                            ? DesignSystem.colors.text.accent
                            : DesignSystem.colors.text.primary
                        }
                      />
                    </View>
                    <View style={styles.navigationItemText}>
                      <Text
                        style={[
                          styles.navigationItemTitle,
                          currentRoute === item.id && styles.activeNavigationItemTitle,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.navigationItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  {currentRoute === item.id && (
                    <View style={styles.activeIndicator}>
                      <LinearGradient
                        colors={[DesignSystem.colors.sage[400], DesignSystem.colors.sage[500]]}
                        style={styles.activeIndicatorGradient}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Close Area */}
            <TouchableOpacity
              style={styles.closeArea}
              onPress={closeNavigation}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Close navigation menu"
              accessibilityHint="Double tap to close the navigation overlay"
            >
              <Text style={styles.closeHint}>Tap anywhere to close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Trigger Button
  triggerContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  trigger: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    width: 48,
  },
  triggerContent: {
    borderRadius: 24,
    flex: 1,
  },
  triggerGradient: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
  },

  // Overlay
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayGradient: {
    flex: 1,
  },

  // Navigation Content
  navigationContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  navigationHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  navigationTitle: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    fontSize: 36,
    marginBottom: 8,
  },
  navigationSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },

  // Navigation Items
  navigationItems: {
    flex: 1,
    gap: 16,
  },
  navigationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
  },
  activeNavigationItem: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  navigationItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  navigationItemIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 16,
    width: 48,
  },
  navigationItemText: {
    flex: 1,
  },
  navigationItemTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  activeNavigationItemTitle: {
    color: DesignSystem.colors.text.accent,
  },
  navigationItemSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontSize: 14,
  },
  activeIndicator: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  activeIndicatorGradient: {
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2,
    flex: 1,
  },

  // Close Area
  closeArea: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  closeHint: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    opacity: 0.6,
  },
});

export default InvisibleNavigation;
