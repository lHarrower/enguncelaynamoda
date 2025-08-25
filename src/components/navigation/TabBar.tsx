/**
 * Modern Tab Bar Component
 * Sektör standartlarında premium tab navigation sistemi
 * Glass morphism ve modern animasyonlar ile
 */
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

export interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  style?: ViewStyle;
  variant?: 'default' | 'floating' | 'glass';
  showLabels?: boolean;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
  variant = 'default',
  showLabels = true,
}) => {
  const insets = useSafeAreaInsets();
  const indicatorPosition = useSharedValue(0);
  const tabWidth = 100 / tabs.length;

  // Aktif tab'ın pozisyonunu hesapla
  const activeTabIndex = tabs.findIndex((tab) => tab.key === activeTab);

  // Indicator animasyonu
  useEffect(() => {
    indicatorPosition.value = withSpring(activeTabIndex * tabWidth, {
      damping: 20,
      stiffness: 300,
    });
  }, [activeTabIndex, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${indicatorPosition.value}%` }],
  }));

  const handleTabPress = (tabKey: string) => {
    if (tabKey !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabPress(tabKey);
    }
  };

  const renderTabContent = (tab: TabItem, isActive: boolean) => {
    const iconName = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

    return (
      <View style={styles.tabContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={iconName}
            size={24}
            color={isActive ? DesignSystem.colors.sage[600] : DesignSystem.colors.neutral[400]}
          />
          {tab.badge && tab.badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge.toString()}</Text>
            </View>
          )}
        </View>
        {showLabels && (
          <Text style={[styles.tabTitle, isActive && styles.activeTabTitle]}>{tab.title}</Text>
        )}
      </View>
    );
  };

  if (variant === 'floating') {
    return (
      <View style={[styles.floatingContainer, { paddingBottom: insets.bottom + 16 }]}>
        <BlurView intensity={80} style={styles.floatingTabBar}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.floatingGradient}
          >
            <View style={styles.floatingTabsContainer}>
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.floatingTab, isActive && styles.activeFloatingTab]}
                    onPress={() => handleTabPress(tab.key)}
                    activeOpacity={0.7}
                  >
                    {renderTabContent(tab, isActive)}
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    );
  }

  if (variant === 'glass') {
    return (
      <SafeAreaView style={[styles.glassContainer, style]}>
        <BlurView intensity={100} style={styles.glassTabBar}>
          <View style={styles.glassContent}>
            <Animated.View style={[styles.glassIndicator, indicatorStyle]} />
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.glassTab}
                    onPress={() => handleTabPress(tab.key)}
                    activeOpacity={0.8}
                  >
                    {renderTabContent(tab, isActive)}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BlurView>
      </SafeAreaView>
    );
  }

  // Default variant
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.modernTabBar}>
        <Animated.View style={[styles.modernIndicator, indicatorStyle]} />
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.modernTab, isActive && styles.activeModernTab]}
                onPress={() => handleTabPress(tab.key)}
                activeOpacity={0.8}
              >
                {renderTabContent(tab, isActive)}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Default variant styles
  container: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderTopColor: DesignSystem.colors.border.primary,
    borderTopWidth: 1,
    ...DesignSystem.elevation.soft,
  },
  modernTabBar: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    position: 'relative',
  },
  modernIndicator: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.borderRadius.pill,
    height: 3,
    position: 'absolute',
    top: 0,
    width: `${100 / 4}%`, // Assuming 4 tabs, adjust dynamically
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: DesignSystem.spacing.sm,
  },
  modernTab: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.sm,
  },
  activeModernTab: {
    backgroundColor: DesignSystem.colors.sage[50],
  },

  // Floating variant styles
  floatingContainer: {
    alignItems: 'center',
    bottom: 0,
    left: DesignSystem.spacing.lg,
    position: 'absolute',
    right: DesignSystem.spacing.lg,
  },
  floatingTabBar: {
    borderRadius: DesignSystem.borderRadius.xxxl,
    overflow: 'hidden',
    ...DesignSystem.elevation.floating,
  },
  floatingGradient: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  floatingTabsContainer: {
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
  },

  // Glass variant styles
  glassContainer: {
    backgroundColor: 'transparent',
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
    width: `${100 / 4}%`,
  },
  glassTab: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.sm,
  },

  // Common styles
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.xs,
    position: 'relative',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.error[500],
    borderColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.round,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: DesignSystem.spacing.xs,
    position: 'absolute',
    right: -8,
    top: -8,
  },
  badgeText: {
    ...DesignSystem.typography.caption.small,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '700',
  },
  tabTitle: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.text.tertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabTitle: {
    color: DesignSystem.colors.sage[600],
    fontWeight: '600',
  },
});

export default TabBar;
