// Wardrobe Item Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { WardrobeItem as WardrobeItemType } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface WardrobeItemProps {
  item: WardrobeItemType;
  onPress?: () => void;
  onLongPress?: () => void;
  onFavoritePress?: () => void;
  style?: any;
}

const WardrobeItem: React.FC<WardrobeItemProps> = ({
  item,
  onPress,
  onLongPress,
  onFavoritePress,
  style,
}) => {
  const { triggerSelection, triggerLight } = useHapticFeedback();

  const handlePress = () => {
    triggerSelection();
    onPress?.();
  };

  const handleLongPress = () => {
    triggerLight();
    onLongPress?.();
  };

  const handleFavoritePress = () => {
    triggerSelection();
    onFavoritePress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
          {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Text style={styles.favoriteIcon}>
              {'\u2661'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.details}>
          <Text style={styles.category}>
            {item.category}
          </Text>
          
          {item.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {item.brand}
            </Text>
          )}
        </View>
        
        {item.colors && item.colors.length > 0 && (
          <View style={styles.colorsContainer}>
            {item.colors.slice(0, 3).map((color, index) => (
              <View
                key={index}
                style={[
                  styles.colorDot,
                    { backgroundColor: color || '#CCCCCC' },
                ]}
              />
            ))}
            {item.colors.length > 3 && (
              <Text style={styles.moreColors}>+{item.colors.length - 3}</Text>
            )}
          </View>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  favoriteIconActive: {
    color: '#EF4444',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  details: {
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  brand: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moreColors: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    color: '#6B7280',
  },
});

export default WardrobeItem;