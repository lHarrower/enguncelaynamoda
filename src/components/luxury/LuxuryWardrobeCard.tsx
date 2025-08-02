import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - DesignSystem.spacing.lg * 2 - DesignSystem.spacing.md) / 2;

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  color?: string;
  brand?: string;
  isLiked?: boolean;
}

interface LuxuryWardrobeCardProps {
  item: WardrobeItem;
  onPress?: (item: WardrobeItem) => void;
  onLike?: (item: WardrobeItem) => void;
  style?: any;
}

const LuxuryWardrobeCard: React.FC<LuxuryWardrobeCardProps> = ({
  item,
  onPress,
  onLike,
  style,
}) => {
  const handlePress = () => {
    onPress?.(item);
  };

  const handleLike = () => {
    onLike?.(item);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Text style={styles.likeIcon}>
            {item.isLiked ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.metaContainer}>
          <Text style={styles.category} numberOfLines={1}>
            {item.category}
          </Text>
          
          {item.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {item.brand}
            </Text>
          )}
        </View>
        
        {item.color && (
          <View style={styles.colorContainer}>
            <View 
              style={[
                styles.colorDot, 
                { backgroundColor: item.color }
              ]} 
            />
            <Text style={styles.colorText}>
              {item.color}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    ...DesignSystem.elevation.high,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 1.2, // Golden ratio-inspired aspect ratio
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DesignSystem.colors.sage[100],
    opacity: 0.1,
  },
  likeButton: {
    position: 'absolute',
    top: DesignSystem.spacing.sm,
    right: DesignSystem.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignSystem.elevation.medium,
  },
  likeIcon: {
    fontSize: 16,
    color: DesignSystem.colors.sage[500],
  },
  content: {
    padding: DesignSystem.spacing.md,
  },
  itemName: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  category: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.sage[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  brand: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.text.secondary,
    fontStyle: 'italic',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: DesignSystem.spacing.xs,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  colorText: {
    ...DesignSystem.typography.caption.medium,
    color: DesignSystem.colors.text.secondary,
    textTransform: 'capitalize',
  },
});

export default LuxuryWardrobeCard;