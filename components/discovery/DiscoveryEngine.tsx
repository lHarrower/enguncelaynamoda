// Discovery Engine - The New Paradigm for Interaction
// Tinder-style swipe mechanism with intelligent learning algorithm

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { STUDIO_THEME } from '../../constants/StudioTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import SwipeableCard from './SwipeableCard';
import PremiumOutfitCard from '../studio/PremiumOutfitCard';

const { width, height } = Dimensions.get('window');

interface ProductItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  boutique: string;
  category: string;
  colors: string[];
  style: string[];
}

interface DiscoveryEngineProps {
  items: ProductItem[];
  onLike: (item: ProductItem) => void;
  onDislike: (item: ProductItem) => void;
  onBoutiqueFavorite?: (boutique: string) => void;
  style?: any;
}

const DiscoveryEngine: React.FC<DiscoveryEngineProps> = ({
  items,
  onLike,
  onDislike,
  onBoutiqueFavorite,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<{
    type: 'like' | 'dislike';
    item: ProductItem;
    index: number;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showSimilarModal, setShowSimilarModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [similarItems, setSimilarItems] = useState<ProductItem[]>([]);
  const [recentlyLiked, setRecentlyLiked] = useState<ProductItem[]>([]);
  const [showFavoritesBar, setShowFavoritesBar] = useState(false);
  const [boutiqueNotification, setBoutiqueNotification] = useState<{
    boutique: string;
    count: number;
  } | null>(null);

  // Animation values
  const undoOpacity = useSharedValue(0);
  const undoTranslateY = useSharedValue(50);
  const favoritesBarTranslateY = useSharedValue(100);

  // Undo timer
  const undoTimer = useRef<NodeJS.Timeout>();

  // Handle swipe right (like)
  const handleSwipeRight = (item: ProductItem) => {
    const actionData = { type: 'like' as const, item, index: currentIndex };
    setLastAction(actionData);
    setRecentlyLiked(prev => [item, ...prev.slice(0, 9)]); // Keep last 10
    
    // Check for boutique favorite logic
    checkBoutiqueFavorite(item.boutique);
    
    onLike(item);
    showUndoButton();
    nextCard();
  };

  // Handle swipe left (dislike)
  const handleSwipeLeft = (item: ProductItem) => {
    const actionData = { type: 'dislike' as const, item, index: currentIndex };
    setLastAction(actionData);
    
    onDislike(item);
    showUndoButton();
    nextCard();
  };

  // Handle long press - show similar items
  const handleLongPress = (item: ProductItem) => {
    setSelectedItem(item);
    // Generate similar items (in real app, this would be an API call)
    const similar = generateSimilarItems(item);
    setSimilarItems(similar);
    setShowSimilarModal(true);
  };

  // Show undo button with animation
  const showUndoButton = () => {
    setShowUndo(true);
    undoOpacity.value = withTiming(1, { duration: 300 });
    undoTranslateY.value = withSpring(0);
    
    // Auto-hide after 3 seconds
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => {
      hideUndoButton();
    }, 3000);
  };

  // Hide undo button
  const hideUndoButton = () => {
    undoOpacity.value = withTiming(0, { duration: 300 });
    undoTranslateY.value = withTiming(50, { duration: 300 }, () => {
      runOnJS(setShowUndo)(false);
    });
  };

  // Handle undo action
  const handleUndo = () => {
    if (!lastAction) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Restore previous state
    setCurrentIndex(lastAction.index);
    
    // Remove from recently liked if it was a like
    if (lastAction.type === 'like') {
      setRecentlyLiked(prev => prev.filter(item => item.id !== lastAction.item.id));
    }
    
    setLastAction(null);
    hideUndoButton();
  };

  // Move to next card
  const nextCard = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Check if user should be prompted to favorite a boutique
  const checkBoutiqueFavorite = (boutique: string) => {
    const boutiqueCount = recentlyLiked.filter(item => item.boutique === boutique).length + 1;
    
    if (boutiqueCount === 5) {
      setBoutiqueNotification({ boutique, count: boutiqueCount });
      setTimeout(() => setBoutiqueNotification(null), 5000);
    }
  };

  // Generate similar items (mock function)
  const generateSimilarItems = (item: ProductItem): ProductItem[] => {
    // In real app, this would use ML/AI to find similar items
    return items.filter(i => 
      i.id !== item.id && 
      (i.category === item.category || 
       i.brand === item.brand ||
       i.colors.some(color => item.colors.includes(color)))
    ).slice(0, 6);
  };

  // Handle scroll to bottom - show favorites bar
  const handleScrollEnd = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y >= contentSize.height - layoutMeasurement.height - 50;
    
    if (isAtBottom && recentlyLiked.length > 0) {
      setShowFavoritesBar(true);
      favoritesBarTranslateY.value = withSpring(0);
    } else if (showFavoritesBar) {
      favoritesBarTranslateY.value = withSpring(100, {}, () => {
        runOnJS(setShowFavoritesBar)(false);
      });
    }
  };

  // Animated styles
  const undoStyle = useAnimatedStyle(() => {
    return {
      opacity: undoOpacity.value,
      transform: [{ translateY: undoTranslateY.value }],
    };
  });

  const favoritesBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: favoritesBarTranslateY.value }],
    };
  });

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="checkmark-circle" size={64} color={STUDIO_THEME.colors.accent.jade} />
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>Check back later for new discoveries</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleScrollEnd}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Swipeable Card */}
        <View style={styles.cardContainer}>
          <SwipeableCard
            item={currentItem}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onLongPress={handleLongPress}
          />
        </View>

        {/* Next Card Preview */}
        {items[currentIndex + 1] && (
          <View style={styles.nextCardPreview}>
            <SwipeableCard
              item={items[currentIndex + 1]}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
              onLongPress={() => {}}
              style={styles.previewCard}
            />
          </View>
        )}
      </ScrollView>

      {/* Undo Button */}
      {showUndo && (
        <Animated.View style={[styles.undoContainer, undoStyle]}>
          <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
            <Ionicons name="arrow-undo" size={20} color={STUDIO_THEME.colors.text.inverse} />
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Hidden Favorites Bar */}
      {showFavoritesBar && (
        <Animated.View style={[styles.favoritesBar, favoritesBarStyle]}>
          <Text style={styles.favoritesTitle}>Recently Loved</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyLiked.map((item, index) => (
              <TouchableOpacity key={item.id} style={styles.favoriteItem}>
                <Image source={{ uri: item.image }} style={styles.favoriteImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Boutique Notification */}
      {boutiqueNotification && (
        <View style={styles.notificationContainer}>
          <View style={styles.notification}>
            <Text style={styles.notificationText}>
              You've loved {boutiqueNotification.count} pieces from {boutiqueNotification.boutique}
            </Text>
            <View style={styles.notificationActions}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => {
                  onBoutiqueFavorite?.(boutiqueNotification.boutique);
                  setBoutiqueNotification(null);
                }}
              >
                <Text style={styles.notificationButtonText}>Add to Favorites</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notificationButton, styles.notificationButtonSecondary]}
                onPress={() => setBoutiqueNotification(null)}
              >
                <Text style={styles.notificationButtonTextSecondary}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Similar Items Modal */}
      <Modal
        visible={showSimilarModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSimilarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Similar Treasures</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSimilarModal(false)}
            >
              <Ionicons name="close" size={24} color={STUDIO_THEME.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {selectedItem && (
            <View style={styles.selectedItemContainer}>
              <Image source={{ uri: selectedItem.image }} style={styles.selectedItemImage} />
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemBrand}>{selectedItem.brand}</Text>
                <Text style={styles.selectedItemTitle}>{selectedItem.title}</Text>
              </View>
            </View>
          )}
          
          <ScrollView style={styles.similarItemsContainer}>
            <View style={styles.similarItemsGrid}>
              {similarItems.map((item) => (
                <PremiumOutfitCard
                  key={item.id}
                  outfit={{
                    id: item.id,
                    title: item.title,
                    subtitle: item.brand,
                    image: item.image,
                    confidence: 85,
                  }}
                  size="small"
                  style={styles.similarItem}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STUDIO_THEME.colors.foundation.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  nextCardPreview: {
    position: 'absolute',
    top: 10,
    zIndex: -1,
  },
  previewCard: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  
  // Empty State
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...STUDIO_THEME.typography.scale.h2,
    color: STUDIO_THEME.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...STUDIO_THEME.typography.scale.body,
    color: STUDIO_THEME.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Undo Button
  undoContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: STUDIO_THEME.colors.text.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    ...STUDIO_THEME.shadows.medium,
  },
  undoText: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.inverse,
    marginLeft: 8,
  },
  
  // Favorites Bar
  favoritesBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: STUDIO_THEME.colors.foundation.elevated,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: STUDIO_THEME.colors.foundation.tertiary,
  },
  favoritesTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.primary,
    marginBottom: 12,
  },
  favoriteItem: {
    marginRight: 12,
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  
  // Notification
  notificationContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: STUDIO_THEME.colors.foundation.elevated,
    borderRadius: 16,
    padding: 16,
    ...STUDIO_THEME.shadows.strong,
  },
  notificationText: {
    ...STUDIO_THEME.typography.scale.body,
    color: STUDIO_THEME.colors.text.primary,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    flex: 1,
    backgroundColor: STUDIO_THEME.colors.accent.jade,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  notificationButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: STUDIO_THEME.colors.accent.jade,
  },
  notificationButtonText: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.text.inverse,
    fontWeight: '600',
  },
  notificationButtonTextSecondary: {
    ...STUDIO_THEME.typography.scale.small,
    color: STUDIO_THEME.colors.accent.jade,
    fontWeight: '600',
  },
  
  // Similar Items Modal
  modalContainer: {
    flex: 1,
    backgroundColor: STUDIO_THEME.colors.foundation.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: STUDIO_THEME.colors.foundation.tertiary,
  },
  modalTitle: {
    ...STUDIO_THEME.typography.scale.h2,
    color: STUDIO_THEME.colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: STUDIO_THEME.colors.foundation.secondary,
  },
  selectedItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  selectedItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedItemBrand: {
    ...STUDIO_THEME.typography.scale.caption,
    color: STUDIO_THEME.colors.accent.jade,
    marginBottom: 4,
  },
  selectedItemTitle: {
    ...STUDIO_THEME.typography.scale.bodyMedium,
    color: STUDIO_THEME.colors.text.primary,
  },
  similarItemsContainer: {
    flex: 1,
    padding: 20,
  },
  similarItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  similarItem: {
    width: (width - 72) / 2, // Account for padding and gap
  },
});

export default DiscoveryEngine;