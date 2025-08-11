import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DesignSystem } from '@/theme/DesignSystem';


const { width: screenWidth } = Dimensions.get('window');

interface TabConfig {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  component: React.ComponentType<any>;
}

interface FluidTabNavigatorProps {
  tabs: TabConfig[];
  initialTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const FluidTabNavigator: React.FC<FluidTabNavigatorProps> = ({
  tabs,
  initialTab,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id);
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  
  // Animation values for cross-fade transition
  const fadeProgress = useSharedValue(1);
  const tabIndicatorPosition = useSharedValue(0);
  
  // Find current and previous tab configurations
  const currentTabConfig = tabs.find(tab => tab.id === activeTab);
  const previousTabConfig = tabs.find(tab => tab.id === previousTab);
  
  // Animation styles for screen transitions
  const currentScreenStyle = useAnimatedStyle(() => ({
    opacity: fadeProgress.value,
    transform: [
      {
        translateY: interpolate(
          fadeProgress.value,
          [0, 1],
          [20, 0]
        )
      }
    ]
  }));
  
  const previousScreenStyle = useAnimatedStyle(() => ({
    opacity: 1 - fadeProgress.value,
    transform: [
      {
        translateY: interpolate(
          fadeProgress.value,
          [0, 1],
          [0, -20]
        )
      }
    ]
  }));

  // Tab indicator animation
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value }]
  }));

  const triggerHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTabPress = (tabId: string) => {
    if (tabId === activeTab) return;

    // Trigger haptic feedback
    runOnJS(triggerHaptics)();

    // Set previous tab for transition
    setPreviousTab(activeTab);

    // Start cross-fade animation
    fadeProgress.value = 0;
    fadeProgress.value = withTiming(1, { 
      duration: 400,
    }, () => {
      // Clean up previous tab after animation completes
      runOnJS(() => setPreviousTab(null))();
    });

    // Animate tab indicator
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const indicatorPosition = (screenWidth / tabs.length) * tabIndex + (screenWidth / tabs.length / 2) - 20;
    tabIndicatorPosition.value = withTiming(indicatorPosition, { duration: 300 });

    // Update active tab
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Initialize tab indicator position
  React.useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
    const indicatorPosition = (screenWidth / tabs.length) * tabIndex + (screenWidth / tabs.length / 2) - 20;
    tabIndicatorPosition.value = indicatorPosition;
  }, []);

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
          <Text style={[
            styles.tabLabel,
            isActive && styles.activeTabLabel
          ]}>
            {tab.title}
          </Text>
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
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.linen.base,
  },
  screenContainer: {
    flex: 1,
    position: 'relative',
  },
  screen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previousScreen: {
    zIndex: 0,
  },
  tabBar: {
    position: 'relative',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.sage[200],
    paddingBottom: DesignSystem.spacing.sm,
    ...DesignSystem.elevation.soft,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.radius.xs,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    paddingTop: DesignSystem.spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  activeTabContent: {
    // Additional styling for active tab if needed
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.neutral[400],
    marginTop: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: DesignSystem.colors.sage[600],
    fontWeight: '600',
  },
});