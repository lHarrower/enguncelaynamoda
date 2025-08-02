import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import { OutfitRecommendation } from '@/types/aynaMirror';
import { OutfitRecommendationCard } from '@/components/aynaMirror/OutfitRecommendationCard';

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

  return (
    <Animated.View style={[styles.content, contentAnimatedStyle]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recommendationsContainer(dimensions)}>
          {recommendations.map((recommendation, index) => (
            <OutfitRecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              isSelected={selectedRecommendation?.id === recommendation.id}
              onPress={() => onRecommendationSelect(recommendation)}
              animationDelay={index * 100}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xxxl,
  },
  recommendationsContainer: (dimensions: { cardSpacing: number }) => ({
    gap: dimensions.cardSpacing,
    marginBottom: DesignSystem.spacing.xxl,
  }),
});