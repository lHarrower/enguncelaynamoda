// Personal Sanctuary - AI Service
// Provides outfit generation, wardrobe insights, and mood-based styling

import { ClothingItem, Outfit, MoodTag, WardrobeStats, AynaInsight, getColorCompatibility, getCategoryCompatibility } from '../data/sanctuaryModels';

export class AynaAIService {
  private static outfitCounter = 0; // Add counter for unique IDs

  private static whispers: Record<MoodTag, string[]> = {
    'Serene & Grounded': [
      'Today calls for your inner peace to shine through.',
      'Let your calm confidence speak volumes.',
      'Embrace the quiet strength within you.',
      'Your grounded energy is your superpower.',
      'Find beauty in simplicity today.'
    ],
    'Luminous & Confident': [
      'You are radiant, inside and out.',
      'Step into your power with grace.',
      'Your confidence lights up every room.',
      'Shine bright, beautiful soul.',
      'Today is your moment to dazzle.'
    ],
    'Creative & Inspired': [
      'Your creativity knows no bounds.',
      'Express your unique vision boldly.',
      'Art flows through everything you touch.',
      'Let your imagination lead the way.',
      'Your creative spirit is infectious.'
    ],
    'Joyful & Playful': [
      'Life is meant to be celebrated.',
      'Your joy is contagious and beautiful.',
      'Play with fashion, play with life.',
      'Embrace the lightness of being.',
      'Your smile is your best accessory.'
    ],
    'Elegant & Refined': [
      'Grace is your natural state.',
      'Sophistication flows through you effortlessly.',
      'Timeless beauty never goes out of style.',
      'Your elegance speaks before you do.',
      'Refined taste is your signature.'
    ],
    'Bold & Adventurous': [
      'Adventure awaits your fearless spirit.',
      'Break boundaries with style.',
      'Your boldness inspires others.',
      'Take risks, make statements.',
      'Courage looks beautiful on you.'
    ]
  };

  private static generateUniqueId(): string {
    this.outfitCounter += 1;
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `outfit-${timestamp}-${random}-${this.outfitCounter}`;
  }

  static generateOutfit(wardrobe: ClothingItem[], mood: MoodTag): Outfit | null {
    if (wardrobe.length < 2) return null;

    // Filter items based on mood preferences
    const moodCompatibleItems = this.filterByMood(wardrobe, mood);
    
    if (moodCompatibleItems.length < 2) {
      // Fall back to all items if mood filtering is too restrictive
      return this.generateBasicOutfit(wardrobe, mood);
    }

    return this.generateBasicOutfit(moodCompatibleItems, mood);
  }

  private static filterByMood(wardrobe: ClothingItem[], mood: MoodTag): ClothingItem[] {
    const moodColorPrefs: Record<MoodTag, string[]> = {
      'Serene & Grounded': ['Beige', 'White', 'Gray', 'Brown', 'Green'],
      'Luminous & Confident': ['White', 'Gold', 'Silver', 'Navy', 'Red'],
      'Creative & Inspired': ['Purple', 'Orange', 'Yellow', 'Green', 'Pink'],
      'Joyful & Playful': ['Pink', 'Yellow', 'Orange', 'Blue', 'Red'],
      'Elegant & Refined': ['Black', 'White', 'Navy', 'Gray', 'Beige'],
      'Bold & Adventurous': ['Red', 'Black', 'Purple', 'Orange', 'Green']
    };

    const preferredColors = moodColorPrefs[mood];
    
    return wardrobe.filter(item => 
      item.colors.some(color => preferredColors.includes(color))
    );
  }

  private static generateBasicOutfit(items: ClothingItem[], mood: MoodTag): Outfit {
    const outfit: ClothingItem[] = [];
    const usedCategories = new Set<string>();

    // Try to get one item from each major category
    const priorities = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
    
    for (const category of priorities) {
      const categoryItems = items.filter(item => 
        item.category === category && !outfit.includes(item)
      );
      
      if (categoryItems.length > 0) {
        // Score items based on compatibility with existing outfit
        const scoredItems = categoryItems.map(item => ({
          item,
          score: this.calculateItemScore(item, outfit)
        }));
        
        scoredItems.sort((a, b) => b.score - a.score);
        const bestItem = scoredItems[0].item;
        
        outfit.push(bestItem);
        usedCategories.add(category);
        
        // Stop at 4-5 items for a complete outfit
        if (outfit.length >= 4) break;
      }
    }

    // Ensure we have at least 2 items
    if (outfit.length < 2) {
      const remainingItems = items.filter(item => !outfit.includes(item));
      if (remainingItems.length > 0) {
        outfit.push(remainingItems[0]);
      }
    }

    return {
      id: this.generateUniqueId(),
      name: this.generateOutfitName(outfit, mood),
      items: outfit,
      moodTag: mood,
      whisper: this.getRandomWhisper(mood),
      createdAt: new Date(),
      isFavorite: false,
      confidenceScore: this.calculateOutfitConfidence(outfit)
    };
  }

  private static calculateItemScore(item: ClothingItem, existingOutfit: ClothingItem[]): number {
    if (existingOutfit.length === 0) return Math.random();

    let score = 0;
    
    for (const existingItem of existingOutfit) {
      // Color compatibility
      const colorScore = Math.max(
        ...item.colors.map(color1 =>
          Math.max(...existingItem.colors.map(color2 => 
            getColorCompatibility(color1, color2)
          ))
        )
      );
      
      // Category compatibility
      const categoryScore = getCategoryCompatibility(item.category, existingItem.category);
      
      score += (colorScore * 0.7) + (categoryScore * 0.3);
    }

    return score / existingOutfit.length;
  }

  private static generateOutfitName(items: ClothingItem[], mood: MoodTag): string {
    const moodAdjectives: Record<MoodTag, string[]> = {
      'Serene & Grounded': ['Peaceful', 'Calm', 'Zen', 'Tranquil'],
      'Luminous & Confident': ['Radiant', 'Brilliant', 'Glowing', 'Luminous'],
      'Creative & Inspired': ['Artistic', 'Imaginative', 'Expressive', 'Inspired'],
      'Joyful & Playful': ['Cheerful', 'Vibrant', 'Playful', 'Bright'],
      'Elegant & Refined': ['Sophisticated', 'Graceful', 'Polished', 'Refined'],
      'Bold & Adventurous': ['Daring', 'Fearless', 'Bold', 'Adventurous']
    };

    const adjectives = moodAdjectives[mood];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const mainCategory = items[0]?.category || 'Look';
    return `${randomAdjective} ${mainCategory} Look`;
  }

  private static getRandomWhisper(mood: MoodTag): string {
    const whispers = this.whispers[mood];
    return whispers[Math.floor(Math.random() * whispers.length)];
  }

  private static calculateOutfitConfidence(items: ClothingItem[]): number {
    if (items.length === 0) return 5;
    
    const avgItemConfidence = items.reduce((sum, item) => sum + item.confidenceScore, 0) / items.length;
    const completenessBonus = Math.min(items.length / 4, 1) * 2; // Bonus for complete outfits
    
    return Math.min(10, avgItemConfidence + completenessBonus);
  }

  static generateDailyOutfits(wardrobe: ClothingItem[], count: number = 3): Outfit[] {
    const moods: MoodTag[] = ['Serene & Grounded', 'Luminous & Confident', 'Creative & Inspired'];
    const outfits: Outfit[] = [];

    for (let i = 0; i < count && i < moods.length; i++) {
      const outfit = this.generateOutfit(wardrobe, moods[i]);
      if (outfit) {
        outfits.push(outfit);
      }
    }

    return outfits;
  }

  static calculateWardrobeStats(wardrobe: ClothingItem[]): WardrobeStats {
    const categoryCounts: Record<string, number> = {};
    const colorDistribution: Record<string, number> = {};
    let totalWearCount = 0;
    let totalConfidenceScore = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let recentlyWornCount = 0;

    for (const item of wardrobe) {
      // Category counts
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      
      // Color distribution
      item.colors.forEach(color => {
        colorDistribution[color] = (colorDistribution[color] || 0) + 1;
      });
      
      // Utilization tracking
      totalWearCount += item.wearCount;
      if (item.lastWorn && item.lastWorn > thirtyDaysAgo) {
        recentlyWornCount++;
      }
      
      // Confidence tracking
      totalConfidenceScore += item.confidenceScore;
    }

    return {
      totalItems: wardrobe.length,
      categoryCounts,
      colorDistribution,
      utilizationRate: wardrobe.length > 0 ? (recentlyWornCount / wardrobe.length) * 100 : 0,
      averageConfidenceScore: wardrobe.length > 0 ? totalConfidenceScore / wardrobe.length : 0
    };
  }

  static generateInsights(wardrobe: ClothingItem[], stats: WardrobeStats): AynaInsight[] {
    const insights: AynaInsight[] = [];

    // Forgotten treasures
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const forgottenItems = wardrobe.filter(item => 
      !item.lastWorn || item.lastWorn < thirtyDaysAgo
    );

    if (forgottenItems.length > 0) {
      const randomForgotten = forgottenItems[Math.floor(Math.random() * forgottenItems.length)];
      insights.push({
        id: `forgotten-${randomForgotten.id}`,
        type: 'forgotten_treasure',
        title: 'Rediscover a Hidden Gem',
        message: `Your ${randomForgotten.name} is waiting to shine again. Sometimes the pieces we forget hold the most magic.`,
        actionable: true,
        relatedItems: [randomForgotten.id]
      });
    }

    // Color harmony insights
    const dominantColors = Object.entries(stats.colorDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);

    if (dominantColors.length >= 2) {
      insights.push({
        id: `color-harmony-${Date.now()}`,
        type: 'color_harmony',
        title: 'Your Color Story',
        message: `${dominantColors[0]} and ${dominantColors[1]} create beautiful harmony in your wardrobe. These colors reflect your sophisticated taste.`,
        actionable: false
      });
    }

    // Confidence boost
    const highConfidenceItems = wardrobe.filter(item => item.confidenceScore >= 8);
    if (highConfidenceItems.length > 0) {
      insights.push({
        id: `confidence-boost-${Date.now()}`,
        type: 'confidence_boost',
        title: 'Your Power Pieces',
        message: `You have ${highConfidenceItems.length} pieces that make you feel absolutely radiant. Trust in their magic.`,
        actionable: true,
        relatedItems: highConfidenceItems.map(item => item.id)
      });
    }

    return insights;
  }
}

export default AynaAIService; 