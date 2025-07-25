import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface UltraPremiumTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs: TabItem[] = [
  {
    key: 'index',
    title: 'Home',
    icon: 'home-outline',
  },
  {
    key: 'wardrobe',
    title: 'Wardrobe',
    icon: 'shirt-outline',
  },
  {
    key: 'ayna-mirror',
    title: 'Mirror',
    icon: 'glasses-outline',
  },
  {
    key: 'discover',
    title: 'Discover',
    icon: 'sparkles-outline',
  },
  {
    key: 'profile',
    title: 'Profile',
    icon: 'person-outline',
  },
];

const UltraPremiumTabBar: React.FC<UltraPremiumTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;
  
  // Animation values for each tab
  const tabAnimations = tabs.map(() => ({
    scale: useSharedValue(1),
    opacity: useSharedValue(0.6),
  }));

  React.useEffect(() => {
    // Update tab animations
    tabAnimations.forEach((anim, index) => {
      const isActive = index === activeIndex;
      anim.scale.value = withTiming(isActive ? 1.05 : 1, { duration: 200 });
      anim.opacity.value = withTiming(isActive ? 1 : 0.6, { duration: 200 });
    });
  }, [activeIndex]);

  const renderTab = (tab: TabItem, index: number) => {
    const isActive = index === activeIndex;
    const route = state.routes[index];
    const { options } = descriptors[route.key];

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: tabAnimations[index].scale.value }],
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
        activeOpacity={0.8}
      >
        <View style={[
          styles.tabContent,
          isActive && styles.tabContentActive
        ]}>
          <Ionicons
            name={tab.icon}
            size={20}
            color={isActive ? ULTRA_PREMIUM_THEME.semantic.text.primary : ULTRA_PREMIUM_THEME.semantic.text.tertiary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: isActive ? ULTRA_PREMIUM_THEME.semantic.text.primary : ULTRA_PREMIUM_THEME.semantic.text.tertiary,
              },
            ]}
          >
            {tab.title}
          </Text>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => renderTab(tab, index))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.primary,
    borderTopWidth: 1,
    borderTopColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
    paddingTop: ULTRA_PREMIUM_THEME.spacing.md,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ULTRA_PREMIUM_THEME.spacing.xs,
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.sm,
    borderRadius: ULTRA_PREMIUM_THEME.radius.sm,
    minWidth: 60,
  },
  tabContentActive: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  tabLabel: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    marginTop: ULTRA_PREMIUM_THEME.spacing.xs,
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default UltraPremiumTabBar;