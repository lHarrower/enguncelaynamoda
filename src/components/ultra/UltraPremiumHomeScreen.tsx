import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Ultra-curated content for luxury fashion experience
const heroContent = {
  title: 'AYNAMODA',
  subtitle: 'Curated Fashion Intelligence',
  description: 'Where style meets sophistication',
  image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200&fit=crop&q=80',
};

const featuredCategories = [
  {
    id: '1',
    title: 'New Arrivals',
    subtitle: 'Fresh perspectives',
    count: '24 pieces',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Essentials',
    subtitle: 'Timeless classics',
    count: '18 pieces',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=400&h=600&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Statement',
    subtitle: 'Bold expressions',
    count: '12 pieces',
    image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=400&h=600&fit=crop&q=80',
  },
];

const quickActions = [
  { id: '1', title: 'Wardrobe', icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap },
  { id: '2', title: 'Mirror', icon: 'glasses-outline' as keyof typeof Ionicons.glyphMap },
  { id: '3', title: 'Discover', icon: 'sparkles-outline' as keyof typeof Ionicons.glyphMap },
  { id: '4', title: 'Profile', icon: 'person-outline' as keyof typeof Ionicons.glyphMap },
];

interface UltraPremiumHomeScreenProps {
  onNavigateToWardrobe?: () => void;
  onNavigateToDiscover?: () => void;
  onNavigateToMirror?: () => void;
  onNavigateToProfile?: () => void;
}

const UltraPremiumHomeScreen: React.FC<UltraPremiumHomeScreenProps> = ({
  onNavigateToWardrobe,
  onNavigateToDiscover,
  onNavigateToMirror,
  onNavigateToProfile,
}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      'clamp'
    );

    return {
      opacity,
    };
  });

  const renderMinimalHeader = () => (
    <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>AYNAMODA</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={20} color={ULTRA_PREMIUM_THEME.semantic.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={20} color={ULTRA_PREMIUM_THEME.semantic.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{heroContent.title}</Text>
        <Text style={styles.heroSubtitle}>{heroContent.subtitle}</Text>
        <Text style={styles.heroDescription}>{heroContent.description}</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionItem}
            onPress={() => {
              switch (action.title) {
                case 'Wardrobe':
                  onNavigateToWardrobe?.();
                  break;
                case 'Mirror':
                  onNavigateToMirror?.();
                  break;
                case 'Discover':
                  onNavigateToDiscover?.();
                  break;
                case 'Profile':
                  onNavigateToProfile?.();
                  break;
              }
            }}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons 
                name={action.icon} 
                size={24} 
                color={ULTRA_PREMIUM_THEME.semantic.text.primary} 
              />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFeaturedCategories = () => (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Collections</Text>
        <TouchableOpacity>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContainer}
        snapToInterval={width * 0.7 + ULTRA_PREMIUM_THEME.spacing.md}
        decelerationRate="fast"
      >
        {featuredCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              { marginLeft: index === 0 ? ULTRA_PREMIUM_THEME.spacing.lg : 0 }
            ]}
          >
            <Image
              source={{ uri: category.image }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStyleInsights = () => (
    <View style={styles.insightsSection}>
      <Text style={styles.sectionTitle}>Your Style Profile</Text>
      <View style={styles.insightsGrid}>
        <View style={styles.insightCard}>
          <Text style={styles.insightValue}>94%</Text>
          <Text style={styles.insightLabel}>Style Confidence</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightValue}>127</Text>
          <Text style={styles.insightLabel}>Wardrobe Items</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightValue}>8.7</Text>
          <Text style={styles.insightLabel}>Style Score</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {renderMinimalHeader()}
      
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + ULTRA_PREMIUM_THEME.spacing.massive }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderHeroSection()}
        {renderQuickActions()}
        {renderStyleInsights()}
        {renderFeaturedCategories()}
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: ULTRA_PREMIUM_THEME.semantic.border.tertiary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: 60,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.md,
  },
  headerTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h3,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    fontWeight: '300',
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: ULTRA_PREMIUM_THEME.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: ULTRA_PREMIUM_THEME.radius.round,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  heroSection: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: 100,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.xxxl,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  heroTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.hero,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    textAlign: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.md,
  },
  heroSubtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  heroDescription: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  quickActionsSection: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xxxl,
  },
  sectionTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h3,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
    fontWeight: '400',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  sectionAction: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.sm,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  quickActionTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xxxl,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: ULTRA_PREMIUM_THEME.spacing.md,
  },
  insightCard: {
    flex: 1,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    padding: ULTRA_PREMIUM_THEME.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  insightValue: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h2,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    fontWeight: '300',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
  },
  insightLabel: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xxxl,
  },
  categoriesScrollContainer: {
    paddingRight: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  categoryCard: {
    width: width * 0.7,
    marginRight: ULTRA_PREMIUM_THEME.spacing.md,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.primary,
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  categoryImage: {
    width: '100%',
    height: 200,
  },
  categoryContent: {
    padding: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  categoryTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h3,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
    fontWeight: '400',
  },
  categorySubtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body2,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  categoryCount: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default UltraPremiumHomeScreen;