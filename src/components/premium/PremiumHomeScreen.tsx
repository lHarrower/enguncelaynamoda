import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

import PremiumButton from './PremiumButton';
import PremiumCard from './PremiumCard';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Premium showcase content
const heroContent = {
  title: 'Your Style Sanctuary',
  subtitle: 'Where confidence meets artistry',
  description: 'Discover curated fashion that speaks to your soul',
  image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200&fit=crop',
};

const featuredCollections = [
  {
    id: '1',
    title: 'Autumn Elegance',
    subtitle: 'Sophisticated layers for the season',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop',
    items: 24,
  },
  {
    id: '2',
    title: 'Minimalist Luxe',
    subtitle: 'Clean lines, maximum impact',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=600&h=800&fit=crop',
    items: 18,
  },
  {
    id: '3',
    title: 'Evening Mystique',
    subtitle: 'Captivating pieces for special moments',
    image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=600&h=800&fit=crop',
    items: 12,
  },
];

const styleInsights = [
  {
    id: '1',
    title: 'Your Confidence Score',
    value: '94%',
    trend: '+12%',
    description: 'Based on your recent outfit choices',
    icon: 'trending-up' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: '2',
    title: 'Style Evolution',
    value: '8.7',
    trend: '+0.3',
    description: 'Your fashion journey this month',
    icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: '3',
    title: 'Wardrobe Harmony',
    value: '87%',
    trend: '+5%',
    description: 'How well your pieces work together',
    icon: 'heart' as keyof typeof Ionicons.glyphMap,
  },
];

interface PremiumHomeScreenProps {
  onNavigateToWardrobe?: () => void;
  onNavigateToDiscover?: () => void;
  onNavigateToMirror?: () => void;
}

const PremiumHomeScreen: React.FC<PremiumHomeScreenProps> = ({
  onNavigateToWardrobe,
  onNavigateToDiscover,
  onNavigateToMirror,
}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [activeCollection, setActiveCollection] = useState(0);

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

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 300], [0, -100], 'clamp');

    const scale = interpolate(scrollY.value, [0, 300], [1, 1.1], 'clamp');

    return {
      transform: [{ translateY }, { scale }] as any,
    };
  });

  const renderFloatingHeader = () => (
    <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
      <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.floatingHeaderContent}>
        <Text style={styles.floatingHeaderTitle}>AYNAMODA</Text>
        <View style={styles.floatingHeaderActions}>
          <PremiumButton
            title=""
            onPress={() => {}}
            variant="ghost"
            size="small"
            icon="search-outline"
            style={styles.headerButton}
          />
          <PremiumButton
            title=""
            onPress={() => {}}
            variant="ghost"
            size="small"
            icon="notifications-outline"
            style={styles.headerButton}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderHeroSection = () => (
    <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
      <Image source={{ uri: heroContent.image }} style={styles.heroImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.heroGradient}
      />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{heroContent.title}</Text>
        <Text style={styles.heroSubtitle}>{heroContent.subtitle}</Text>
        <Text style={styles.heroDescription}>{heroContent.description}</Text>
        <View style={styles.heroActions}>
          <PremiumButton
            title="Explore Your Style"
            onPress={onNavigateToDiscover || (() => {})}
            variant="luxury"
            size="large"
            icon="sparkles"
          />
          <PremiumButton
            title="Open Mirror"
            onPress={onNavigateToMirror || (() => {})}
            variant="glass"
            size="large"
            icon="glasses-outline"
            style={styles.secondaryHeroButton}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderStyleInsights = () => (
    <View style={styles.insightsSection}>
      <Text style={styles.sectionTitle}>Your Style Journey</Text>
      <Text style={styles.sectionSubtitle}>Insights that inspire confidence</Text>

      <View style={styles.insightsGrid}>
        {styleInsights.map((insight, index) => (
          <PremiumCard
            key={insight.id}
            variant="luxury"
            style={[
              styles.insightCard,
              {
                marginLeft: index === 1 ? DesignSystem.spacing.sm : 0,
                marginRight: index === 1 ? DesignSystem.spacing.sm : 0,
              },
            ]}
          >
            <View style={styles.insightHeader}>
              <Ionicons name={insight.icon} size={24} color={DesignSystem.colors.gold[500]} />
              <Text style={styles.insightTrend}>{insight.trend}</Text>
            </View>
            <Text style={styles.insightValue}>{insight.value}</Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </PremiumCard>
        ))}
      </View>
    </View>
  );

  const renderFeaturedCollections = () => (
    <View style={styles.collectionsSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Curated Collections</Text>
          <Text style={styles.sectionSubtitle}>Handpicked for your aesthetic</Text>
        </View>
        <PremiumButton title="View All" onPress={() => {}} variant="ghost" size="small" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionsScrollContainer}
        snapToInterval={width * 0.8 + DesignSystem.spacing.lg}
        decelerationRate="fast"
      >
        {featuredCollections.map((collection, index) => (
          <PremiumCard
            key={collection.id}
            variant="floating"
            interactive
            onPress={() => setActiveCollection(index)}
            style={[
              styles.collectionCard,
              { marginLeft: index === 0 ? DesignSystem.spacing.xl : 0 },
            ]}
          >
            <Image
              source={{ uri: collection.image }}
              style={styles.collectionImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.collectionGradient}
            />
            <View style={styles.collectionContent}>
              <Text style={styles.collectionTitle}>{collection.title}</Text>
              <Text style={styles.collectionSubtitle}>{collection.subtitle}</Text>
              <Text style={styles.collectionItems}>{collection.items} pieces</Text>
            </View>
          </PremiumCard>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <PremiumCard
          variant="glass"
          interactive
          onPress={onNavigateToWardrobe || (() => {})}
          style={styles.quickActionCard}
        >
          <Ionicons name="shirt-outline" size={32} color={DesignSystem.colors.text.primary} />
          <Text style={styles.quickActionTitle}>My Wardrobe</Text>
          <Text style={styles.quickActionSubtitle}>Organize & discover</Text>
        </PremiumCard>

        <PremiumCard variant="glass" interactive onPress={() => {}} style={styles.quickActionCard}>
          <Ionicons name="camera-outline" size={32} color={DesignSystem.colors.text.primary} />
          <Text style={styles.quickActionTitle}>Add Item</Text>
          <Text style={styles.quickActionSubtitle}>Capture new pieces</Text>
        </PremiumCard>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {renderFloatingHeader()}

      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DesignSystem.spacing.xxxl },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderHeroSection()}
        {renderStyleInsights()}
        {renderFeaturedCollections()}
        {renderQuickActions()}
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    height: 300,
    marginRight: DesignSystem.spacing.lg,
    overflow: 'hidden',
    width: width * 0.8,
  },
  collectionContent: {
    bottom: 0,
    left: 0,
    padding: DesignSystem.spacing.xl,
    position: 'absolute',
    right: 0,
  },
  collectionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  collectionItems: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.gold[300],
  },
  collectionSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    marginBottom: DesignSystem.spacing.sm,
    opacity: 0.9,
  },
  collectionTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.inverse,
    marginBottom: DesignSystem.spacing.xs,
  },
  collectionsScrollContainer: {
    paddingRight: DesignSystem.spacing.xl,
  },
  collectionsSection: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.xl,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  floatingHeader: {
    height: 100,
    justifyContent: 'flex-end',
    left: 0,
    paddingBottom: DesignSystem.spacing.md,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  floatingHeaderActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  floatingHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  floatingHeaderTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerButton: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  heroActions: {
    gap: DesignSystem.spacing.md,
  },
  heroContent: {
    padding: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xxxl,
  },
  heroDescription: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    marginBottom: DesignSystem.spacing.xl,
    opacity: 0.9,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  heroSection: {
    height: height * 0.7,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  heroSubtitle: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.inverse,
    marginBottom: DesignSystem.spacing.md,
  },
  heroTitle: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.inverse,
    marginBottom: DesignSystem.spacing.sm,
  },
  insightCard: {
    flex: 1,
    minHeight: 140,
  },
  insightDescription: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.md,
  },
  insightTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
  },
  insightTrend: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.success.main,
    fontWeight: '600',
  },
  insightValue: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  insightsSection: {
    padding: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.xxxl,
  },
  quickActionCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: DesignSystem.spacing.xl,
  },
  quickActionSubtitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  quickActionTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
    marginTop: DesignSystem.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.lg,
  },
  quickActionsSection: {
    padding: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.xxxl,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  secondaryHeroButton: {
    marginTop: DesignSystem.spacing.sm,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionSubtitle: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
});

export default PremiumHomeScreen;
