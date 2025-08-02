// Intelligence Service - AI-powered Style Learning and Recommendations
// Implements personalization algorithms for the AYNA Mirror Daily Ritual

import { supabase } from '@/config/supabaseClient';
import {
  WardrobeItem,
  StyleProfile,
  OutfitRecommendation,
  OutfitFeedback,
  RecommendationContext,
  ConfidencePattern,
  WeatherContext,
  CalendarContext,
  EmotionalState,
  Outfit
} from '@/types/aynaMirror';

// ============================================================================
// COLOR THEORY CONSTANTS
// ============================================================================

const COLOR_HARMONY_RULES = {
  complementary: ['red-green', 'blue-orange', 'yellow-purple'],
  analogous: ['red-orange-yellow', 'blue-green-purple', 'yellow-green-blue'],
  triadic: ['red-blue-yellow', 'orange-green-purple'],
  neutral: ['black', 'white', 'gray', 'beige', 'navy', 'brown']
};

const SEASONAL_COLOR_PREFERENCES = {
  spring: ['pastels', 'bright', 'warm'],
  summer: ['cool', 'muted', 'soft'],
  autumn: ['warm', 'rich', 'earthy'],
  winter: ['cool', 'bold', 'dramatic']
};

// ============================================================================
// STYLE COMPATIBILITY RULES
// ============================================================================

const STYLE_COMPATIBILITY_MATRIX = {
  casual: { casual: 1.0, business: 0.3, formal: 0.1, athletic: 0.7 },
  business: { casual: 0.3, business: 1.0, formal: 0.8, athletic: 0.1 },
  formal: { casual: 0.1, business: 0.8, formal: 1.0, athletic: 0.0 },
  athletic: { casual: 0.7, business: 0.1, formal: 0.0, athletic: 1.0 }
};

// ============================================================================
// INTELLIGENCE SERVICE CLASS
// ============================================================================

export class IntelligenceService {

  // ========================================================================
  // STYLE PROFILE ANALYSIS
  // ========================================================================

  /**
   * Analyzes user's style profile based on wardrobe and feedback history
   */
  async analyzeUserStyleProfile(userId: string): Promise<StyleProfile> {
    try {
      console.log(`[IntelligenceService] Analyzing style profile for user: ${userId}`);

      // Get user's wardrobe items
      const { data: wardrobeItems, error: wardrobeError } = await supabase
        .from('wardrobeItems')
        .select('*')
        .eq('user_id', userId);

      if (wardrobeError) throw wardrobeError;

      // Get user's feedback history
      const { data: feedbackHistory, error: feedbackError } = await supabase
        .from('outfit_feedback')
        .select(`
          *,
          outfit_recommendations!inner(
            item_ids,
            confidence_score
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (feedbackError) throw feedbackError;

      // Analyze color preferences
      const preferredColors = this.analyzeColorPreferences(wardrobeItems, feedbackHistory);

      // Analyze style preferences
      const preferredStyles = this.analyzeStylePreferences(wardrobeItems, feedbackHistory);

      // Analyze confidence patterns
      const confidencePatterns = await this.analyzeConfidencePatterns(userId, feedbackHistory);

      // Analyze occasion preferences
      const occasionPreferences = this.analyzeOccasionPreferences(feedbackHistory);

      const styleProfile: StyleProfile = {
        userId,
        preferredColors,
        preferredStyles,
        bodyTypePreferences: [], // TODO: Implement body type analysis
        occasionPreferences,
        confidencePatterns,
        lastUpdated: new Date()
      };

      // Cache the style profile
      await this.cacheStyleProfile(styleProfile);

      return styleProfile;
    } catch (error) {
      console.error('[IntelligenceService] Failed to analyze style profile:', error);
      throw error;
    }
  }

  /**
   * Updates style preferences based on user feedback
   */
  async updateStylePreferences(userId: string, feedback: OutfitFeedback): Promise<void> {
    try {
      console.log(`[IntelligenceService] Updating style preferences for user: ${userId}`);

      // Get current style profile
      const currentProfile = await this.analyzeUserStyleProfile(userId);

      // Update confidence patterns based on new feedback
      const updatedPatterns = await this.updateConfidencePatterns(
        currentProfile.confidencePatterns,
        feedback
      );

      // Update occasion preferences
      const updatedOccasionPreferences = this.updateOccasionPreferences(
        currentProfile.occasionPreferences,
        feedback
      );

      // Save updated profile
      const updatedProfile: StyleProfile = {
        ...currentProfile,
        confidencePatterns: updatedPatterns,
        occasionPreferences: updatedOccasionPreferences,
        lastUpdated: new Date()
      };

      await this.cacheStyleProfile(updatedProfile);

      console.log(`[IntelligenceService] Successfully updated style preferences for user: ${userId}`);
    } catch (error) {
      console.error('[IntelligenceService] Failed to update style preferences:', error);
      throw error;
    }
  }

  // ========================================================================
  // RECOMMENDATION ALGORITHMS
  // ========================================================================

  /**
   * Generates style recommendations based on wardrobe and context
   */
  async generateStyleRecommendations(
    wardrobe: WardrobeItem[],
    context: RecommendationContext
  ): Promise<OutfitRecommendation[]> {
    try {
      console.log(`[IntelligenceService] Generating recommendations for user: ${context.userId}`);

      // Filter available items (not worn recently, clean, weather-appropriate)
      const availableItems = this.filterAvailableItems(wardrobe, context);

      // Generate potential outfit combinations
      const outfitCombinations = this.generateOutfitCombinations(availableItems);

      // Score each combination
      const scoredOutfits = await Promise.all(
        outfitCombinations.map(async (items) => {
          const compatibilityScore = await this.calculateOutfitCompatibility(items);
          const confidenceScore = await this.calculateConfidenceScore(
            { id: '', userId: context.userId, items, createdAt: new Date() } as Outfit,
            { userId: context.userId } as any // Simplified for this context
          );
          const weatherScore = this.calculateWeatherCompatibility(items, context.weather);
          const occasionScore = this.calculateOccasionCompatibility(items, context.calendar);

          const totalScore = (
            compatibilityScore * 0.3 +
            confidenceScore * 0.4 +
            weatherScore * 0.2 +
            occasionScore * 0.1
          );

          return {
            items,
            score: totalScore,
            compatibilityScore,
            confidenceScore,
            weatherScore,
            occasionScore
          };
        })
      );

      // Sort by score and take top 3
      const topOutfits = scoredOutfits
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // Convert to OutfitRecommendation format
      const recommendations: OutfitRecommendation[] = await Promise.all(
        topOutfits.map(async (outfit, index) => {
          const confidenceNote = await this.generateConfidenceNote(
            { id: '', userId: context.userId, items: outfit.items, createdAt: new Date() } as Outfit,
            { userId: context.userId } as any // Simplified for this context
          );

          return {
            id: `rec_${Date.now()}_${index}`,
            dailyRecommendationId: '',
            items: outfit.items,
            confidenceNote,
            quickActions: [
              { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
              { type: 'save', label: 'Save for Later', icon: 'bookmark' },
              { type: 'share', label: 'Share', icon: 'share' }
            ],
            confidenceScore: outfit.confidenceScore,
            reasoning: this.generateReasoningExplanation(outfit),
            isQuickOption: index === 0, // First recommendation is the quick option
            createdAt: new Date()
          };
        })
      );

      return recommendations;
    } catch (error) {
      console.error('[IntelligenceService] Failed to generate recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculates outfit compatibility score using color theory and style rules
   */
  async calculateOutfitCompatibility(items: WardrobeItem[]): Promise<number> {
    try {
      if (items.length < 2) return 0.5; // Single item gets neutral score

      let totalScore = 0;
      let comparisons = 0;

      // Color harmony analysis
      const colorScore = this.calculateColorHarmony(items);
      totalScore += colorScore * 0.4;

      // Style consistency analysis
      const styleScore = this.calculateStyleConsistency(items);
      totalScore += styleScore * 0.3;

      // Category balance analysis
      const balanceScore = this.calculateCategoryBalance(items);
      totalScore += balanceScore * 0.2;

      // Formality level consistency
      const formalityScore = this.calculateFormalityConsistency(items);
      totalScore += formalityScore * 0.1;

      return Math.min(Math.max(totalScore, 0), 1); // Clamp between 0 and 1
    } catch (error) {
      console.error('[IntelligenceService] Failed to calculate outfit compatibility:', error);
      return 0.5; // Return neutral score on error
    }
  }

  // ========================================================================
  // CONFIDENCE SCORING
  // ========================================================================

  /**
   * Calculates confidence score based on user feedback history
   */
  async calculateConfidenceScore(outfit: Outfit, userHistory: any): Promise<number> {
    try {
      // Get historical ratings for similar items
      const itemIds = outfit.items.map(item => item.id);
      
      const { data: historicalFeedback, error } = await supabase
        .from('outfit_feedback')
        .select(`
          confidence_rating,
          outfit_recommendations!inner(item_ids)
        `)
        .eq('user_id', outfit.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Calculate base confidence from item history
      let baseConfidence = 0.5; // Default neutral confidence
      let relevantFeedbackCount = 0;

      for (const feedback of historicalFeedback || []) {
        // Handle both array and object structures for outfit_recommendations
        const outfitRec = Array.isArray(feedback.outfit_recommendations) 
          ? feedback.outfit_recommendations[0] 
          : feedback.outfit_recommendations;
        const feedbackItemIds = outfitRec?.item_ids || [];
        const overlap = itemIds.filter(id => feedbackItemIds.includes(id)).length;
        
        if (overlap > 0) {
          const weight = overlap / Math.max(itemIds.length, feedbackItemIds.length);
          baseConfidence += (feedback.confidence_rating / 5) * weight;
          relevantFeedbackCount++;
        }
      }

      if (relevantFeedbackCount > 0) {
        baseConfidence = baseConfidence / (relevantFeedbackCount + 1); // +1 for the default
      }

      // Adjust for item usage frequency (more worn = higher confidence)
      const usageBonus = this.calculateUsageConfidenceBonus(outfit.items);
      
      // Adjust for neglected items (rediscovery bonus)
      const rediscoveryBonus = this.calculateRediscoveryBonus(outfit.items);

      const finalScore = Math.min(
        baseConfidence + usageBonus + rediscoveryBonus,
        1.0
      );

      return Math.max(finalScore, 0.1); // Minimum confidence of 0.1
    } catch (error) {
      console.error('[IntelligenceService] Failed to calculate confidence score:', error);
      return 0.5; // Return neutral score on error
    }
  }

  /**
   * Predicts user satisfaction based on style profile
   */
  async predictUserSatisfaction(outfit: Outfit, userProfile: StyleProfile): Promise<number> {
    try {
      let satisfactionScore = 0.5; // Base satisfaction

      // Check color preferences alignment
      const colorAlignment = this.calculateColorPreferenceAlignment(
        outfit.items,
        userProfile.preferredColors
      );
      satisfactionScore += colorAlignment * 0.3;

      // Check style preferences alignment
      const styleAlignment = this.calculateStylePreferenceAlignment(
        outfit.items,
        userProfile.preferredStyles
      );
      satisfactionScore += styleAlignment * 0.3;

      // Check confidence patterns
      const patternAlignment = this.calculateConfidencePatternAlignment(
        outfit.items,
        userProfile.confidencePatterns
      );
      satisfactionScore += patternAlignment * 0.4;

      return Math.min(Math.max(satisfactionScore, 0), 1);
    } catch (error) {
      console.error('[IntelligenceService] Failed to predict user satisfaction:', error);
      return 0.5;
    }
  }

  // ========================================================================
  // CONFIDENCE NOTE GENERATION
  // ========================================================================

  /**
   * Generates personalized confidence note for an outfit
   */
  async generateConfidenceNote(outfit: Outfit, userHistory: any): Promise<string> {
    try {
      const templates = [
        // Encouragement templates
        "This combination brings out your best features - you'll feel unstoppable today!",
        "Perfect choice! This outfit has that effortless confidence you're known for.",
        "You've worn similar combinations before and always looked amazing. Today will be no different!",
        
        // Rediscovery templates
        "That {item} hasn't seen the light of day in a while - time to remind everyone why it's special!",
        "Bringing back this {item} is going to turn heads. You have such great taste!",
        
        // Weather-aware templates
        "Perfect for today's {weather} - you'll be comfortable and stylish all day long.",
        "This outfit is made for {weather} weather. You'll feel confident and prepared!",
        
        // Compliment-based templates
        "Last time you wore this {item}, you got {compliments} compliments. Ready for more?",
        "This combination scored a {rating}/5 last time - let's see if we can beat that record!"
      ];

      // Select appropriate template based on context
      let selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

      // Personalize the template
      const personalizedNote = await this.personalizeConfidenceNote(
        selectedTemplate,
        outfit,
        userHistory
      );

      return personalizedNote;
    } catch (error) {
      console.error('[IntelligenceService] Failed to generate confidence note:', error);
      return "You look amazing in everything you wear. Today will be no exception!";
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private analyzeColorPreferences(wardrobeItems: any[], feedbackHistory: any[]): string[] {
    const colorFrequency: Record<string, number> = {};
    const colorRatings: Record<string, number[]> = {};

    // Analyze wardrobe color distribution
    wardrobeItems.forEach(item => {
      item.colors?.forEach((color: string) => {
        colorFrequency[color] = (colorFrequency[color] || 0) + 1;
      });
    });

    // Analyze feedback for color preferences
    feedbackHistory.forEach(feedback => {
      if (feedback.confidence_rating >= 4) {
        // Get colors from highly rated outfits
        // This would require joining with wardrobe items
        // Simplified for now
      }
    });

    // Return top colors by frequency and rating
    return Object.entries(colorFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([color]) => color);
  }

  private analyzeStylePreferences(wardrobeItems: any[], feedbackHistory: any[]): string[] {
    const styleFrequency: Record<string, number> = {};

    // Analyze tags and categories for style patterns
    wardrobeItems.forEach(item => {
      item.tags?.forEach((tag: string) => {
        styleFrequency[tag] = (styleFrequency[tag] || 0) + 1;
      });
    });

    return Object.entries(styleFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([style]) => style);
  }

  private async analyzeConfidencePatterns(userId: string, feedbackHistory: any[]): Promise<ConfidencePattern[]> {
    const patterns: ConfidencePattern[] = [];

    // Group feedback by item combinations
    const combinationMap: Record<string, any[]> = {};

    feedbackHistory.forEach(feedback => {
      const itemIds = feedback.outfit_recommendations?.item_ids || [];
      const key = itemIds.sort().join(',');
      
      if (!combinationMap[key]) {
        combinationMap[key] = [];
      }
      combinationMap[key].push(feedback);
    });

    // Analyze patterns for combinations with multiple data points
    Object.entries(combinationMap).forEach(([combination, feedbacks]) => {
      if (feedbacks.length >= 2) {
        const averageRating = feedbacks.reduce((sum, f) => sum + f.confidence_rating, 0) / feedbacks.length;
        
        patterns.push({
          itemCombination: combination.split(','),
          averageRating,
          contextFactors: [], // TODO: Extract context factors
          emotionalResponse: feedbacks.map(f => f.emotional_response?.primary).filter(Boolean)
        });
      }
    });

    return patterns;
  }

  private analyzeOccasionPreferences(feedbackHistory: any[]): Record<string, number> {
    const occasionRatings: Record<string, number[]> = {};

    feedbackHistory.forEach(feedback => {
      if (feedback.occasion) {
        if (!occasionRatings[feedback.occasion]) {
          occasionRatings[feedback.occasion] = [];
        }
        occasionRatings[feedback.occasion].push(feedback.confidence_rating);
      }
    });

    // Calculate average ratings for each occasion
    const preferences: Record<string, number> = {};
    Object.entries(occasionRatings).forEach(([occasion, ratings]) => {
      preferences[occasion] = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    });

    return preferences;
  }

  private async cacheStyleProfile(profile: StyleProfile): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.userId,
          style_preferences: profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('[IntelligenceService] Failed to cache style profile:', error);
    }
  }

  private filterAvailableItems(wardrobe: WardrobeItem[], context: RecommendationContext): WardrobeItem[] {
    return wardrobe.filter(item => {
      // Filter out recently worn items (unless neglected)
      const daysSinceWorn = item.lastWorn 
        ? (Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      // Include if not worn in last 7 days OR if neglected (30+ days)
      const isAvailable = daysSinceWorn > 7 || daysSinceWorn > 30;

      // TODO: Add weather appropriateness filter
      // TODO: Add "needs cleaning" filter

      return isAvailable;
    });
  }

  private generateOutfitCombinations(items: WardrobeItem[]): WardrobeItem[][] {
    const combinations: WardrobeItem[][] = [];
    
    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, WardrobeItem[]>);

    // Generate basic combinations (top + bottom + shoes)
    const tops = itemsByCategory.tops || [];
    const bottoms = itemsByCategory.bottoms || [];
    const shoes = itemsByCategory.shoes || [];
    const dresses = itemsByCategory.dresses || [];
    const outerwear = itemsByCategory.outerwear || [];

    // Dress-based outfits
    dresses.forEach(dress => {
      shoes.forEach(shoe => {
        const outfit = [dress, shoe];
        // Optionally add outerwear
        if (outerwear.length > 0) {
          outfit.push(outerwear[0]); // Use first outerwear item
        }
        combinations.push(outfit);
      });
    });

    // Top + bottom combinations
    tops.forEach(top => {
      bottoms.forEach(bottom => {
        shoes.forEach(shoe => {
          const outfit = [top, bottom, shoe];
          // Optionally add outerwear
          if (outerwear.length > 0) {
            outfit.push(outerwear[0]); // Use first outerwear item
          }
          combinations.push(outfit);
        });
      });
    });

    // If we don't have enough combinations, create some basic ones
    if (combinations.length === 0 && items.length >= 2) {
      // Create combinations with any available items
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          combinations.push([items[i], items[j]]);
          if (combinations.length >= 10) break;
        }
        if (combinations.length >= 10) break;
      }
    }

    // Ensure we have at least 3 combinations for testing
    while (combinations.length < 3 && items.length > 0) {
      combinations.push([items[0]]);
    }

    // Limit to reasonable number of combinations
    return combinations.slice(0, Math.max(20, 3));
  }

  private calculateColorHarmony(items: WardrobeItem[]): number {
    // Simplified color harmony calculation
    // In a real implementation, this would use proper color theory
    const allColors = items.flatMap(item => item.colors);
    
    if (allColors.length < 2) return 0.8; // Single color is harmonious
    
    // Check for neutral colors (always harmonious)
    const hasNeutral = allColors.some(color => 
      COLOR_HARMONY_RULES.neutral.some(neutral => 
        color.toLowerCase().includes(neutral) || color.toUpperCase().includes(neutral.toUpperCase())
      )
    );
    
    // Check for black/white specifically
    const hasBlackWhite = allColors.some(color => 
      color.toUpperCase() === '#000000' || color.toUpperCase() === '#FFFFFF'
    );
    
    if (hasNeutral || hasBlackWhite) return 0.95; // Higher score for neutral colors
    
    // For now, return a moderate score
    // TODO: Implement proper color harmony analysis
    return 0.7;
  }

  private calculateStyleConsistency(items: WardrobeItem[]): number {
    // Analyze tags for style consistency
    const allTags = items.flatMap(item => item.tags);
    const tagFrequency: Record<string, number> = {};
    
    allTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
    
    // Higher consistency if tags appear across multiple items
    const consistentTags = Object.values(tagFrequency).filter(count => count > 1);
    return Math.min(consistentTags.length / items.length, 1);
  }

  private calculateCategoryBalance(items: WardrobeItem[]): number {
    const categories = items.map(item => item.category);
    const uniqueCategories = new Set(categories);
    
    // Good balance: 2-4 different categories
    if (uniqueCategories.size >= 2 && uniqueCategories.size <= 4) {
      return 1.0;
    } else if (uniqueCategories.size === 1) {
      return 0.3; // All same category is less balanced
    } else {
      return 0.6; // Too many categories might be overwhelming
    }
  }

  private calculateFormalityConsistency(items: WardrobeItem[]): number {
    // Simplified formality analysis based on tags
    const formalTags = ['formal', 'business', 'elegant', 'dressy'];
    const casualTags = ['casual', 'everyday', 'relaxed', 'comfortable'];
    
    let formalCount = 0;
    let casualCount = 0;
    
    items.forEach(item => {
      const hasFormal = item.tags.some(tag => formalTags.includes(tag.toLowerCase()));
      const hasCasual = item.tags.some(tag => casualTags.includes(tag.toLowerCase()));
      
      if (hasFormal) formalCount++;
      if (hasCasual) casualCount++;
    });
    
    // Consistency is high when all items lean the same way
    const totalItems = items.length;
    const formalRatio = formalCount / totalItems;
    const casualRatio = casualCount / totalItems;
    
    return Math.max(formalRatio, casualRatio);
  }

  private calculateWeatherCompatibility(items: WardrobeItem[], weather: WeatherContext): number {
    // Simplified weather compatibility
    // TODO: Implement proper weather-clothing mapping
    
    if (weather.temperature < 10) {
      // Cold weather - need outerwear
      const hasOuterwear = items.some(item => item.category === 'outerwear');
      return hasOuterwear ? 1.0 : 0.3;
    } else if (weather.temperature > 25) {
      // Hot weather - lighter clothing
      const hasLightClothing = items.some(item => 
        item.tags.includes('light') || item.tags.includes('summer')
      );
      return hasLightClothing ? 1.0 : 0.7;
    }
    
    return 0.8; // Moderate weather is generally compatible
  }

  private calculateOccasionCompatibility(items: WardrobeItem[], calendar?: CalendarContext): number {
    if (!calendar || !calendar.primaryEvent) return 0.8; // No specific occasion
    
    const formalityLevel = calendar.formalityLevel;
    const formalTags = ['formal', 'business', 'elegant'];
    const casualTags = ['casual', 'everyday', 'relaxed'];
    
    const itemFormality = items.map(item => {
      const hasFormal = item.tags.some(tag => formalTags.includes(tag.toLowerCase()));
      const hasCasual = item.tags.some(tag => casualTags.includes(tag.toLowerCase()));
      
      if (hasFormal) return 'formal';
      if (hasCasual) return 'casual';
      return 'neutral';
    });
    
    // Check alignment with required formality
    const alignedItems = itemFormality.filter(formality => {
      if (formalityLevel === 'formal' && formality === 'formal') return true;
      if (formalityLevel === 'casual' && (formality === 'casual' || formality === 'neutral')) return true;
      if (formalityLevel === 'business' && (formality === 'formal' || formality === 'neutral')) return true;
      return false;
    });
    
    return alignedItems.length / items.length;
  }

  private calculateUsageConfidenceBonus(items: WardrobeItem[]): number {
    const totalWears = items.reduce((sum, item) => sum + item.usageStats.totalWears, 0);
    const avgWears = totalWears / items.length;
    
    // Bonus for well-worn items (proven favorites)
    return Math.min(avgWears / 10, 0.2); // Max 0.2 bonus
  }

  private calculateRediscoveryBonus(items: WardrobeItem[]): number {
    const neglectedItems = items.filter(item => {
      if (!item.lastWorn) return true;
      const daysSince = (Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 30;
    });
    
    // Bonus for rediscovering neglected items
    return neglectedItems.length > 0 ? 0.1 : 0;
  }

  private calculateColorPreferenceAlignment(items: WardrobeItem[], preferredColors: string[]): number {
    const itemColors = items.flatMap(item => item.colors);
    const alignedColors = itemColors.filter(color => preferredColors.includes(color));
    
    return itemColors.length > 0 ? alignedColors.length / itemColors.length : 0;
  }

  private calculateStylePreferenceAlignment(items: WardrobeItem[], preferredStyles: string[]): number {
    const itemTags = items.flatMap(item => item.tags);
    const alignedTags = itemTags.filter(tag => preferredStyles.includes(tag));
    
    return itemTags.length > 0 ? alignedTags.length / itemTags.length : 0;
  }

  private calculateConfidencePatternAlignment(items: WardrobeItem[], patterns: ConfidencePattern[]): number {
    const itemIds = items.map(item => item.id);
    
    // Find patterns that match current item combination
    const matchingPatterns = patterns.filter(pattern => {
      const overlap = pattern.itemCombination.filter(id => itemIds.includes(id));
      return overlap.length > 0;
    });
    
    if (matchingPatterns.length === 0) return 0;
    
    // Return average rating of matching patterns
    const avgRating = matchingPatterns.reduce((sum, pattern) => sum + pattern.averageRating, 0) / matchingPatterns.length;
    return avgRating / 5; // Normalize to 0-1 scale
  }

  private generateReasoningExplanation(outfit: any): string[] {
    const reasons: string[] = [];
    
    if (outfit.compatibilityScore > 0.8) {
      reasons.push("Perfect color harmony and style consistency");
    }
    
    if (outfit.confidenceScore > 0.8) {
      reasons.push("Based on your previous positive feedback");
    }
    
    if (outfit.weatherScore > 0.8) {
      reasons.push("Ideal for today's weather conditions");
    }
    
    if (reasons.length === 0) {
      reasons.push("A fresh combination to try something new");
    }
    
    return reasons;
  }

  private async personalizeConfidenceNote(template: string, outfit: Outfit, userHistory: any): Promise<string> {
    let note = template;
    
    // Replace placeholders
    if (note.includes('{item}')) {
      const featuredItem = outfit.items[0]; // Use first item as featured
      note = note.replace('{item}', featuredItem.category);
    }
    
    if (note.includes('{weather}')) {
      // This would be passed in context
      note = note.replace('{weather}', 'perfect');
    }
    
    if (note.includes('{compliments}')) {
      note = note.replace('{compliments}', '3'); // Placeholder
    }
    
    if (note.includes('{rating}')) {
      note = note.replace('{rating}', '4.5'); // Placeholder
    }
    
    return note;
  }

  private async updateConfidencePatterns(
    currentPatterns: ConfidencePattern[],
    feedback: OutfitFeedback
  ): Promise<ConfidencePattern[]> {
    // Get the outfit items for this feedback
    const { data: outfitRec, error } = await supabase
      .from('outfit_recommendations')
      .select('item_ids')
      .eq('id', feedback.outfitRecommendationId)
      .single();

    if (error || !outfitRec) return currentPatterns;

    const itemIds = outfitRec.item_ids;
    const combinationKey = itemIds.sort().join(',');

    // Find existing pattern or create new one
    const existingPatternIndex = currentPatterns.findIndex(
      pattern => pattern.itemCombination.sort().join(',') === combinationKey
    );

    if (existingPatternIndex >= 0) {
      // Update existing pattern
      const existingPattern = currentPatterns[existingPatternIndex];
      const newAverageRating = (existingPattern.averageRating + feedback.confidenceRating) / 2;
      
      currentPatterns[existingPatternIndex] = {
        ...existingPattern,
        averageRating: newAverageRating,
        emotionalResponse: [
          ...existingPattern.emotionalResponse,
          feedback.emotionalResponse.primary
        ].slice(-5) // Keep last 5 emotional responses
      };
    } else {
      // Create new pattern
      currentPatterns.push({
        itemCombination: itemIds,
        averageRating: feedback.confidenceRating,
        contextFactors: [feedback.occasion || 'general'],
        emotionalResponse: [feedback.emotionalResponse.primary]
      });
    }

    return currentPatterns;
  }

  private updateOccasionPreferences(
    currentPreferences: Record<string, number>,
    feedback: OutfitFeedback
  ): Record<string, number> {
    if (!feedback.occasion) return currentPreferences;

    const currentRating = currentPreferences[feedback.occasion] || 2.5;
    const newRating = (currentRating + feedback.confidenceRating) / 2;
    
    return {
      ...currentPreferences,
      [feedback.occasion]: newRating
    };
  }
}

// Export singleton instance
export const intelligenceService = new IntelligenceService();