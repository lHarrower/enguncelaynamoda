/**
 * Premium Tab Bar Component
 * Sektör lideri seviyesinde premium tab navigation
 * Apple, Spotify ve modern design sistemlerinden ilham alınmıştır
 */
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedWrapper } from '@/components/common/AnimatedWrapper';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

export interface PremiumTabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
  color?: string;
}

export interface PremiumTabBarProps {
  tabs: PremiumTabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  variant?: 'floating' | 'glass' | 'minimal' | 'premium';
  showLabels?: boolean;
  hideOnScroll?: boolean;
  scrollY?: Animated.SharedValue<number>;
  style?: ViewStyle;
}

const PremiumTabBar: React.FC<PremiumTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  variant = 'premium',
  showLabels = true,
  hideOnScroll = false,
  scrollY,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const indicatorPosition = useSharedValue(0);
  const tabBarTranslateY = useSharedValue(0);
  const tabWidth = screenWidth / tabs.length;

  // Aktif tab index'ini hesapla
  const activeTabIndex = useMemo(() => {
    return tabs.findIndex((tab) => tab.id === activeTab);
  }, [tabs, activeTab]);

  // Dynamic styles that depend on tabWidth
  const dynamicStyles = useMemo(
    () => ({
      glassIndicator: {
        ...styles.glassIndicator,
        width: tabWidth,
      },
      minimalIndicator: {
        ...styles.minimalIndicator,
        width: tabWidth,
      },
      premiumIndicator: {
        ...styles.premiumIndicator,
        width: tabWidth,
      },
    }),
    [tabWidth],
  );

  // Indicator animasyonu
  useEffect(() => {
    indicatorPosition.value = withSpring(activeTabIndex * tabWidth, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });
  }, [activeTabIndex, tabWidth]);

  // Scroll'da gizleme animasyonu
  useEffect(() => {
    if (hideOnScroll && scrollY) {
      // React Native Reanimated v3'te runOnUI kullanılmalı
      // Bu özellik şimdilik devre dışı bırakılıyor
    }
  }, [hideOnScroll, scrollY]);

  // Animated styles
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const tabBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tabBarTranslateY.value }],
  }));

  const handleTabPress = (tabId: string) => {
    if (tabId !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onTabPress(tabId);
    }
  };

  const renderTabContent = (tab: PremiumTabItem, isActive: boolean) => {
    const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
    const iconColor = isActive
      ? tab.color || DesignSystem.colors.sage[600]
      : DesignSystem.colors.neutral[400];

    return (
      <View style={styles.tabContent}>
        <AnimatedWrapper
          style={[styles.iconContainer, isActive && styles.activeIconContainer] as any}
        >
          <Ionicons name={iconName} size={variant === 'minimal' ? 22 : 24} color={iconColor} />
          {tab.badge && tab.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge.toString()}</Text>
            </View>
          )}
        </AnimatedWrapper>
        {showLabels && (
          <Text style={[styles.tabLabel, isActive && styles.activeTabLabel, { color: iconColor }]}>
            {tab.label}
          </Text>
        )}
      </View>
    );
  };

  // Floating variant
  if (variant === 'floating') {
    return (
      <Animated.View style={[styles.floatingContainer, tabBarStyle, style]}>
        <BlurView intensity={95} style={styles.floatingTabBar}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.95)',
              'rgba(255, 255, 255, 0.85)',
              'rgba(250, 249, 246, 0.9)',
            ]}
            style={styles.floatingGradient}
          >
            <View style={styles.floatingTabsContainer}>
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.floatingTab, isActive && styles.activeFloatingTab]}
                    onPress={() => handleTabPress(tab.id)}
                    activeOpacity={0.7}
                  >
                    {renderTabContent(tab, isActive)}
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  }

  // Glass variant
  if (variant === 'glass') {
    return (
      <Animated.View style={[styles.glassContainer, tabBarStyle, style]}>
        <BlurView intensity={100} style={styles.glassTabBar}>
          <View style={styles.glassContent}>
            <Animated.View style={[dynamicStyles.glassIndicator, indicatorStyle]} />
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.glassTab}
                    onPress={() => handleTabPress(tab.id)}
                    activeOpacity={0.8}
                  >
                    {renderTabContent(tab, isActive)}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimalContainer, tabBarStyle, style]}>
        <View style={styles.minimalTabBar}>
          <Animated.View style={[dynamicStyles.minimalIndicator, indicatorStyle]} />
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.minimalTab}
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.8}
                >
                  {renderTabContent(tab, isActive)}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    );
  }

  // Premium variant (default)
  return (
    <Animated.View style={[styles.premiumContainer, tabBarStyle, style]}>
      <LinearGradient
        colors={[DesignSystem.colors.background.elevated, DesignSystem.colors.background.primary]}
        style={styles.premiumGradient}
      >
        <View style={styles.premiumTabBar}>
          <Animated.View style={[dynamicStyles.premiumIndicator, indicatorStyle]} />
          <View style={[styles.tabsContainer, { paddingBottom: insets.bottom }]}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.premiumTab, isActive && styles.activePremiumTab]}
                  onPress={() => handleTabPress(tab.id)}
                  activeOpacity={0.8}
                >
                  {renderTabContent(tab, isActive)}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Floating variant
  floatingContainer: {
    alignItems: 'center',
    bottom: 20,
    left: DesignSystem.spacing.lg,
    position: 'absolute',
    right: DesignSystem.spacing.lg,
    zIndex: 1000,
  },
  floatingTabBar: {
    borderRadius: DesignSystem.borderRadius.xxxl,
    overflow: 'hidden',
    ...DesignSystem.elevation.floating,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  floatingGradient: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  floatingTabsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  floatingTab: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    minWidth: 60,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  activeFloatingTab: {
    backgroundColor: 'rgba(92, 138, 92, 0.15)',
    transform: [{ scale: 1.05 }] as any,
  },

  // Glass variant
  glassContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  glassTabBar: {
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 1,
  },
  glassContent: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    position: 'relative',
  },
  glassIndicator: {
    backgroundColor: DesignSystem.colors.sage[400],
    borderRadius: DesignSystem.borderRadius.pill,
    height: 2,
    position: 'absolute',
    top: 0,
  },
  glassTab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
  },

  // Minimal variant
  minimalContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderTopColor: DesignSystem.colors.border.secondary,
    borderTopWidth: 1,
  },
  minimalTabBar: {
    paddingHorizontal: DesignSystem.spacing.lg,
    position: 'relative',
  },
  minimalIndicator: {
    backgroundColor: DesignSystem.colors.sage[500],
    height: 1,
    position: 'absolute',
    top: 0,
  },
  minimalTab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
  },

  // Premium variant
  premiumContainer: {
    ...DesignSystem.elevation.high,
  },
  premiumGradient: {
    borderTopLeftRadius: DesignSystem.borderRadius.xl,
    borderTopRightRadius: DesignSystem.borderRadius.xl,
  },
  premiumTabBar: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.md,
    position: 'relative',
  },
  premiumIndicator: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.borderRadius.pill,
    height: 4,
    position: 'absolute',
    top: 0,
    ...DesignSystem.elevation.soft,
  },
  premiumTab: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    flex: 1,
    marginHorizontal: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.md,
  },
  activePremiumTab: {
    backgroundColor: DesignSystem.colors.sage[50],
    transform: [{ scale: 1.02 }] as any,
  },

  // Common styles
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: DesignSystem.spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: DesignSystem.borderRadius.lg,
    marginBottom: DesignSystem.spacing.xs,
    padding: DesignSystem.spacing.xs,
    position: 'relative',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(92, 138, 92, 0.1)',
    transform: [{ scale: 1.1 }] as any,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.error[500],
    borderColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.round,
    borderWidth: 2,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -6,
    top: -6,
  },
  badgeText: {
    ...DesignSystem.typography.caption.small,
    color: DesignSystem.colors.text.inverse,
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabel: {
    ...DesignSystem.typography.caption.medium,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabLabel: {
    fontWeight: '600',
    transform: [{ scale: 1.05 }],
  },
});

export default PremiumTabBar;
