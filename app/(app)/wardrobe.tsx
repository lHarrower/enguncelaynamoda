import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Alert, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DesignSystem } from '@/theme/DesignSystem';
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

const WardrobeItemCard = ({ item, onPress, onLongPress, isSelected }: { 
  item: any; 
  onPress: () => void;
  onLongPress: () => void;
  isSelected: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.itemCard, isSelected && styles.selectedItemCard]} 
    onPress={onPress}
    onLongPress={onLongPress}
    activeOpacity={0.9}
  >
    <Image source={{ uri: item.image }} style={styles.itemImage} />
    {isSelected && (
      <View style={styles.selectionOverlay}>
        <Ionicons name="checkmark-circle" size={24} color={DesignSystem.colors.sage[500]} />
      </View>
    )}
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Handle item selection
  const handleItemLongPress = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemPress = (item: any) => {
    if (selectedItems.length > 0) {
      handleItemLongPress(item.id);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to item details
  router.push(`/item/${item.id}` as any);
    }
  };

  // Filter items based on search and category
  const filteredItems = wardrobeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory = activeCategory === 'All' || (item as any).category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate responsive grid columns
  const screenWidth = Dimensions.get('window').width;
  const getItemWidth = () => {
    const padding = DesignSystem.spacing.lg * 2;
    const gap = DesignSystem.spacing.md;
    if (screenWidth > 768) {
      // 3 columns for tablets
      return (screenWidth - padding - gap * 2) / 3;
    } else {
      // 2 columns for phones
      return (screenWidth - padding - gap) / 2;
    }
  };

  const itemWidth = getItemWidth();

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
          <Ionicons name="options-outline" size={18} color={DesignSystem.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSearchBar = () => (
  <View style={styles.searchBarContainer}>
      <View style={styles.searchBar}>
  <Ionicons name="search-outline" size={20} color={DesignSystem.colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your wardrobe..."
          placeholderTextColor={DesignSystem.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={DesignSystem.colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="shirt-outline" size={48} color={DesignSystem.colors.text.tertiary} />
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
          { paddingBottom: insets.bottom + DesignSystem.spacing.xxxl }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Wardrobe</Text>
          <Text style={styles.subtitle}>
            {filteredItems.length} {filteredItems.length === 1 ? 'piece' : 'pieces'}
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

        {/* Search Bar */}
        {renderSearchBar()}

        {/* Content */}
        {filteredItems.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.itemsSection}>
            <View style={styles.itemsGrid}>
              {filteredItems.map((item) => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item.id)}
                  onLongPress={() => handleItemLongPress(item.id)}
                  isSelected={selectedItems.includes(item.id)}
                />
              ))}
            </View>
          </View>
        )}
      </AnimatedScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + DesignSystem.spacing.xl }]}
        onPress={handleAddItem}
        activeOpacity={0.9}
      >
  <Ionicons name="camera" size={24} color={DesignSystem.colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: DesignSystem.colors.background.primary,
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
  backgroundColor: DesignSystem.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.sage[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 60,
    paddingBottom: DesignSystem.spacing.md,
  },
  headerTitle: {
  fontSize: DesignSystem.typography.scale.h2.fontSize,
  fontWeight: DesignSystem.typography.scale.h2.fontWeight,
    color: DesignSystem.colors.sage[900],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.round,
    backgroundColor: DesignSystem.colors.sage[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  header: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 100,
    paddingBottom: DesignSystem.spacing.xl,
  },
  title: {
    fontSize: DesignSystem.typography.display.fontSize,
    fontWeight: '300',
    color: DesignSystem.colors.sage[900],
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    fontSize: DesignSystem.typography.body1.fontSize,
    color: DesignSystem.colors.sage[600],
  },
  categoriesSection: {
    marginBottom: DesignSystem.spacing.xl,
  },
  categoriesContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
  },
  searchBarContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[50],
    borderRadius: DesignSystem.radius.lg,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  searchInput: {
    flex: 1,
    fontSize: DesignSystem.typography.body1.fontSize,
    color: DesignSystem.colors.sage[900],
    marginLeft: DesignSystem.spacing.sm,
  },
  clearButton: {
    padding: DesignSystem.spacing.xs,
  },
  itemsSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    marginBottom: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  selectedItemCard: {
    borderColor: DesignSystem.colors.sage[500],
    borderWidth: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: DesignSystem.spacing.sm,
    right: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.radius.round,
    padding: DesignSystem.spacing.xs,
    zIndex: 1,
  },
  itemImage: {
    width: '100%',
    height: 200,
    backgroundColor: DesignSystem.colors.sage[50],
  },
  itemContent: {
    padding: DesignSystem.spacing.md,
  },
  itemBrand: {
    fontSize: DesignSystem.typography.overline.fontSize,
    fontWeight: DesignSystem.typography.overline.fontWeight,
    color: DesignSystem.colors.sage[500],
    marginBottom: DesignSystem.spacing.xs,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: DesignSystem.typography.body1.fontSize,
    color: DesignSystem.colors.sage[900],
    marginBottom: DesignSystem.spacing.xs,
    fontWeight: '400',
  },
  itemPrice: {
    fontSize: DesignSystem.typography.body2.fontSize,
    color: DesignSystem.colors.sage[600],
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xxxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DesignSystem.colors.sage[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  emptyTitle: {
  fontSize: DesignSystem.typography.scale.h2.fontSize,
  fontWeight: DesignSystem.typography.scale.h2.fontWeight,
    color: DesignSystem.colors.sage[900],
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: DesignSystem.typography.body1.fontSize,
    color: DesignSystem.colors.sage[600],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
    lineHeight: 22,
  },
  addFirstButton: {
    backgroundColor: DesignSystem.colors.sage[900],
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.radius.sm,
    marginTop: DesignSystem.spacing.md,
  },
  addFirstButtonText: {
  fontSize: DesignSystem.typography.button.medium.fontSize,
  fontWeight: DesignSystem.typography.button.medium.fontWeight,
  color: DesignSystem.colors.text.inverse,
    textAlign: 'center',
  },
  categoryChip: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.radius.round,
    backgroundColor: DesignSystem.colors.sage[50],
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  activeCategoryChip: {
    backgroundColor: DesignSystem.colors.sage[900],
    borderColor: DesignSystem.colors.sage[900],
  },
  categoryChipText: {
    fontSize: DesignSystem.typography.body2.fontSize,
    color: DesignSystem.colors.sage[600],
    fontWeight: '500',
  },
  activeCategoryChipText: {
  color: DesignSystem.colors.text.inverse,
  },
  fab: {
    position: 'absolute',
    right: DesignSystem.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignSystem.colors.sage[900],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DesignSystem.colors.sage[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});