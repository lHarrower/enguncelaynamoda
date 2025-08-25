// Test Data Builders - central helpers to produce valid domain objects for strict types
import { IntelligenceService } from '@/services/intelligenceService';
import { OutfitFeedback, OutfitRecommendation, WardrobeItem } from '@/types/aynaMirror';

export function buildWardrobeItem(overrides: Partial<WardrobeItem> = {}): WardrobeItem {
  return IntelligenceService.buildWardrobeItem(overrides);
}

export function buildOutfitRecommendation(
  overrides: Partial<OutfitRecommendation> = {},
): OutfitRecommendation {
  const baseItems: WardrobeItem[] =
    overrides.items && overrides.items.length
      ? overrides.items.map((i) => i)
      : [
          buildWardrobeItem({ category: 'tops', id: 'w_top' }),
          buildWardrobeItem({ category: 'bottoms', id: 'w_bottom' }),
        ];
  return {
    id: overrides.id ?? `rec_${Date.now()}`,
    dailyRecommendationId: overrides.dailyRecommendationId ?? 'daily_1',
    items: baseItems,
    confidenceNote: overrides.confidenceNote ?? 'Great match today!',
    quickActions: overrides.quickActions ?? [
      { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
    ],
    confidenceScore: overrides.confidenceScore ?? 0.85,
    reasoning: overrides.reasoning ?? ['Color harmony', 'High past confidence'],
    isQuickOption: overrides.isQuickOption ?? true,
    createdAt: overrides.createdAt ?? new Date(),
    selectedAt: overrides.selectedAt,
  };
}

export function buildOutfitFeedback(overrides: Partial<OutfitFeedback> = {}): OutfitFeedback {
  return {
    id: overrides.id ?? `feedback_${Date.now()}`,
    userId: overrides.userId ?? 'test-user',
    outfitRecommendationId: overrides.outfitRecommendationId ?? overrides.outfitId ?? 'rec_1',
    outfitId: overrides.outfitId,
    confidenceRating: overrides.confidenceRating ?? 4,
    emotionalResponse: overrides.emotionalResponse ?? {
      primary: 'confident',
      intensity: 5,
      additionalEmotions: [],
    },
    socialFeedback: overrides.socialFeedback,
    occasion: overrides.occasion,
    comfort: overrides.comfort ?? { physical: 4, emotional: 4, confidence: 5 },
    timestamp: overrides.timestamp ?? new Date(),
  };
}

export const testBuilders = { buildWardrobeItem, buildOutfitRecommendation, buildOutfitFeedback };
