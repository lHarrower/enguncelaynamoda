import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - APP_THEME_V2.spacing.lg * 2 - APP_THEME_V2.spacing.md) / 2;

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
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
    overflow: 'hidden',
    marginBottom: APP_THEME_V2.spacing.md,
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
    backgroundColor: APP_THEME_V2.colors.moonlightSilver,
    opacity: 0.1,
  },
  likeButton: {
    position: 'absolute',
    top: APP_THEME_V2.spacing.sm,
    right: APP_THEME_V2.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_THEME_V2.semantic.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...APP_THEME_V2.elevation.whisper,
  },
  likeIcon: {
    fontSize: 16,
    color: APP_THEME_V2.colors.zenGold,
  },
  content: {
    padding: APP_THEME_V2.spacing.md,
  },
  itemName: {
    ...APP_THEME_V2.typography.scale.body1,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: APP_THEME_V2.semantic.text.primary,
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  category: {
    ...APP_THEME_V2.typography.scale.caption,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: APP_THEME_V2.colors.tranquilBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  brand: {
    ...APP_THEME_V2.typography.scale.caption,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: APP_THEME_V2.semantic.text.secondary,
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
    marginRight: APP_THEME_V2.spacing.xs,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  colorText: {
    ...APP_THEME_V2.typography.scale.caption,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    color: APP_THEME_V2.semantic.text.secondary,
    textTransform: 'capitalize',
  },
});

export default LuxuryWardrobeCard; 