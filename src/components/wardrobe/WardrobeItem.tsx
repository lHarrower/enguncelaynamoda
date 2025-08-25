// Premium Wardrobe Item Card Component
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useHapticFeedback } from '@/hooks/useHapticFeedback';
// P0 Analyze Flow: integrate Analyze button + modal & optimistic UI hooks
import { callAiAnalysis } from '@/lib/callAiAnalysis';
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem as WardrobeItemType } from '@/types';
import { warnInDev } from '@/utils/consoleSuppress';

export interface WardrobeItemProps {
  item: WardrobeItemType;
  onPress?: () => void;
  onLongPress?: () => void;
  onFavoritePress?: () => void;
  style?: ViewStyle;
}

const WardrobeItem = React.forwardRef<View, WardrobeItemProps>(
  ({ item, onPress, onLongPress, onFavoritePress, style }, ref) => {
    const { triggerSelection, triggerLight } = useHapticFeedback();
    const [analyzing, setAnalyzing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [analysis, setAnalysis] = useState<Record<string, any> | null>(
      item.aiAnalysisData || null,
    );
    const [processedImageUri, setProcessedImageUri] = useState(
      item.processedImageUri || item.imageUri,
    );

    // Ref to track component mount status for cleanup
    const isMountedRef = useRef(true);
    const analysisAbortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Enhanced cleanup on unmount to prevent memory leaks
    useEffect(() => {
      return () => {
        isMountedRef.current = false;

        // Cancel any ongoing analysis requests
        if (analysisAbortControllerRef.current) {
          analysisAbortControllerRef.current.abort();
          analysisAbortControllerRef.current = null;
        }

        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Reset state to prevent memory leaks
        setAnalyzing(false);
        setAnalysis(null);
      };
    }, []);

    // Memoized event handlers to prevent unnecessary re-renders
    const handlePress = useCallback(() => {
      if (!isMountedRef.current) {
        return;
      }
      triggerSelection();
      onPress?.();
    }, [triggerSelection, onPress]);

    const handleLongPress = useCallback(() => {
      if (!isMountedRef.current) {
        return;
      }
      triggerLight();
      onLongPress?.();
    }, [triggerLight, onLongPress]);

    const handleFavoritePress = useCallback(() => {
      if (!isMountedRef.current) {
        return;
      }
      triggerSelection();
      onFavoritePress?.();
    }, [triggerSelection, onFavoritePress]);

    const handleAnalyze = useCallback(async () => {
      if (analyzing || !item.id || !processedImageUri || !isMountedRef.current) {
        return;
      }

      // Cancel any previous analysis request
      if (analysisAbortControllerRef.current) {
        analysisAbortControllerRef.current.abort();
        analysisAbortControllerRef.current = null;
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      analysisAbortControllerRef.current = abortController;

      if (!isMountedRef.current) {
        return;
      }
      setAnalyzing(true);
      const prevAnalysis = analysis;

      try {
        // Optimistic state: show modal immediately
        if (isMountedRef.current) {
          setShowModal(true);
        }

        // Set timeout for analysis to prevent hanging requests
        timeoutRef.current = setTimeout(() => {
          if (analysisAbortControllerRef.current) {
            analysisAbortControllerRef.current.abort();
          }
        }, 30000); // 30 second timeout

        const res = await callAiAnalysis(item.id, processedImageUri);

        // Clear timeout on successful completion
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Check if component is still mounted and request wasn't aborted
        if (isMountedRef.current && !abortController.signal.aborted) {
          const newAnalysis = res?.analysis || res?.data?.analysis || res?.data;
          setAnalysis(newAnalysis);
          if (res?.cloudinary?.url) {
            setProcessedImageUri(res.cloudinary.url);
          }
        }
      } catch (e) {
        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Only handle error if component is still mounted and request wasn't aborted
        if (isMountedRef.current && !abortController.signal.aborted) {
          setAnalysis(prevAnalysis);
          warnInDev('Analysis failed:', e);
        }
      } finally {
        // Clean up abort controller
        if (analysisAbortControllerRef.current === abortController) {
          analysisAbortControllerRef.current = null;
        }

        if (isMountedRef.current) {
          setAnalyzing(false);
        }
      }
    }, [analyzing, item.id, processedImageUri, analysis]);

    return (
      <TouchableOpacity
        ref={ref}
        style={[styles.container, style]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Wardrobe item: ${item.name}`}
        accessibilityHint="Tap to view details, long press for options"
      >
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

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Toggle favorite"
            accessibilityHint="Tap to add or remove from favorites"
          >
            <Text style={styles.favoriteIcon}>{'\u2661'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Brand Label */}
          {item.brand && (
            <View style={styles.brandContainer}>
              <Text style={styles.brandLabel}>{item.brand}</Text>
            </View>
          )}

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Price Display */}
          {item.purchasePrice && <Text style={styles.price}>${item.purchasePrice}</Text>}

          <Pressable
            accessibilityLabel="Analyze item"
            onPress={handleAnalyze}
            disabled={analyzing}
            style={styles.analyzeButton}
          >
            {analyzing ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.analyzeText}>Analyze</Text>
            )}
          </Pressable>

          <View style={styles.details}>
            <Text style={styles.category}>{item.category}</Text>

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
                  style={[styles.colorDot, { backgroundColor: color || '#CCCCCC' }]}
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
        <Modal
          transparent
          visible={showModal}
          onRequestClose={useCallback(() => {
            if (isMountedRef.current) {
              setShowModal(false);
            }
          }, [])}
          animationType="fade"
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={useCallback(() => {
              if (isMountedRef.current) {
                setShowModal(false);
              }
            }, [])}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>AI Analysis</Text>
              <Text style={styles.modalLine}>Main: {analysis?.mainCategory || '-'}</Text>
              <Text style={styles.modalLine}>Sub: {analysis?.subCategory || '-'}</Text>
              <Text style={styles.modalLine}>
                Tags: {(analysis?.detectedTags || []).join(', ') || '-'}
              </Text>
              <View style={styles.colorRow}>
                {(analysis?.dominantColors || []).slice(0, 4).map((c: string) => (
                  <View
                    key={c}
                    accessibilityLabel={`Color ${c}`}
                    style={[styles.colorSwatch, { backgroundColor: c }]}
                  />
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  analyzeButton: {
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.terracotta[500],
    borderRadius: DesignSystem.borderRadius.md,
    elevation: 2,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: DesignSystem.colors.terracotta[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  analyzeText: {
    color: DesignSystem.colors.text.inverse,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 12,
    fontWeight: '600',
  },
  brand: {
    color: DesignSystem.colors.text.tertiary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 11,
  },
  brandContainer: {
    alignSelf: 'flex-start',
    backgroundColor: DesignSystem.colors.terracotta[50],
    borderRadius: DesignSystem.borderRadius.sm,
    marginBottom: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 4,
  },
  brandLabel: {
    color: DesignSystem.colors.terracotta[600],
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  category: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 12,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  colorDot: {
    borderColor: DesignSystem.colors.warmNeutral[300],
    borderRadius: 7,
    borderWidth: 1,
    height: 14,
    marginRight: 6,
    width: 14,
  },
  colorRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  colorSwatch: { borderColor: '#ddd', borderRadius: 10, borderWidth: 1, height: 20, width: 20 },
  colorsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.card,
    borderRadius: DesignSystem.borderRadius.xl,
    elevation: 8,
    marginBottom: DesignSystem.spacing.md,
    overflow: 'hidden',
    shadowColor: DesignSystem.colors.terracotta[800],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  content: {
    padding: DesignSystem.spacing.lg,
  },
  details: {
    marginBottom: 8,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: DesignSystem.borderRadius.round,
    elevation: 3,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: DesignSystem.spacing.sm,
    shadowColor: DesignSystem.colors.terracotta[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: DesignSystem.spacing.sm,
    width: 36,
  },
  favoriteIcon: {
    color: DesignSystem.colors.text.tertiary,
    fontSize: 18,
  },
  favoriteIconActive: {
    color: DesignSystem.colors.terracotta[500],
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  imageContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalLine: { fontSize: 14, marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  moreColors: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 10,
    marginLeft: 2,
  },
  name: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.headline,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: DesignSystem.spacing.xs,
  },
  placeholderImage: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.warmNeutral[100],
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  placeholderText: {
    color: DesignSystem.colors.text.tertiary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 12,
  },
  price: {
    color: DesignSystem.colors.terracotta[600],
    fontFamily: DesignSystem.typography.fontFamily.headline,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.sm,
  },
  tag: {
    backgroundColor: DesignSystem.colors.warmNeutral[100],
    borderRadius: DesignSystem.borderRadius.sm,
    marginBottom: 2,
    marginRight: 4,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 10,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

WardrobeItem.displayName = 'WardrobeItem';

export default WardrobeItem;
