// Item Details Component
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { WardrobeItem } from '@/types';

export interface ItemDetailsProps {
  item: WardrobeItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavoriteToggle?: () => void;
  onClose?: () => void;
  style?: ViewStyle;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onEdit,
  onDelete,
  onFavoriteToggle,
  onClose,
  style,
}) => {
  const { triggerSelection, triggerLight } = useHapticFeedback();

  const handleFavoriteToggle = () => {
    triggerSelection();
    onFavoriteToggle?.();
  };

  const handleEdit = () => {
    triggerSelection();
    onEdit?.();
  };

  const handleDelete = () => {
    triggerLight();
    onDelete?.();
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close item details"
          accessibilityHint="Tap to close the item details view"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {!!onFavoriteToggle && (
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={styles.favoriteButton}
            accessibilityRole="button"
            accessibilityLabel="Toggle favorite"
            accessibilityHint="Tap to add or remove this item from favorites"
          >
            <Text style={styles.favoriteIcon}>♡</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            accessibilityLabel={`Image of ${item.name}`}
            accessibilityRole="image"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>

        <View style={styles.basicInfo}>
          <Text style={styles.category}>{item.category}</Text>
          {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        </View>

        {/* Description field is not in canonical type; keep placeholder if needed */}

        {/* Colors */}
        {item.colors && item.colors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Colors</Text>
            <View style={styles.colorsContainer}>
              {item.colors.map((color, index) => (
                <View key={index} style={styles.colorItem}>
                  <View style={[styles.colorDot, styles.colorDotBackground]} />
                  <Text style={styles.colorName}>{color}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {/* season and occasion are not in canonical type */}

          {item.size && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Size:</Text>
              <Text style={styles.metadataValue}>{item.size}</Text>
            </View>
          )}

          {item.purchaseDate && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Purchased:</Text>
              <Text style={styles.metadataValue}>
                {new Date(item.purchaseDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {item.purchasePrice && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Price:</Text>
              <Text style={styles.metadataValue}>${item.purchasePrice}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit item"
            accessibilityHint="Tap to edit this wardrobe item"
          >
            <Text style={styles.editButtonText}>Edit Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete item"
            accessibilityHint="Tap to delete this wardrobe item"
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  basicInfo: {
    marginBottom: 24,
  },
  brand: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  category: {
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 18,
  },
  colorDot: {
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    marginRight: 8,
    width: 20,
  },
  colorDotBackground: {
    backgroundColor: '#CCCCCC',
  },
  colorItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorName: {
    color: '#374151',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#EF4444',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#374151',
    fontSize: 16,
    lineHeight: 24,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 16,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    color: '#9CA3AF',
    fontSize: 24,
  },
  favoriteIconActive: {
    color: '#EF4444',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  metadataLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  metadataRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metadataValue: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderImage: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: '#6B7280',
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default ItemDetails;
