import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

interface PremiumTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs: TabItem[] = [
  {
    key: 'index',
    title: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    key: 'wardrobe',
    title: 'Wardrobe',
    icon: 'shirt-outline',
    iconFocused: 'shirt',
  },
  {
    key: 'ayna-mirror',
    title: 'Mirror',
    icon: 'glasses-outline',
    iconFocused: 'glasses',
  },
  {
    key: 'discover',
    title: 'Discover',
    icon: 'sparkles-outline',
    iconFocused: 'sparkles',
  },
  {
    key: 'profile',
    title: 'Profile',
    icon: 'person-circle-outline',
    iconFocused: 'person-circle',
  },
];

const PremiumTabBar: React.FC<PremiumTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;
  
  // Animation values for each tab
  const tabAnimations = tabs.map(() => ({
    scale: useSharedValue(1),
    opacity: useSharedValue(0.6),
    translateY: useSharedValue(0),
  }));

  // Floating indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorOpacity = useSharedValue(1);

  React.useEffect(() => {
    // Update indicator position
    const tabWidth = (width - DesignSystem.spacing.xl * 2) / tabs.length;
    indicatorPosition.value = withSpring(activeIndex * tabWidth, DesignSystem.animations.spring.gentle);

    // Update tab animations
    tabAnimations.forEach((anim, index) => {
      const isActive = index === activeIndex;
      anim.scale.value = withSpring(isActive ? 1.1 : 1, DesignSystem.animations.spring.confident);
      anim.opacity.value = withTiming(isActive ? 1 : 0.6, { duration: 200 });
      anim.translateY.value = withSpring(isActive ? -2 : 0, DesignSystem.animations.spring.gentle);
    });
  }, [activeIndex]);

  const renderTab = (tab: TabItem, index: number) => {
    const isActive = index === activeIndex;
    const route = state.routes[index];
    const { options } = descriptors[route.key];

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: tabAnimations[index].scale.value },
          { translateY: tabAnimations[index].translateY.value },
        ],
        opacity: tabAnimations[index].opacity.value,
      };
    });

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isActive && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <AnimatedTouchableOpacity
        key={tab.key}
        style={[styles.tab, animatedStyle]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <Ionicons
            name={isActive ? tab.iconFocused : tab.icon}
            size={24}
            color={isActive ? DesignSystem.colors.text.primary : DesignSystem.colors.text.tertiary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: isActive ? DesignSystem.colors.text.primary : DesignSystem.colors.text.tertiary,
                fontWeight: isActive ? '600' : '400',
              },
            ]}
          >
            {tab.title}
          </Text>
          {isActive && <View style={styles.activeIndicator} />}
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  const floatingIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (width - DesignSystem.spacing.xl * 2) / tabs.length;
    
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth,
      opacity: indicatorOpacity.value,
    };
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Floating Background */}
      <View style={styles.tabBarBackground}>
        <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255, 255, 255, 0.8)' }
        ]} />
      </View>

      {/* Floating Indicator */}
      <Animated.View style={[styles.floatingIndicator, floatingIndicatorStyle]} />

      {/* Tab Items */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => renderTab(tab, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: DesignSystem.spacing.lg,
    right: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  floatingIndicator: {
    position: 'absolute',
    top: DesignSystem.spacing.xs,
    height: 4,
    backgroundColor: DesignSystem.colors.gold[500],
    borderRadius: 2,
    ...DesignSystem.elevation.soft,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    ...DesignSystem.typography.scale.caption,
    marginTop: DesignSystem.spacing.xs,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -DesignSystem.spacing.md,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignSystem.colors.gold[500],
    ...DesignSystem.elevation.soft,
  },
});

export default PremiumTabBar;