import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';

interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface ElegantTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  style?: any;
  contentStyle?: any;
  showContent?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const ElegantTabs: React.FC<ElegantTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
  contentStyle,
  showContent = false,
}) => {
  // Single source of truth for scroll position
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const tabWidth = screenWidth;
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Synchronized spring configuration for perfect harmony
  const SPRING_CONFIG = {
    damping: 20,
    stiffness: 300,
    mass: 1,
  };

  // Scroll handler for 1-to-1 synchronization
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Handle tab press with synchronized animation
  const handleTabPress = (tabId: string, index: number) => {
    // Scroll content to new position
    scrollViewRef.current?.scrollTo({
      x: index * tabWidth,
      animated: true,
    });
    
    // Update active tab
    runOnJS(onTabPress)(tabId);
  };

  // Sync scroll position when activeTab changes externally
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: activeIndex * tabWidth,
        animated: true,
      });
    }
  }, [activeIndex, tabWidth]);

  // Indicator animation synchronized with scroll
  const indicatorStyle = useAnimatedStyle(() => {
    // Calculate indicator position based on scroll position
    const indicatorPosition = interpolate(
      scrollX.value,
      tabs.map((_, index) => index * tabWidth),
      tabs.map((_, index) => (index * screenWidth) / tabs.length),
      Extrapolate.CLAMP
    );

    // Dynamic width based on active tab label
    const progress = scrollX.value / tabWidth;
    const currentIndex = Math.round(progress);
    const activeTabLabel = tabs[currentIndex]?.label || '';
    const estimatedWidth = Math.min(activeTabLabel.length * 8 + 32, screenWidth / tabs.length - 16);

    return {
      transform: [
        {
          translateX: indicatorPosition + (screenWidth / tabs.length - estimatedWidth) / 2,
        },
      ],
      width: estimatedWidth,
    };
  });

  // Tab label animations
  const getTabLabelStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const progress = scrollX.value / tabWidth;
      const opacity = interpolate(
        Math.abs(progress - index),
        [0, 1],
        [1, 0.6],
        Extrapolate.CLAMP
      );

      const scale = interpolate(
        Math.abs(progress - index),
        [0, 1],
        [1, 0.95],
        Extrapolate.CLAMP
      );

      return {
        opacity,
        transform: [{ scale }],
      };
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Tab buttons */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, { width: screenWidth / tabs.length }]}
            onPress={() => handleTabPress(tab.id, index)}
            activeOpacity={0.8}
          >
            <Animated.Text
              style={[
                styles.tabLabel,
                getTabLabelStyle(index),
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Synchronized animated indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {/* Optional content area with synchronized scrolling */}
      {showContent && (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={[styles.contentContainer, contentStyle]}
        >
          {tabs.map((tab, index) => (
            <View key={tab.id} style={[styles.contentPage, { width: tabWidth }]}>
              {tab.content}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.md,
  },
  
  tab: {
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabLabel: {
  ...DesignSystem.typography.scale.h5,
    color: DesignSystem.colors.neutral.charcoal,
    opacity: 0.6,
    textAlign: 'center',
  },
  
  activeTabLabel: {
    color: DesignSystem.colors.neutral.slate,
    opacity: 1,
    fontWeight: '600' as const,
  },
  
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: 1,
    // Subtle glow effect
    shadowColor: DesignSystem.colors.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  
  contentContainer: {
    flex: 1,
    marginTop: DesignSystem.spacing.md,
  },
  
  contentPage: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.md,
  },
});

export default ElegantTabs;