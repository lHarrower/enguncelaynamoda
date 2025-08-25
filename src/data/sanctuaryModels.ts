// AYNAMODA Sanctuary Data Models - Production Ready
// Complete data structures for the "Confidence as a Service" platform

export type MoodTag =
  | 'Serene & Grounded'
  | 'Luminous & Confident'
  | 'Creative & Inspired'
  | 'Joyful & Playful'
  | 'Elegant & Refined'
  | 'Bold & Adventurous';

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'intimates';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageUrl: string;
  colors: string[];
  notes?: string;
  lastWorn?: Date;
  brand?: string;
  dateAdded: Date;
  wearCount: number;
  confidenceScore: number; // 1-10 scale
  tags?: string[];
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
  isArchived?: boolean;
  isFavorite?: boolean; // Added for luxury like functionality
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  moodTag: MoodTag;
  whisper: string; // AI-generated encouragement
  confidenceScore: number; // 1-10 scale
  isFavorite?: boolean; // CRITICAL FIX: Added missing property
  createdAt?: Date;
  lastWorn?: Date;
  wearCount?: number;
  notes?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface WardrobeStats {
  totalItems: number;
  recentlyWorn: number;
  forgottenTreasures: number;
  averageConfidence: number;
  mostUsedCategory: ClothingCategory | undefined;
  colorHarmony: string[];
}

export interface UserPreferences {
  reducedMotion: boolean;
  hapticFeedback: boolean;
  preferredMoods: MoodTag[];
  notifications: {
    outfitSuggestions: boolean;
    forgottenItems: boolean;
    confidenceBoosts: boolean;
  };
}

// Helper functions for data manipulation
export const getColorCompatibility = (colors1: string[], colors2: string[]): number => {
  const commonColors = colors1.filter((color) => colors2.includes(color));
  return commonColors.length / Math.max(colors1.length, colors2.length);
};

export const getCategoryCompatibility = (
  category1: ClothingCategory,
  category2: ClothingCategory,
): number => {
  const compatibilityMatrix: Record<ClothingCategory, ClothingCategory[]> = {
    tops: ['bottoms', 'dresses', 'outerwear', 'accessories'],
    bottoms: ['tops', 'outerwear', 'shoes', 'accessories'],
    dresses: ['outerwear', 'shoes', 'accessories'],
    outerwear: ['tops', 'bottoms', 'dresses', 'shoes', 'accessories'],
    shoes: ['tops', 'bottoms', 'dresses', 'outerwear', 'accessories'],
    accessories: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes'],
    intimates: ['tops', 'bottoms', 'dresses'],
  };

  return compatibilityMatrix[category1]?.includes(category2) ? 1 : 0;
};

export const calculateOutfitConfidence = (items: ClothingItem[]): number => {
  if (items.length === 0) {
    return 0;
  }

  const itemConfidenceSum = items.reduce((sum, item) => sum + item.confidenceScore, 0);
  const averageItemConfidence = itemConfidenceSum / items.length;

  // Bonus for color harmony
  const colorHarmonyBonus =
    items.length > 1
      ? items.reduce((harmony, item, index) => {
          if (index === 0) {
            return harmony;
          }
          const base = items[0];
          if (!base) {
            return harmony;
          }
          return harmony + getColorCompatibility(base.colors, item.colors);
        }, 0) /
        (items.length - 1)
      : 0;

  // Bonus for category compatibility
  const categoryBonus =
    items.length > 1
      ? items.reduce((compatibility, item, index) => {
          if (index === 0) {
            return compatibility;
          }
          const base = items[0];
          if (!base) {
            return compatibility;
          }
          return compatibility + getCategoryCompatibility(base.category, item.category);
        }, 0) /
        (items.length - 1)
      : 0;

  return Math.min(10, averageItemConfidence + colorHarmonyBonus + categoryBonus);
};

export const isOutfitComplete = (outfit: Outfit): boolean => {
  const hasTop = outfit.items.some((item) => ['tops', 'dresses'].includes(item.category));
  const hasBottom = outfit.items.some((item) => ['bottoms', 'dresses'].includes(item.category));
  const hasShoes = outfit.items.some((item) => item.category === 'shoes');

  return hasTop && hasBottom && hasShoes;
};

export const getSeasonalRecommendations = (
  season: 'spring' | 'summer' | 'fall' | 'winter',
): ClothingCategory[] => {
  const seasonalPriorities: Record<string, ClothingCategory[]> = {
    spring: ['tops', 'bottoms', 'outerwear', 'accessories'],
    summer: ['tops', 'bottoms', 'dresses', 'accessories'],
    fall: ['outerwear', 'tops', 'bottoms', 'accessories'],
    winter: ['outerwear', 'tops', 'bottoms', 'accessories'],
  };

  return seasonalPriorities[season] || [];
};
