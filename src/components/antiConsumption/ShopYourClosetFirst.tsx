import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import {
  antiConsumptionService,
  ShopYourClosetRecommendation,
} from '@/services/antiConsumptionService';
import { WardrobeItem } from '@/services/wardrobeService';
import { DesignSystem } from '@/theme/DesignSystem';
import { errorInDev, logInDev } from '@/utils/consoleSuppress';

interface ShopYourClosetFirstProps {
  userId: string;
  targetItemDescription: string;
  category: string;
  colors?: string[];
  style?: string;
  onRecommendationGenerated?: (recommendation: ShopYourClosetRecommendation) => void;
}

export const ShopYourClosetFirst: React.FC<ShopYourClosetFirstProps> = ({
  userId,
  targetItemDescription,
  category,
  colors = [],
  style = '',
  onRecommendationGenerated,
}) => {
  const theme = useSafeTheme();
  const { colors: themeColors } = theme;
  const styles = createStyles(DesignSystem.colors);
  const [recommendation, setRecommendation] = useState<ShopYourClosetRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = React.useRef(true);

  const generateRecommendation = useCallback(async () => {
    try {
      if (!isMounted.current) {
        return;
      }
      setLoading(true);
      setError(null);

      const rec = await antiConsumptionService.generateShopYourClosetRecommendations(
        userId,
        targetItemDescription,
        category,
        colors,
        style,
      );

      if (!isMounted.current) {
        return;
      }
      setRecommendation(rec);
      onRecommendationGenerated?.(rec);
    } catch (err) {
      if (!isMounted.current) {
        return;
      }
      setError('Failed to generate recommendations');
      errorInDev('Error generating shop your closet recommendation:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [userId, targetItemDescription, category, colors, style]);

  useEffect(() => {
    isMounted.current = true;
    void generateRecommendation();
    return () => {
      isMounted.current = false;
    };
  }, [generateRecommendation]);

  const handleItemPress = (item: WardrobeItem) => {
    Alert.alert(
      'Style This Item',
      `Would you like to create an outfit with this ${item.category.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Style It', onPress: () => navigateToStyling(item) },
      ],
    );
  };

  const navigateToStyling = (item: WardrobeItem) => {
    // This would navigate to the styling screen with the selected item
    logInDev('Navigate to styling with item:', item.id);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding similar items in your closet...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={themeColors.semantic?.error || themeColors.error?.[500] || '#ff4d4f'}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void generateRecommendation()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Retry generating recommendations for your closet items"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!recommendation || recommendation.similarOwnedItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noItemsContainer}>
          <Ionicons
            name="shirt-outline"
            size={48}
            color={themeColors.neutral?.[600] || '#666666'}
          />
          <Text style={styles.noItemsTitle}>No Similar Items Found</Text>
          <Text style={styles.noItemsText}>
            You don&apos;t have similar items in your closet yet. This might be a good addition to
            your wardrobe!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={24} color={themeColors.primary?.[500] || '#6c5ce7'} />
        </View>
        <Text style={styles.title}>Shop Your Closet First</Text>
        <Text style={styles.subtitle}>Before buying new, explore what you already own</Text>
      </View>

      <View style={styles.targetItemContainer}>
        <Text style={styles.targetItemLabel}>Looking for:</Text>
        <Text style={styles.targetItemDescription}>{targetItemDescription}</Text>
      </View>

      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBar}>
          <View
            style={[styles.confidenceFill, { width: `${recommendation.confidenceScore * 100}%` }]}
          />
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(recommendation.confidenceScore * 100)}% match with your existing items
        </Text>
      </View>

      <View style={styles.reasoningContainer}>
        {recommendation.reasoning.map((reason, index) => (
          <View key={index} style={styles.reasoningItem}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={themeColors.semantic?.success || themeColors.success?.[500] || '#5C8A5C'}
            />
            <Text style={styles.reasoningText}>{reason}</Text>
          </View>
        ))}
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Similar Items You Own</Text>
        <View style={styles.itemsGrid}>
          {recommendation.similarOwnedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.category} item`}
              accessibilityHint="Tap to view details of this wardrobe item"
            >
              {'imageUri' in item && typeof item.imageUri === 'string' ? (
                <Image
                  source={{ uri: item.imageUri } as ImageSourcePropType}
                  style={styles.itemImage}
                />
              ) : null}
              <View style={styles.itemInfo}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemColors}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor:
                            typeof color === 'string' ? color.toLowerCase() : themeColors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <Text style={styles.itemTags}>{item.tags.slice(0, 2).join(', ')}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Style these items"
          accessibilityHint="Create outfits using your existing wardrobe items"
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Style These Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {}}
          accessibilityRole="button"
          accessibilityLabel="Still want to shop"
          accessibilityHint="Continue to shopping options if you still want to purchase new items"
        >
          <Text style={styles.secondaryButtonText}>Still Want to Shop?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: typeof DesignSystem.colors) =>
  StyleSheet.create({
    actionContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    colorDot: {
      borderColor: colors.border.primary,
      borderRadius: 6,
      borderWidth: 1,
      height: 12,
      marginRight: 4,
      width: 12,
    },
    confidenceBar: {
      backgroundColor: colors.border.primary,
      borderRadius: 4,
      height: 8,
      marginBottom: 8,
      overflow: 'hidden',
    },

    confidenceContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },
    confidenceFill: {
      backgroundColor: colors.semantic.success,
      borderRadius: 4,
      height: '100%',
    },
    confidenceText: {
      color: colors.text.secondary,
      fontSize: 14,
      textAlign: 'center',
    },
    container: {
      backgroundColor: colors.background.primary,
      flex: 1,
    },
    errorContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    errorText: {
      color: colors.text.secondary,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24,
      marginTop: 16,
      textAlign: 'center',
    },
    header: {
      alignItems: 'center',
      padding: 20,
    },
    iconContainer: {
      alignItems: 'center',
      backgroundColor: `${colors.primary[500]}20`,
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      marginBottom: 12,
      width: 48,
    },
    itemCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      width: '48%',
    },
    itemCategory: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    itemColors: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    itemImage: {
      backgroundColor: colors.border.primary,
      height: 120,
      width: '100%',
    },
    itemInfo: {
      padding: 12,
    },
    itemTags: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    itemsContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },
    itemsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    itemsTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    loadingText: {
      color: colors.text.secondary,
      fontSize: 16,
      textAlign: 'center',
    },
    noItemsContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    noItemsText: {
      color: colors.text.secondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    noItemsTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 16,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary[500],
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
      paddingVertical: 16,
    },
    primaryButtonText: {
      color: colors.background.primary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    reasoningContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },
    reasoningItem: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 8,
    },
    reasoningText: {
      color: colors.text.primary,
      flex: 1,
      fontSize: 14,
      marginLeft: 8,
    },
    retryButton: {
      backgroundColor: colors.primary[500],
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: colors.background.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      alignItems: 'center',
      borderColor: colors.border.primary,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 16,
    },
    secondaryButtonText: {
      color: colors.text.secondary,
      fontSize: 16,
      fontWeight: '500',
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: 16,
      textAlign: 'center',
    },
    targetItemContainer: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      margin: 20,
      padding: 16,
    },
    targetItemDescription: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
    },
    targetItemLabel: {
      color: colors.text.secondary,
      fontSize: 14,
      marginBottom: 4,
    },
    title: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
    },
  });
