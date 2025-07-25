import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

// Sample wardrobe data
const wardrobeItems = [
  { id: '1', brand: 'ZARA', name: 'White Cotton Shirt', price: '$49.90', image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce670c0?w=400&h=600&fit=crop' },
  { id: '2', brand: 'MANGO', name: 'Black Trousers', price: '$89.00', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop' },
  { id: '3', brand: 'COS', name: 'Wool Sweater', price: '$125.00', image: 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=400&h=600&fit=crop' },
  { id: '4', brand: 'ARKET', name: 'Midi Skirt', price: '$79.00', image: 'https://images.unsplash.com/photo-1594619336195-39a8f2712533?w=400&h=600&fit=crop' },
  { id: '5', brand: 'UNIQLO', name: 'Cashmere Cardigan', price: '$99.90', image: 'https://images.unsplash.com/photo-1551803091-e2ab622d37e6?w=400&h=600&fit=crop' },
  { id: '6', brand: 'EVERLANE', name: 'Silk Blouse', price: '$118.00', image: 'https://images.unsplash.com/photo-1506629905607-c7a8b3bb0aa3?w=400&h=600&fit=crop' },
];

const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const WardrobeItemCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.itemCard} onPress={onPress} activeOpacity={0.9}>
    <Image source={{ uri: item.image }} style={styles.itemImage} />
    <View style={styles.itemContent}>
      <Text style={styles.itemBrand}>{item.brand}</Text>
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
    </View>
  </TouchableOpacity>
);

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      'clamp'
    );

    return {
      opacity,
    };
  });

  // Handle add item - show camera/gallery options
  const handleAddItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Add New Item',
      'How would you like to add this item to your wardrobe?',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
          style: 'default',
        },
        {
          text: 'Choose from Gallery',
          onPress: handleChooseFromGallery,
          style: 'default',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Handle take photo
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take photos of your wardrobe items.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Photo taken:', result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Handle choose from gallery
  const handleChooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please allow gallery access to choose photos of your wardrobe items.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Image selected:', result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error choosing from gallery:', error);
    }
  };

  const CategoryChip = ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        isActive && styles.activeCategoryChip
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.categoryChipText,
        isActive && styles.activeCategoryChipText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFloatingHeader = () => (
    <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Wardrobe</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search-outline" size={18} color={ULTRA_PREMIUM_THEME.semantic.text.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="shirt-outline" size={48} color={ULTRA_PREMIUM_THEME.semantic.text.tertiary} />
      </View>
      <Text style={styles.emptyTitle}>Build Your Wardrobe</Text>
      <Text style={styles.emptySubtitle}>
        Add your favorite pieces to create the perfect digital closet
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={handleAddItem}
        activeOpacity={0.8}
      >
        <Text style={styles.addFirstButtonText}>Add First Item</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {renderFloatingHeader()}
      
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + ULTRA_PREMIUM_THEME.spacing.massive }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Wardrobe</Text>
          <Text style={styles.subtitle}>
            {wardrobeItems.length} {wardrobeItems.length === 1 ? 'piece' : 'pieces'}
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                isActive={activeCategory === category}
                onPress={() => setActiveCategory(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        {wardrobeItems.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.itemsSection}>
            <View style={styles.itemsGrid}>
              {wardrobeItems.map((item) => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/product/${item.id}`)}
                />
              ))}
            </View>
          </View>
        )}
      </AnimatedScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + ULTRA_PREMIUM_THEME.spacing.xl }]}
        onPress={handleAddItem}
        activeOpacity={0.9}
      >
        <Ionicons name="camera" size={24} color={ULTRA_PREMIUM_THEME.semantic.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: ULTRA_PREMIUM_THEME.semantic.border.tertiary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: 60,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.md,
  },
  headerTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h2,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    fontWeight: '400',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: ULTRA_PREMIUM_THEME.radius.round,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  header: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: 100,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.xl,
  },
  title: {
    ...ULTRA_PREMIUM_THEME.typography.scale.display,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.sm,
    fontWeight: '300',
  },
  subtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
  },
  categoriesSection: {
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xl,
  },
  categoriesContainer: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    gap: ULTRA_PREMIUM_THEME.spacing.sm,
  },
  itemsSection: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.primary,
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  itemImage: {
    width: '100%',
    height: 200,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
  },
  itemContent: {
    padding: ULTRA_PREMIUM_THEME.spacing.md,
  },
  itemBrand: {
    ...ULTRA_PREMIUM_THEME.typography.scale.overline,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
  },
  itemName: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
    fontWeight: '400',
  },
  itemPrice: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body2,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: ULTRA_PREMIUM_THEME.spacing.xxxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  emptyTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h2,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.sm,
    textAlign: 'center',
    fontWeight: '400',
  },
  emptySubtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xl,
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingVertical: ULTRA_PREMIUM_THEME.spacing.md,
    borderRadius: ULTRA_PREMIUM_THEME.radius.sm,
    marginTop: ULTRA_PREMIUM_THEME.spacing.md,
  },
  addFirstButtonText: {
    ...ULTRA_PREMIUM_THEME.typography.scale.button,
    color: ULTRA_PREMIUM_THEME.semantic.text.inverse,
    textAlign: 'center',
  },
  categoryChip: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.md,
    paddingVertical: ULTRA_PREMIUM_THEME.spacing.sm,
    borderRadius: ULTRA_PREMIUM_THEME.radius.round,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  activeCategoryChip: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
    borderColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
  },
  categoryChipText: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body2,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: ULTRA_PREMIUM_THEME.semantic.text.inverse,
  },
  fab: {
    position: 'absolute',
    right: ULTRA_PREMIUM_THEME.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...ULTRA_PREMIUM_THEME.elevation.soft,
  },
});