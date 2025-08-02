import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClothingItem } from '@/data/sanctuaryModels';
import { WardrobeItem } from '@/types/aynaMirror';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // Account for padding and gap

interface WardrobeItemCardProps {
  item: ClothingItem | WardrobeItem;
  onPress: () => void;
  onLongPress?: () => void;
  showAIIndicator?: boolean;
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
  item,
  onPress,
  onLongPress,
  showAIIndicator = true
}) => {
  
  // Helper function to get effective item name
  const getEffectiveName = () => {
    if ('name' in item && 'aiGeneratedName' in item) {
      // New WardrobeItem with AI naming
      const wardrobeItem = item as WardrobeItem;
      if (wardrobeItem.name && wardrobeItem.nameOverride) {
        return wardrobeItem.name;
      }
      if (wardrobeItem.aiGeneratedName) {
        return wardrobeItem.aiGeneratedName;
      }
      return wardrobeItem.name || 'Unnamed Item';
    }
    // Legacy ClothingItem
    return (item as ClothingItem).name || 'Unnamed Item';
  };
  
  // Helper function to check if name is AI-generated
  const isAIGenerated = () => {
    if ('aiGeneratedName' in item && 'nameOverride' in item) {
      const wardrobeItem = item as WardrobeItem;
      return !wardrobeItem.nameOverride && !!wardrobeItem.aiGeneratedName;
    }
    return false;
  };
  
  // Helper function to get item image URL
  const getImageUrl = () => {
    if ('imageUri' in item) {
      return (item as WardrobeItem).imageUri;
    }
    return (item as ClothingItem).imageUrl;
  };
  
  // Helper function to get item colors
  const getColors = () => {
    return item.colors || [];
  };
  
  // Helper function to get item brand
  const getBrand = () => {
    return item.brand || item.category;
  };
  
  // Helper function to get confidence score
  const getConfidenceScore = () => {
    if ('confidenceScore' in item) {
      return (item as ClothingItem).confidenceScore;
    }
    // For WardrobeItem, we might need to calculate from confidenceHistory
    return 8; // Default confidence
  };
  const getLastWornStatus = () => {
    if (!item.lastWorn) {
      return { text: 'Never worn', color: '#FF6B6B', bgColor: '#FFE8E8' };
    }

    const daysSinceWorn = Math.floor(
      (new Date().getTime() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceWorn === 0) {
      return { text: 'Today', color: '#4CAF50', bgColor: '#E8F5E8' };
    } else if (daysSinceWorn === 1) {
      return { text: 'Yesterday', color: '#4CAF50', bgColor: '#E8F5E8' };
    } else if (daysSinceWorn <= 7) {
      return { text: `${daysSinceWorn}d ago`, color: '#4CAF50', bgColor: '#E8F5E8' };
    } else if (daysSinceWorn <= 30) {
      return { text: `${daysSinceWorn}d ago`, color: '#FF9800', bgColor: '#FFF3E0' };
    } else {
      return { text: `${daysSinceWorn}d ago`, color: '#FF6B6B', bgColor: '#FFE8E8' };
    }
  };

  const getConfidenceStars = () => {
    const stars = Math.floor(getConfidenceScore() / 2); // Convert 10-scale to 5-star
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < stars ? 'star' : 'star-outline'}
        size={10}
        color="#FFD700"
      />
    ));
  };

  const lastWornStatus = getLastWornStatus();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      {/* Item Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: getImageUrl() }} style={styles.itemImage} />
        
        {/* AI Generated Indicator */}
        {showAIIndicator && isAIGenerated() && (
          <View style={styles.aiIndicator}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          </View>
        )}
        
        {/* Last Worn Indicator */}
        <View style={[styles.lastWornBadge, { backgroundColor: lastWornStatus.bgColor }]}>
          <Text style={[styles.lastWornText, { color: lastWornStatus.color }]}>
            {lastWornStatus.text}
          </Text>
        </View>
        
        {/* Wear Count */}
        {'wearCount' in item && (
          <View style={styles.wearCountBadge}>
            <Text style={styles.wearCountText}>{(item as ClothingItem).wearCount}×</Text>
          </View>
        )}
      </View>

      {/* Item Info */}
      <View style={styles.itemInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.itemName} numberOfLines={2}>
            {getEffectiveName()}
          </Text>
          {isAIGenerated() && showAIIndicator && (
            <View style={styles.aiNameBadge}>
              <Ionicons name="sparkles" size={8} color="#6366F1" />
              <Text style={styles.aiNameText}>AI</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.itemBrand} numberOfLines={1}>
          {getBrand()}
        </Text>
        
        {/* Colors */}
        <View style={styles.colorsContainer}>
          {getColors().slice(0, 3).map((color, index) => (
            <View
              key={index}
              style={[styles.colorDot, { backgroundColor: getColorHex(color) }]}
            />
          ))}
          {getColors().length > 3 && (
            <Text style={styles.moreColors}>+{getColors().length - 3}</Text>
          )}
        </View>
        
        {/* Confidence Stars */}
        <View style={styles.confidenceContainer}>
          <View style={styles.starsContainer}>
            {getConfidenceStars()}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper function to get color hex values
const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#808080',
    'Navy': '#000080',
    'Blue': '#0066CC',
    'Red': '#FF0000',
    'Pink': '#FF69B4',
    'Purple': '#800080',
    'Green': '#008000',
    'Yellow': '#FFD700',
    'Orange': '#FFA500',
    'Brown': '#8B4513',
    'Beige': '#F5F5DC',
    'Cream': '#FFFDD0',
    'Gold': '#DAA520',
    'Silver': '#C0C0C0',
    'Lavender': '#E6E6FA'
  };
  
  return colorMap[colorName] || '#CCCCCC';
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: CARD_WIDTH * 1.2,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lastWornBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lastWornText: {
    fontSize: 10,
    fontWeight: '600',
  },
  wearCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  wearCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemInfo: {
    padding: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: 18,
    flex: 1,
  },
  aiIndicator: {
    position: 'absolute',
    top: 8,
    right: 40,
    backgroundColor: '#6366F1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiNameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  aiNameText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 2,
  },
  itemBrand: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  moreColors: {
    fontSize: 10,
    color: '#6B6B6B',
    marginLeft: 4,
  },
  confidenceContainer: {
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },
});