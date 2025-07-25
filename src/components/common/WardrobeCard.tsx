import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

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
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    padding: 8,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 0.75,
    ...APP_THEME_V2.elevation.lift,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: APP_THEME_V2.radius.md,
    backgroundColor: APP_THEME_V2.colors.cloudGray,
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: APP_THEME_V2.radius.md,
  },
  categoryText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.colors.whisperWhite,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontWeight: '600',
  },
});

export default WardrobeCard; 