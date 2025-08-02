import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { antiConsumptionService, ShopYourClosetRecommendation } from '@/services/antiConsumptionService';
import { WardrobeItem } from '@/types';
import { DesignSystem } from '@/theme/DesignSystem';

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
  const { colors: themeColors } = useTheme();
  const styles = createStyles(themeColors);
  const [recommendation, setRecommendation] = useState<ShopYourClosetRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateRecommendation();
  }, [userId, targetItemDescription, category, colors, style]);

  const generateRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rec = await antiConsumptionService.generateShopYourClosetRecommendations(
        userId,
        targetItemDescription,
        category,
        colors,
        style
      );
      
      setRecommendation(rec);
      onRecommendationGenerated?.(rec);
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Error generating shop your closet recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: WardrobeItem) => {
    Alert.alert(
      'Style This Item',
      `Would you like to create an outfit with this ${item.category.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Style It', onPress: () => navigateToStyling(item) },
      ]
    );
  };

  const navigateToStyling = (item: WardrobeItem) => {
    // This would navigate to the styling screen with the selected item
    console.log('Navigate to styling with item:', item.id);
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
          <Ionicons name="alert-circle-outline" size={48} color={DesignSystem.colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateRecommendation}>
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
          <Ionicons name="shirt-outline" size={48} color={DesignSystem.colors.neutral[600]} />
          <Text style={styles.noItemsTitle}>No Similar Items Found</Text>
          <Text style={styles.noItemsText}>
            You don't have similar items in your closet yet. This might be a good addition to your wardrobe!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={24} color={DesignSystem.colors.primary[500]} />
        </View>
        <Text style={styles.title}>Shop Your Closet First</Text>
        <Text style={styles.subtitle}>
          Before buying new, explore what you already own
        </Text>
      </View>

      <View style={styles.targetItemContainer}>
        <Text style={styles.targetItemLabel}>Looking for:</Text>
        <Text style={styles.targetItemDescription}>{targetItemDescription}</Text>
      </View>

      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceBar}>
          <View 
            style={[
              styles.confidenceFill, 
              { width: `${recommendation.confidenceScore * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(recommendation.confidenceScore * 100)}% match with your existing items
        </Text>
      </View>

      <View style={styles.reasoningContainer}>
        {recommendation.reasoning.map((reason, index) => (
          <View key={index} style={styles.reasoningItem}>
            <Ionicons name="checkmark-circle" size={16} color={DesignSystem.colors.success[500]} />
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
            >
              <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemColors}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
                    />
                  ))}
                </View>
                {item.tags.length > 0 && (
                  <Text style={styles.itemTags}>
                    {item.tags.slice(0, 2).join(', ')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => {}}>
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Style These Items</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
          <Text style={styles.secondaryButtonText}>Still Want to Shop?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noItemsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noItemsText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary[500]}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  targetItemContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  targetItemLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  targetItemDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  confidenceContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.border.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.semantic.success,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  reasoningContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reasoningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  itemsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border.primary,
  },
  itemInfo: {
    padding: 12,
  },
  itemCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemColors: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  itemTags: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
});