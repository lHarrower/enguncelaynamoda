// Item Details Component
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WardrobeItem } from '@/types';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface ItemDetailsProps {
  item: WardrobeItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavoriteToggle?: () => void;
  onClose?: () => void;
  style?: any;
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
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {!!onFavoriteToggle && (
          <TouchableOpacity onPress={handleFavoriteToggle} style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>♡</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} />
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
                  <View
                    style={[
                      styles.colorDot,
          { backgroundColor: color || '#CCCCCC' },
                    ]}
                  />
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
          
      {'purchasePrice' in item && (item as any).purchasePrice && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Price:</Text>
        <Text style={styles.metadataValue}>${(item as any).purchasePrice}</Text>
            </View>
      )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Item</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  favoriteIconActive: {
    color: '#EF4444',
  },
  imageContainer: {
    aspectRatio: 1,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
    fontSize: 16,
    color: '#9CA3AF',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  basicInfo: {
    marginBottom: 24,
  },
  category: {
    fontSize: 16,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  colorName: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metadataValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ItemDetails;