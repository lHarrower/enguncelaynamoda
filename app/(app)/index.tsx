import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AynamodaColors } from '@/theme/AynamodaColors';
import { DesignSystem } from '@/theme/DesignSystem';
import { LazyComponents } from '@/utils/dynamicImports';
const { PremiumBrandShowcase, ProductCardShowcase } = LazyComponents;
import { startupPerformanceService } from '@/services/startupPerformanceService';
import {
  getResponsivePadding,
  isTablet,
  responsiveFontSize,
  responsiveSpacing,
} from '@/utils/responsiveUtils';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mark startup complete when home screen is fully loaded
  React.useEffect(() => {
    const timer = setTimeout(() => {
      startupPerformanceService.markStartupComplete();
    }, 50); // Minimal delay for faster startup

    return () => clearTimeout(timer);
  }, []);

  // Memoized product data for better performance
  const FEATURED_PRODUCTS = useMemo(
    () => [
      {
        id: 1,
        name: 'ARUOM',
        subtitle: 'Elegant Dress',
        price: '$89',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
        color: AynamodaColors.primary[400],
        category: 'POPULER',
      },
      {
        id: 2,
        name: 'FIRED',
        subtitle: 'Casual Coat',
        price: '$120',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop',
        color: AynamodaColors.neutral[700],
        category: 'POPULER',
      },
      {
        id: 3,
        name: 'AYNAMODA',
        subtitle: 'Premium Set',
        price: '$159',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
        color: AynamodaColors.secondary[400],
        category: 'POPULER',
      },
      {
        id: 4,
        name: 'MORS',
        subtitle: 'Stylish Outfit',
        price: '$95',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop',
        color: AynamodaColors.primary[600],
        category: 'POPULER',
      },
    ],
    [],
  );

  // Optimized product card renderer
  const renderProductCard = useCallback(
    (product: (typeof FEATURED_PRODUCTS)[0], index: number): React.ReactElement => {
      const cardRotation = index === 0 ? 0 : index === 1 ? -3 : index === 2 ? 2 : -1;
      const cardScale = 1 - index * 0.05;
      const cardTranslateY = index * 15;
      const cardOpacity = 1 - index * 0.1;

      return (
        <Animated.View
          key={product.id}
          entering={FadeInUp.delay(index * 150).springify()}
          style={[
            styles.productCard,
            {
              transform: [
                { rotate: `${cardRotation}deg` },
                { scale: cardScale },
                { translateY: cardTranslateY },
              ],
              opacity: cardOpacity,
              zIndex: FEATURED_PRODUCTS.length - index,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(app)/ayna-mirror')}
            style={styles.cardTouchable}
          >
            <BlurView intensity={20} style={styles.cardBlur}>
              <LinearGradient
                colors={[AynamodaColors.background.elevated, AynamodaColors.background.secondary]}
                style={styles.cardGradient}
              >
                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>

                {/* Product Image */}
                <View style={styles.imageContainer}>
                  <View style={[styles.imagePlaceholder, { backgroundColor: product.color }]}>
                    <Ionicons name="shirt-outline" size={40} color={AynamodaColors.text.inverse} />
                  </View>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSubtitle}>{product.subtitle}</Text>

                  {/* Price */}
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{product.price}</Text>
                    <TouchableOpacity style={styles.favoriteButton}>
                      <Ionicons name="heart-outline" size={16} color={AynamodaColors.text.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [router],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={DesignSystem.colors.gradientNeutral} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.menuButton}>
                <Ionicons name="menu" size={24} color={AynamodaColors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={24} color={AynamodaColors.text.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Central Diamond Logo */}
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.centralDiamondContainer}
          >
            <LinearGradient colors={AynamodaColors.gradients.primary} style={styles.centralDiamond}>
              <Ionicons name="diamond" size={40} color={AynamodaColors.text.inverse} />
            </LinearGradient>
            <Text style={styles.logoText}>AYNAMODA</Text>
          </Animated.View>

          {/* Stacked Product Cards */}
          <View style={styles.stackedCardsContainer}>
            {FEATURED_PRODUCTS.map((product, index) => renderProductCard(product, index))}
          </View>

          {/* Premium Brand Showcase */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.premiumSection}>
            <Text style={styles.sectionTitle}>Premium Koleksiyonlar</Text>
            <PremiumBrandShowcase />
          </Animated.View>

          {/* Product Showcase */}
          <Animated.View
            entering={FadeInUp.delay(400).springify()}
            style={styles.productShowcaseSection}
          >
            <ProductCardShowcase
              title="Öne Çıkan Ürünler"
              subtitle="En beğenilen parçalar"
              variant="standard"
              size="medium"
              layout="grid"
              numColumns={2}
              showFilters={false}
              showSort={false}
            />
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(app)/ayna-mirror')}
            >
              <LinearGradient
                colors={AynamodaColors.gradients.primary}
                style={styles.actionGradient}
              >
                <Ionicons name="camera" size={24} color={AynamodaColors.text.inverse} />
                <Text style={styles.actionText}>AI Ayna</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(app)/wardrobe')}
            >
              <LinearGradient
                colors={AynamodaColors.gradients.secondary}
                style={styles.actionGradient}
              >
                <Ionicons name="shirt" size={24} color={AynamodaColors.text.primary} />
                <Text style={[styles.actionText, { color: AynamodaColors.text.primary }]}>
                  Gardırop
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const createResponsiveStyles = () => {
  const padding = getResponsivePadding();
  const isTabletDevice = isTablet();

  return StyleSheet.create({
    container: {
      backgroundColor: AynamodaColors.background.primary,
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: responsiveSpacing(DesignSystem.spacing.xxxl + DesignSystem.spacing.xl),
      paddingHorizontal: isTabletDevice ? padding.horizontal * 1.5 : DesignSystem.spacing.lg,
    },

    // Header Styles
    header: {
      paddingBottom: DesignSystem.spacing.lg,
      paddingTop: DesignSystem.spacing.lg,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: DesignSystem.spacing.md,
      width: '100%',
    },
    menuButton: {
      backgroundColor: AynamodaColors.background.elevated,
      borderRadius: DesignSystem.borderRadius.md,
      elevation: 3,
      padding: DesignSystem.spacing.md,
      shadowColor: AynamodaColors.shadow.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    searchButton: {
      backgroundColor: AynamodaColors.background.elevated,
      borderRadius: DesignSystem.borderRadius.md,
      elevation: 3,
      padding: DesignSystem.spacing.md,
      shadowColor: AynamodaColors.shadow.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    // Central Diamond Logo
    centralDiamondContainer: {
      alignItems: 'center',
      marginVertical: DesignSystem.spacing.xxl,
      zIndex: 10,
    },
    centralDiamond: {
      alignItems: 'center',
      borderRadius: 50,
      elevation: 12,
      height: 100,
      justifyContent: 'center',
      marginBottom: DesignSystem.spacing.md,
      shadowColor: AynamodaColors.shadow.colored,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      width: 100,
    },
    logoText: {
      color: AynamodaColors.text.primary,
      fontSize: responsiveFontSize(28),
      fontWeight: '300',
      letterSpacing: isTabletDevice ? 6 : 4,
      textAlign: 'center',
    },

    // Stacked Cards Container
    stackedCardsContainer: {
      alignItems: 'center',
      height: 380,
      justifyContent: 'center',
      marginBottom: 40,
      paddingHorizontal: 20,
      position: 'relative',
    },
    productCard: {
      alignSelf: 'center',
      position: 'absolute',
      width: screenWidth * 0.75,
    },
    cardTouchable: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    cardBlur: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    cardGradient: {
      borderColor: AynamodaColors.border.primary,
      borderRadius: 24,
      borderWidth: 1,
      elevation: 10,
      minHeight: 320,
      padding: 20,
      shadowColor: AynamodaColors.shadow.medium,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
    },

    // Category Badge
    categoryBadge: {
      backgroundColor: AynamodaColors.primary[500],
      borderRadius: 8,
      left: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      position: 'absolute',
      top: 12,
      zIndex: 1,
    },
    categoryText: {
      color: AynamodaColors.text.inverse,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
    },

    // Product Image
    imageContainer: {
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 30,
    },
    imagePlaceholder: {
      alignItems: 'center',
      borderRadius: 16,
      elevation: 6,
      height: 140,
      justifyContent: 'center',
      shadowColor: AynamodaColors.shadow.light,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      width: 120,
    },

    // Product Info
    productInfo: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    productName: {
      color: AynamodaColors.text.primary,
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 6,
      textAlign: 'center',
    },
    productSubtitle: {
      color: AynamodaColors.text.tertiary,
      fontSize: 14,
      marginBottom: 16,
      textAlign: 'center',
    },
    priceContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    price: {
      color: AynamodaColors.text.accent,
      fontSize: 20,
      fontWeight: '800',
    },
    favoriteButton: {
      backgroundColor: AynamodaColors.background.elevated,
      borderRadius: 8,
      padding: 8,
    },

    // Premium Section
    premiumSection: {
      marginVertical: DesignSystem.spacing.xl,
      paddingHorizontal: DesignSystem.spacing.sm,
    },
    sectionTitle: {
      color: AynamodaColors.text.primary,
      fontFamily: DesignSystem.typography.fontFamily.body,
      fontSize: responsiveFontSize(24),
      fontWeight: '700',
      marginBottom: DesignSystem.spacing.lg,
      textAlign: 'center',
    },

    // Product Showcase Section
    productShowcaseSection: {
      marginVertical: DesignSystem.spacing.xl,
      paddingHorizontal: DesignSystem.spacing.sm,
    },

    // Quick Actions
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    actionButton: {
      borderRadius: 16,
      elevation: 6,
      flex: 1,
      marginHorizontal: 8,
      overflow: 'hidden',
      shadowColor: AynamodaColors.shadow.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    actionGradient: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    actionText: {
      color: AynamodaColors.text.inverse,
      fontFamily: DesignSystem.typography.fontFamily.body,
      fontSize: responsiveFontSize(16),
      fontWeight: '600',
      marginLeft: responsiveSpacing(8),
    },
  });
};

// Create responsive styles
const styles = createResponsiveStyles();

export default memo(HomeScreen);
