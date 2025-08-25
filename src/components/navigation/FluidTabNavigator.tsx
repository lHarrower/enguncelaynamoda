import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface TabConfig {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  component: React.ComponentType;
}

interface FluidTabNavigatorProps {
  tabs: TabConfig[];
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const FluidTabNavigator: React.FC<FluidTabNavigatorProps> = ({
  tabs,
  initialTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id);
  const [previousTab, setPreviousTab] = useState<string | null>(null);

  // Animation values for cross-fade transition
  const fadeProgress = useSharedValue(1);
  const tabIndicatorPosition = useSharedValue(0);

  // Find current and previous tab configurations
  const currentTabConfig = tabs.find((tab) => tab.id === activeTab);
  const previousTabConfig = tabs.find((tab) => tab.id === previousTab);

  // Animation styles for screen transitions
  const currentScreenStyle = useAnimatedStyle(() => ({
    opacity: fadeProgress.value,
    transform: [
      {
        translateY: interpolate(fadeProgress.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const previousScreenStyle = useAnimatedStyle(() => ({
    opacity: 1 - fadeProgress.value,
    transform: [
      {
        translateY: interpolate(fadeProgress.value, [0, 1], [0, -20]),
      },
    ],
  }));

  // Tab indicator animation
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value }],
  }));

  const triggerHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTabPress = (tabId: string) => {
    if (tabId === activeTab) {
      return;
    }

    // Trigger haptic feedback
    runOnJS(triggerHaptics)();

    // Set previous tab for transition
    if (activeTab) {
      setPreviousTab(activeTab);
    }

    // Start cross-fade animation
    fadeProgress.value = 0;
    fadeProgress.value = withTiming(
      1,
      {
        duration: 400,
      },
      () => {
        // Clean up previous tab after animation completes
        runOnJS(() => setPreviousTab(null))();
      },
    );

    // Animate tab indicator
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const indicatorPosition =
      (screenWidth / tabs.length) * tabIndex + screenWidth / tabs.length / 2 - 20;
    tabIndicatorPosition.value = withTiming(indicatorPosition, { duration: 300 });

    // Update active tab
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Initialize tab indicator position
  React.useEffect(() => {
    const tabIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const indicatorPosition =
      (screenWidth / tabs.length) * tabIndex + screenWidth / tabs.length / 2 - 20;
    tabIndicatorPosition.value = indicatorPosition;
  }, [activeTab, tabIndicatorPosition, tabs]);

  const renderTabButton = (tab: TabConfig, index: number) => {
    const isActive = tab.id === activeTab;

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabButton}
        onPress={() => handleTabPress(tab.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.tabContent, isActive && styles.activeTabContent]}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={24}
            color={isActive ? DesignSystem.colors.gold[500] : DesignSystem.colors.neutral[400]}
          />
          <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Screen Content with Cross-Fade Transition */}
      <View style={styles.screenContainer}>
        {/* Current Screen */}
        {currentTabConfig && (
          <Animated.View style={[styles.screen, currentScreenStyle]}>
            <currentTabConfig.component />
          </Animated.View>
        )}

        {/* Previous Screen (during transition) */}
        {previousTabConfig && (
          <Animated.View style={[styles.screen, styles.previousScreen, previousScreenStyle]}>
            <previousTabConfig.component />
          </Animated.View>
        )}
      </View>

      {/* Tab Bar with Fluid Indicator */}
      <View style={styles.tabBar}>
        {/* Animated Tab Indicator */}
        <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />

        {/* Tab Buttons */}
        <View style={styles.tabButtonsContainer}>
          {tabs.map((tab, index) => renderTabButton(tab, index))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeTabContent: {
    // Additional styling for active tab if needed
  },
  activeTabLabel: {
    color: DesignSystem.colors.sage[600],
    fontWeight: '600',
  },
  container: {
    backgroundColor: DesignSystem.colors.linen.base,
    flex: 1,
  },
  previousScreen: {
    zIndex: 0,
  },
  screen: {
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
  tabBar: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderTopColor: DesignSystem.colors.sage[200],
    borderTopWidth: 1,
    paddingBottom: DesignSystem.spacing.sm,
    position: 'relative',
    ...DesignSystem.elevation.soft,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    paddingTop: DesignSystem.spacing.md,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  tabIndicator: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.xs,
    height: 3,
    position: 'absolute',
    top: 0,
    width: 40,
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.neutral[400],
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
});
