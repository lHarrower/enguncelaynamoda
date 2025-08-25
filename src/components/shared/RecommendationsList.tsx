import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
// AYNAMODA Color Palette
const COLORS = {
  primary: '#8B6F47',
  secondary: '#B8A082',
  background: '#F5F1E8',
  surface: '#FFFFFF',
  text: '#2C2C2C',
  textLight: '#B8A082',
  border: '#E8DCC6',
  accent: '#D4AF37',
};
import { OutfitRecommendationCard } from '@/components/aynaMirror/OutfitRecommendationCard';
import { OutfitRecommendation } from '@/types/aynaMirror';

interface RecommendationsListProps {
  recommendations: OutfitRecommendation[];
  selectedRecommendation: OutfitRecommendation | null;
  onRecommendationSelect: (recommendation: OutfitRecommendation) => void;
  contentTranslateY: Animated.SharedValue<number>;
  dimensions: {
    cardSpacing: number;
  };
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  selectedRecommendation,
  onRecommendationSelect,
  contentTranslateY,
  dimensions,
}) => {
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const renderRecommendation: ListRenderItem<OutfitRecommendation> = useCallback(
    ({ item: recommendation, index }) => (
      <OutfitRecommendationCard
        recommendation={recommendation}
        isSelected={selectedRecommendation?.id === recommendation.id}
        onSelect={() => onRecommendationSelect(recommendation)}
        showInlineActions={false}
        showConfidenceNote={false}
        a11yLabelPrefix={
          selectedRecommendation?.id === recommendation.id
            ? 'Outfit recommendation'
            : 'Recommendation'
        }
        animationDelay={index * 100}
      />
    ),
    [selectedRecommendation?.id, onRecommendationSelect],
  );

  const keyExtractor = useCallback((item: OutfitRecommendation) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<OutfitRecommendation> | null | undefined, index: number) => ({
      length: 200, // Estimated item height
      offset: 200 * index + dimensions.cardSpacing * index,
      index,
    }),
    [dimensions.cardSpacing],
  );

  return (
    <Animated.View style={[styles.content, contentAnimatedStyle]}>
      <FlatList
        data={recommendations}
        renderItem={renderRecommendation}
        keyExtractor={keyExtractor}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
        // Memory optimization
        disableVirtualization={false}
        legacyImplementation={false}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={{ height: dimensions.cardSpacing }} />}
        // Prevent nested VirtualizedList warnings
        nestedScrollEnabled={true}
        scrollEnabled={true}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
  },
});

const recommendationsContainer = (dimensions: { cardSpacing: number }) => ({
  gap: dimensions.cardSpacing,
  marginBottom: 32,
});
