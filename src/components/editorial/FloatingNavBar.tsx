import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
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

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const indicatorPosition = useSharedValue(0);
  const navContentWidth = screenWidth * 0.8 - 32; // Account for padding
  const itemWidth = navContentWidth / navItems.length;

  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.id === activeTab);
    indicatorPosition.value = withSpring(activeIndex * itemWidth + itemWidth / 2 - 20, {
      damping: 20,
      stiffness: 300,
    });
  }, [activeTab, itemWidth]);

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
              <Text
                style={[
                  styles.navLabel,
                  activeTab === item.id && styles.activeNavLabel,
                ]}
              >
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
  container: {
    position: 'absolute',
    bottom: 34,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: DesignSystem.borderRadius.full,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...DesignSystem.elevation.medium,
  },
  navContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: screenWidth * 0.8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DesignSystem.borderRadius.lg,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: DesignSystem.colors.sage[50],
  },
  navLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    marginTop: 2,
  },
  activeNavLabel: {
    color: DesignSystem.colors.sage[600],
    fontFamily: 'Inter_400Regular',
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: 40,
    height: 3,
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.borderRadius.full,
  },
});