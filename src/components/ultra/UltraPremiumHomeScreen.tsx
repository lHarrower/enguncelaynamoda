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
import { DesignSystem } from '@/theme/DesignSystem';
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
            <Ionicons name="search-outline" size={20} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={20} color={DesignSystem.colors.text.primary} />
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
                color={DesignSystem.colors.text.primary} 
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
        snapToInterval={width * 0.7 + DesignSystem.spacing.md}
        decelerationRate="fast"
      >
        {featuredCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              { marginLeft: index === 0 ? DesignSystem.spacing.lg : 0 }
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
          { paddingBottom: insets.bottom + DesignSystem.spacing.sanctuary }
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
    backgroundColor: DesignSystem.colors.background.primary,
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
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomWidth: 1,
  borderBottomColor: DesignSystem.colors.border.secondary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 60,
    paddingBottom: DesignSystem.spacing.md,
  },
  headerTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.round,
    backgroundColor: DesignSystem.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  heroSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 100,
    paddingBottom: DesignSystem.spacing.xxxl,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  heroTitle: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  heroSubtitle: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  heroDescription: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  quickActionsSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xxxl,
  },
  sectionTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.lg,
    fontWeight: '400',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionAction: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
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
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  quickActionTitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xxxl,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  insightCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  insightValue: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    marginBottom: DesignSystem.spacing.xs,
  },
  insightLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xxxl,
  },
  categoriesScrollContainer: {
    paddingRight: DesignSystem.spacing.lg,
  },
  categoryCard: {
    width: width * 0.7,
    marginRight: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  categoryImage: {
    width: '100%',
    height: 200,
  },
  categoryContent: {
    padding: DesignSystem.spacing.lg,
  },
  categoryTitle: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
    fontWeight: '400',
  },
  categorySubtitle: {
  ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.sm,
  },
  categoryCount: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default UltraPremiumHomeScreen;