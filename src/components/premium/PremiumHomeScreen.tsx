import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PREMIUM_THEME } from '@/constants/PremiumThemeSystem';
import PremiumButton from './PremiumButton';
import PremiumCard from './PremiumCard';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Sample data for premium showcase
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

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 300],
      [0, -100],
      'clamp'
    );

    const scale = interpolate(
      scrollY.value,
      [0, 300],
      [1, 1.1],
      'clamp'
    );

    return {
      transform: [
        { translateY },
        { scale },
      ],
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
      <Image
        source={{ uri: heroContent.image }}
        style={styles.heroImage}
        resizeMode="cover"
      />
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
                marginLeft: index === 1 ? PREMIUM_THEME.spacing.sm : 0,
                marginRight: index === 1 ? PREMIUM_THEME.spacing.sm : 0,
              }
            ]}
          >
            <View style={styles.insightHeader}>
              <Ionicons
                name={insight.icon}
                size={24}
                color={PREMIUM_THEME.colors.champagne[500]}
              />
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
        <PremiumButton
          title="View All"
          onPress={() => {}}
          variant="ghost"
          size="small"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionsScrollContainer}
        snapToInterval={width * 0.8 + PREMIUM_THEME.spacing.lg}
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
              { marginLeft: index === 0 ? PREMIUM_THEME.spacing.xl : 0 }
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
          <Ionicons
            name="shirt-outline"
            size={32}
            color={PREMIUM_THEME.semantic.text.primary}
          />
          <Text style={styles.quickActionTitle}>My Wardrobe</Text>
          <Text style={styles.quickActionSubtitle}>Organize & discover</Text>
        </PremiumCard>

        <PremiumCard
          variant="glass"
          interactive
          onPress={() => {}}
          style={styles.quickActionCard}
        >
          <Ionicons
            name="camera-outline"
            size={32}
            color={PREMIUM_THEME.semantic.text.primary}
          />
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
          { paddingBottom: insets.bottom + PREMIUM_THEME.spacing.xxxl }
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
  container: {
    flex: 1,
    backgroundColor: PREMIUM_THEME.semantic.background.primary,
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
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: PREMIUM_THEME.spacing.md,
  },
  floatingHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PREMIUM_THEME.spacing.xl,
  },
  floatingHeaderTitle: {
    ...PREMIUM_THEME.typography.scale.headline3,
    color: PREMIUM_THEME.semantic.text.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  floatingHeaderActions: {
    flexDirection: 'row',
    gap: PREMIUM_THEME.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  heroSection: {
    height: height * 0.7,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    padding: PREMIUM_THEME.spacing.xl,
    paddingBottom: PREMIUM_THEME.spacing.xxxl,
  },
  heroTitle: {
    ...PREMIUM_THEME.typography.scale.hero,
    color: PREMIUM_THEME.semantic.text.inverse,
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  heroSubtitle: {
    ...PREMIUM_THEME.typography.scale.poetry,
    color: PREMIUM_THEME.semantic.text.inverse,
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  heroDescription: {
    ...PREMIUM_THEME.typography.scale.body1,
    color: PREMIUM_THEME.semantic.text.inverse,
    marginBottom: PREMIUM_THEME.spacing.xl,
    opacity: 0.9,
  },
  heroActions: {
    gap: PREMIUM_THEME.spacing.md,
  },
  secondaryHeroButton: {
    marginTop: PREMIUM_THEME.spacing.sm,
  },
  insightsSection: {
    padding: PREMIUM_THEME.spacing.xl,
    paddingTop: PREMIUM_THEME.spacing.xxxl,
  },
  sectionTitle: {
    ...PREMIUM_THEME.typography.scale.headline2,
    color: PREMIUM_THEME.semantic.text.primary,
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  sectionSubtitle: {
    ...PREMIUM_THEME.typography.scale.whisper,
    color: PREMIUM_THEME.semantic.text.secondary,
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: PREMIUM_THEME.spacing.xl,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: PREMIUM_THEME.spacing.sm,
  },
  insightCard: {
    flex: 1,
    minHeight: 140,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PREMIUM_THEME.spacing.md,
  },
  insightTrend: {
    ...PREMIUM_THEME.typography.scale.caption,
    color: PREMIUM_THEME.semantic.status.success,
    fontWeight: '600',
  },
  insightValue: {
    ...PREMIUM_THEME.typography.scale.display,
    color: PREMIUM_THEME.semantic.text.primary,
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  insightTitle: {
    ...PREMIUM_THEME.typography.scale.body2,
    color: PREMIUM_THEME.semantic.text.primary,
    fontWeight: '600',
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  insightDescription: {
    ...PREMIUM_THEME.typography.scale.body3,
    color: PREMIUM_THEME.semantic.text.secondary,
  },
  collectionsSection: {
    paddingTop: PREMIUM_THEME.spacing.xl,
    paddingHorizontal: PREMIUM_THEME.spacing.xl,
  },
  collectionsScrollContainer: {
    paddingRight: PREMIUM_THEME.spacing.xl,
  },
  collectionCard: {
    width: width * 0.8,
    height: 300,
    marginRight: PREMIUM_THEME.spacing.lg,
    overflow: 'hidden',
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  collectionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: PREMIUM_THEME.spacing.xl,
  },
  collectionTitle: {
    ...PREMIUM_THEME.typography.scale.headline3,
    color: PREMIUM_THEME.semantic.text.inverse,
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  collectionSubtitle: {
    ...PREMIUM_THEME.typography.scale.body2,
    color: PREMIUM_THEME.semantic.text.inverse,
    opacity: 0.9,
    marginBottom: PREMIUM_THEME.spacing.sm,
  },
  collectionItems: {
    ...PREMIUM_THEME.typography.scale.caption,
    color: PREMIUM_THEME.colors.champagne[300],
  },
  quickActionsSection: {
    padding: PREMIUM_THEME.spacing.xl,
    paddingTop: PREMIUM_THEME.spacing.xxxl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: PREMIUM_THEME.spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: PREMIUM_THEME.spacing.xl,
  },
  quickActionTitle: {
    ...PREMIUM_THEME.typography.scale.body1,
    color: PREMIUM_THEME.semantic.text.primary,
    fontWeight: '600',
    marginTop: PREMIUM_THEME.spacing.md,
    marginBottom: PREMIUM_THEME.spacing.xs,
  },
  quickActionSubtitle: {
    ...PREMIUM_THEME.typography.scale.body3,
    color: PREMIUM_THEME.semantic.text.secondary,
    textAlign: 'center',
  },
});

export default PremiumHomeScreen;