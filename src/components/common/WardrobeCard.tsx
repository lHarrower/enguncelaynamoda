import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { DesignSystem } from '../../theme/DesignSystem';

const { width } = Dimensions.get('window');

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  category: string;
}

interface WardrobeCardProps {
  item: WardrobeItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const WardrobeCard: React.FC<WardrobeCardProps> = ({ item, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: 8,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 0.75,
    ...DesignSystem.elevation.medium,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.sage[100],
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DesignSystem.borderRadius.md,
  },
  categoryText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: '600',
  },
});

export default WardrobeCard;