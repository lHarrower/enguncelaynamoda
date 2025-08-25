// Discovery Engine - The New Paradigm for Interaction
// Tinder-style swipe mechanism with intelligent learning algorithm

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import SwipeableCard from '@/components/discovery/SwipeableCard';
import PremiumOutfitCard from '@/components/studio/PremiumOutfitCard';
import { DesignSystem } from '@/theme/DesignSystem';

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
  style?: Record<string, unknown>;
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
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle swipe right (like)
  const handleSwipeRight = (item: ProductItem) => {
    const actionData = { type: 'like' as const, item, index: currentIndex };
    setLastAction(actionData);
    setRecentlyLiked((prev) => [item, ...prev.slice(0, 9)]); // Keep last 10

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
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
    }
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
    if (!lastAction) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Restore previous state
    setCurrentIndex(lastAction.index);

    // Remove from recently liked if it was a like
    if (lastAction.type === 'like') {
      setRecentlyLiked((prev) => prev.filter((item) => item.id !== lastAction.item.id));
    }

    setLastAction(null);
    hideUndoButton();
  };

  // Move to next card
  const nextCard = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Check if user should be prompted to favorite a boutique
  const checkBoutiqueFavorite = (boutique: string) => {
    const boutiqueCount = recentlyLiked.filter((item) => item.boutique === boutique).length + 1;

    if (boutiqueCount === 5) {
      setBoutiqueNotification({ boutique, count: boutiqueCount });
      setTimeout(() => setBoutiqueNotification(null), 5000);
    }
  };

  // Generate similar items (mock function)
  const generateSimilarItems = (item: ProductItem): ProductItem[] => {
    // In real app, this would use ML/AI to find similar items
    return items
      .filter(
        (i) =>
          i.id !== item.id &&
          (i.category === item.category ||
            i.brand === item.brand ||
            i.colors.some((color) => item.colors.includes(color))),
      )
      .slice(0, 6);
  };

  // Handle scroll to bottom - show favorites bar
  const handleScrollEnd = (event: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) => {
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
  const nextItem = items.length > currentIndex + 1 ? items[currentIndex + 1] : undefined;

  if (!currentItem) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons
          name="checkmark-circle"
          size={64}
          color={DesignSystem.colors.sage?.[500] || '#2ECC71'}
        />
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
        {nextItem && (
          <View style={styles.nextCardPreview}>
            <SwipeableCard
              item={nextItem}
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
          <TouchableOpacity
            style={styles.undoButton}
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo last action"
            accessibilityHint="Undo the last swipe action and restore the previous item"
          >
            <Ionicons name="arrow-undo" size={20} color={DesignSystem.colors.text.inverse} />
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
              You&apos;ve loved {boutiqueNotification.count} pieces from {boutiqueNotification.boutique}
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
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
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
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },

  // Undo Button
  undoContainer: {
    alignItems: 'center',
    bottom: 100,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  undoButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.text.primary,
    borderRadius: 25,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...DesignSystem.elevation.medium,
  },
  undoText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    marginLeft: 8,
  },

  // Favorites Bar
  favoritesBar: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderTopColor: DesignSystem.colors.border.secondary,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
  favoritesTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
  },
  favoriteItem: {
    marginRight: 12,
  },
  favoriteImage: {
    borderRadius: 8,
    height: 60,
    width: 60,
  },

  // Notification
  notificationContainer: {
    left: 20,
    position: 'absolute',
    right: 20,
    top: 60,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 16,
    padding: 16,
    ...DesignSystem.elevation.high,
  },
  notificationText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationButtonSecondary: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.sage[500],
    borderWidth: 1,
  },
  notificationButtonText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
  },
  notificationButtonTextSecondary: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[500],
    fontWeight: '600',
  },

  // Similar Items Modal
  modalContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.border.secondary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalTitle: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  selectedItemContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    flexDirection: 'row',
    padding: 20,
  },
  selectedItemImage: {
    borderRadius: 8,
    height: 80,
    marginRight: 16,
    width: 80,
  },
  selectedItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedItemBrand: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.sage[500],
    marginBottom: 4,
  },
  selectedItemTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
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
