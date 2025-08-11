// AYNA Mirror Types - Barrel Export
// Centralized export for all AYNA Mirror related types

export * from '@/types/aynaMirror';
export * from '@/types/wardrobe';
export * from '@/types/user';

// Re-export commonly used types for convenience
export type {
  WardrobeItem,
  DailyRecommendations,
  OutfitRecommendation,
  OutfitFeedback,
  UserPreferences,
  WeatherContext,
  StyleProfile,
  RecommendationContext,
  UsageStats,
  UtilizationStats
} from '@/types/aynaMirror';