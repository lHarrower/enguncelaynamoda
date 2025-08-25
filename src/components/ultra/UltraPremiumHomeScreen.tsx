import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

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

const UltraPremiumHomeScreen: React.FC<UltraPremiumHomeScreenProps> = memo(
  ({ onNavigateToWardrobe, onNavigateToDiscover, onNavigateToMirror, onNavigateToProfile }) => {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
      },
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(scrollY.value, [0, 100], [0, 1], 'clamp');

      return {
        opacity,
      };
    });

    const renderMinimalHeader = useCallback(
      () => (
        <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AYNAMODA</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Search"
                accessibilityHint="Tap to search for items"
              >
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={DesignSystem.colors.text.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                accessibilityHint="Tap to view notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={DesignSystem.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      ),
      [headerAnimatedStyle],
    );

    const renderHeroSection = useCallback(
      () => (
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{heroContent.title}</Text>
            <Text style={styles.heroSubtitle}>{heroContent.subtitle}</Text>
            <Text style={styles.heroDescription}>{heroContent.description}</Text>
          </View>
        </View>
      ),
      [],
    );

    const handleQuickActionPress = useCallback(
      (title: string) => {
        switch (title) {
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
      },
      [onNavigateToWardrobe, onNavigateToMirror, onNavigateToDiscover, onNavigateToProfile],
    );

    const renderQuickActions = useCallback(
      () => (
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickActionPress(action.title)}
                accessibilityRole="button"
                accessibilityLabel={`${action.title} quick action`}
                accessibilityHint={`Navigate to ${action.title} section`}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon} size={24} color={DesignSystem.colors.text.primary} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
      [handleQuickActionPress],
    );

    const renderFeaturedCategories = useCallback(
      () => (
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View all featured collections"
              accessibilityHint="Tap to see all featured collections"
            >
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContainer}
            snapToInterval={width * 0.7 + DesignSystem.spacing.md}
            decelerationRate="fast"
            removeClippedSubviews={true}
            scrollEventThrottle={16}
          >
            {featuredCategories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { marginLeft: index === 0 ? DesignSystem.spacing.lg : 0 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${category.title} collection - ${category.count}`}
                accessibilityHint={`Tap to explore ${category.title} collection with ${category.count}`}
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
      ),
      [],
    );

    const renderStyleInsights = useCallback(
      () => (
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
      ),
      [],
    );

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {renderMinimalHeader()}

        <AnimatedScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + DesignSystem.spacing.sanctuary },
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
  },
);

const styles = StyleSheet.create({
  categoriesScrollContainer: {
    paddingRight: DesignSystem.spacing.lg,
  },
  categoriesSection: {
    marginBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  categoryCard: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.secondary,
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    marginRight: DesignSystem.spacing.md,
    overflow: 'hidden',
    width: width * 0.7,
  },
  categoryContent: {
    padding: DesignSystem.spacing.lg,
  },
  categoryCount: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  categoryImage: {
    height: 200,
    width: '100%',
  },
  categorySubtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.sm,
  },
  categoryTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '400',
    marginBottom: DesignSystem.spacing.xs,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  floatingHeader: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomColor: DesignSystem.colors.border.secondary,
    borderBottomWidth: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.secondary,
    borderRadius: DesignSystem.radius.round,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 60,
  },
  headerTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    letterSpacing: 2,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  heroDescription: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 100,
  },
  heroSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  heroTitle: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  insightCard: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.secondary,
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  insightLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
  insightValue: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    marginBottom: DesignSystem.spacing.xs,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  insightsSection: {
    marginBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  quickActionIcon: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.secondary,
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    height: 60,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.sm,
    width: 60,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionTitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionsSection: {
    marginBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionAction: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '400',
    marginBottom: DesignSystem.spacing.lg,
  },
});

export default UltraPremiumHomeScreen;
