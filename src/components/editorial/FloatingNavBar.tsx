import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface FloatingNavBarProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'discover', label: 'Discover', icon: 'compass-outline' },
  { id: 'wardrobe', label: 'Wardrobe', icon: 'shirt-outline' },
  { id: 'profile', label: 'Profile', icon: 'person-outline' },
];

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ activeTab, onTabPress }) => {
  const indicatorPosition = useSharedValue(0);
  const navContentWidth = screenWidth * 0.8 - 32; // Account for padding
  const itemWidth = navContentWidth / navItems.length;

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => item.id === activeTab);
    indicatorPosition.value = withSpring(activeIndex * itemWidth + itemWidth / 2 - 20, {
      damping: 20,
      stiffness: 300,
    });
  }, [activeTab, itemWidth, indicatorPosition]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.blurContainer}>
        <View style={styles.navContent}>
          {/* Animated indicator */}
          <Animated.View style={[styles.indicator, indicatorStyle]} />

          {navItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => onTabPress(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={
                  activeTab === item.id
                    ? DesignSystem.colors.sage[600]
                    : DesignSystem.colors.text.tertiary
                }
              />
              <Text style={[styles.navLabel, activeTab === item.id && styles.activeNavLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeNavItem: {
    backgroundColor: DesignSystem.colors.sage[50],
  },
  activeNavLabel: {
    color: DesignSystem.colors.sage[600],
    fontFamily: 'Inter_400Regular',
  },
  blurContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: DesignSystem.borderRadius.full,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  container: {
    alignItems: 'center',
    bottom: 34,
    left: 20,
    position: 'absolute',
    right: 20,
    zIndex: 1000,
  },
  indicator: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.borderRadius.full,
    bottom: 4,
    height: 3,
    position: 'absolute',
    width: 40,
  },
  navContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: screenWidth * 0.8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    justifyContent: 'center',
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    marginTop: 2,
  },
});
