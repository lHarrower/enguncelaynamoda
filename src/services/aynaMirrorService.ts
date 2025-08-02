// AYNA Mirror Service - Core Daily Ritual Orchestrator
import { supabase } from '@/config/supabaseClient';
import { 
  DailyRecommendations,
  OutfitRecommendation,
  RecommendationContext,
  WeatherContext,
  CalendarContext,
  OutfitFeedback,
  UserPreferences,
  WardrobeItem
} from '@/types/aynaMirror';
import { EnhancedWardrobeService, enhancedWardrobeService } from '@/services/enhancedWardrobeService';
import { IntelligenceService } from '@/services/intelligenceService';
import { WeatherService } from '@/services/weatherService';
import { errorHandlingService } from '@/services/errorHandlingService';
import { PerformanceOptimizationService } from '@/services/performanceOptimizationService';

/**
 * AYNA Mirror Service - The heart of the confidence-building daily ritual
 * 
 * This service orchestrates the complete daily recommendation flow:
 * 1. Generate personalized outfit recommendations at 6 AM
 * 2. Consider weather, calendar, and user preferences
 * 3. Create confidence-building notes for each recommendation
 * 4. Learn from user feedback to improve future recommendations
 */
export class AynaMirrorService {
  private static intelligenceService = new IntelligenceService();

  // ============================================================================
  // CORE DAILY RITUAL METHODS
  // ============================================================================

  /**
   * Generate daily outfit recommendations for a user
   * This is the main entry point for the 6 AM daily ritual
   */
  static async generateDailyRecommendations(userId: string): Promise<DailyRecommendations> {
    return await errorHandlingService.executeWithRetry(
      async () => {
        console.log('[AynaMirrorService] Generating daily recommendations for user:', userId);

        // Try to get cached recommendations first using performance optimization service
        const cachedRecommendations = await PerformanceOptimizationService.getCachedRecommendations(userId);
        if (cachedRecommendations && this.isCacheValid(cachedRecommendations.generatedAt)) {
          console.log('[AynaMirrorService] Using cached recommendations');
          return cachedRecommendations;
        }

        // Get user's wardrobe and preferences with error handling
        const [wardrobe, preferences] = await Promise.all([
          this.getWardrobeWithFallback(userId),
          this.getUserPreferencesWithFallback(userId)
        ]);

        // Get context information with error handling
        const context = await this.buildRecommendationContextWithFallback(userId, preferences);

        // Generate 3 outfit recommendations with AI fallback
        const recommendations = await this.createOutfitRecommendationsWithFallback(wardrobe, context);

        // Create daily recommendations record
        const dailyRecommendations: DailyRecommendations = {
          id: crypto.randomUUID(),
          userId,
          date: new Date(),
          recommendations,
          weatherContext: context.weather,
          calendarContext: context.calendar,
          generatedAt: new Date()
        };

        // Save to database and cache
        await Promise.all([
          this.saveDailyRecommendations(dailyRecommendations),
          errorHandlingService.cacheRecommendations(userId, dailyRecommendations),
          errorHandlingService.cacheWardrobeData(userId, wardrobe)
        ]);

        console.log('[AynaMirrorService] Successfully generated daily recommendations');
        return dailyRecommendations;
      },
      {
        service: 'aynaMirror',
        operation: 'generateDailyRecommendations',
        userId
      },
      {
        maxRetries: 2,
        enableOfflineMode: true
      }
    );
  }

  /**
   * Schedule the next mirror session (6 AM notification)
   */
  static async scheduleNextMirrorSession(userId: string): Promise<void> {
    try {
      // TODO: Integrate with notification service
      // This will be implemented in task 5 (notification service)
      console.log('[AynaMirrorService] Scheduling next mirror session for user:', userId);
    } catch (error) {
      console.error('[AynaMirrorService] Failed to schedule next mirror session:', error);
      throw error;
    }
  }

  // ============================================================================
  // ERROR HANDLING AND FALLBACK METHODS
  // ============================================================================

  /**
   * Check if cached data is still valid
   */
  private static isCacheValid(timestamp: Date): boolean {
    const cacheAge = Date.now() - timestamp.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return cacheAge < maxAge;
  }

  /**
   * Get wardrobe with fallback to cached data
   */
  private static async getWardrobeWithFallback(userId: string): Promise<WardrobeItem[]> {
    try {
      return await enhancedWardrobeService.getUserWardrobe(userId);
    } catch (error) {
      console.warn('[AynaMirrorService] Failed to get wardrobe, trying cache:', error);
      const cachedWardrobe = await errorHandlingService.getCachedWardrobeData(userId);
      if (cachedWardrobe) {
        return cachedWardrobe;
      }
      throw new Error('Unable to get wardrobe data');
    }
  }

  /**
   * Get user preferences with fallback to defaults
   */
  private static async getUserPreferencesWithFallback(userId: string): Promise<UserPreferences> {
    try {
      return await this.getUserPreferences(userId);
    } catch (error) {
      console.warn('[AynaMirrorService] Failed to get preferences, using defaults:', error);
      return this.getDefaultUserPreferences(userId);
    }
  }

  /**
   * Build recommendation context with error handling
   */
  private static async buildRecommendationContextWithFallback(
    userId: string, 
    preferences: UserPreferences
  ): Promise<RecommendationContext> {
    try {
      return await this.buildRecommendationContext(userId, preferences);
    } catch (error) {
      console.warn('[AynaMirrorService] Failed to build context, using fallback:', error);
      
      // Get weather with fallback
      const weather = await errorHandlingService.handleWeatherServiceError(userId);
      
      return {
        userId,
        date: new Date(),
        weather,
        calendar: undefined, // Skip calendar if unavailable
        userPreferences: preferences,
        styleProfile: {
          userId,
          preferredColors: [],
          preferredStyles: [],
          bodyTypePreferences: [],
          occasionPreferences: {},
          confidencePatterns: [],
          lastUpdated: new Date()
        }
      };
    }
  }

  /**
   * Create outfit recommendations with AI fallback
   */
  private static async createOutfitRecommendationsWithFallback(
    wardrobe: WardrobeItem[],
    context: RecommendationContext
  ): Promise<OutfitRecommendation[]> {
    try {
      return await this.createOutfitRecommendations(wardrobe, context);
    } catch (error) {
      console.warn('[AynaMirrorService] AI recommendations failed, using rule-based fallback:', error);
      return await errorHandlingService.handleAIServiceError(wardrobe, context.weather, context.userId);
    }
  }

  /**
   * Get default user preferences
   */
  private static getDefaultUserPreferences(userId: string): UserPreferences {
    return {
      userId,
      notificationTime: new Date('2024-01-01T06:00:00'),
      timezone: 'UTC',
      stylePreferences: {
        userId,
        preferredColors: [],
        preferredStyles: [],
        bodyTypePreferences: [],
        occasionPreferences: {},
        confidencePatterns: [],
        lastUpdated: new Date()
      },
      privacySettings: {
        shareData: false,
        personalizedAds: false,
        analytics: true
      },
      engagementHistory: {
        totalSessions: 0,
        averageRating: 0,
        lastActive: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================

  /**
   * Create outfit recommendations based on wardrobe and context
   * Uses AI-powered intelligence service for personalized recommendations
   */
  private static async createOutfitRecommendations(
    wardrobe: WardrobeItem[],
    context: RecommendationContext
  ): Promise<OutfitRecommendation[]> {
    try {
      console.log('[AynaMirrorService] Creating AI-powered outfit recommendations');

      // Use intelligence service to generate personalized recommendations
      const aiRecommendations = await this.intelligenceService.generateStyleRecommendations(
        wardrobe,
        context
      );

      // If AI service returns recommendations, use them
      if (aiRecommendations && aiRecommendations.length > 0) {
        console.log(`[AynaMirrorService] Generated ${aiRecommendations.length} AI recommendations`);
        
        // Rank and select the best recommendations
        const rankedRecommendations = await this.rankAndSelectRecommendations(
          aiRecommendations,
          context
        );
        
        // Enhance AI recommendations with personalized confidence notes
        const enhancedRecommendations = await Promise.all(
          rankedRecommendations.map(async (rec, index) => {
            const personalizedNote = await this.generatePersonalizedConfidenceNote(
              { items: rec.items },
              context
            );

            return {
              ...rec,
              dailyRecommendationId: '', // Will be set when saving
              confidenceNote: personalizedNote,
              quickActions: [
                { type: 'wear' as const, label: 'Wear This', icon: 'checkmark-circle' },
                { type: 'save' as const, label: 'Save for Later', icon: 'bookmark' },
                { type: 'share' as const, label: 'Share', icon: 'share' }
              ],
              isQuickOption: index === 0, // First recommendation is the quick option
              createdAt: new Date()
            };
          })
        );

        return enhancedRecommendations;
      }

      // Fallback to rule-based recommendations if AI service fails
      console.log('[AynaMirrorService] Falling back to rule-based recommendations');
      return await this.createFallbackRecommendations(wardrobe, context);

    } catch (error) {
      console.error('[AynaMirrorService] Failed to create outfit recommendations:', error);
      // Fallback to basic recommendations on error
      return await this.createFallbackRecommendations(wardrobe, context);
    }
  }

  /**
   * Create fallback recommendations using rule-based logic
   */
  private static async createFallbackRecommendations(
    wardrobe: WardrobeItem[],
    context: RecommendationContext
  ): Promise<OutfitRecommendation[]> {
    const recommendations: OutfitRecommendation[] = [];

    // Generate 3 different outfit styles
    const styles = ['casual', 'professional', 'creative'];
    
    for (let i = 0; i < 3; i++) {
      const style = styles[i];
      const outfit = await this.generateOutfitForStyle(wardrobe, context, style);
      
      if (outfit) {
        recommendations.push({
          id: crypto.randomUUID(),
          dailyRecommendationId: '', // Will be set when saving
          items: outfit.items,
          confidenceNote: await this.generateConfidenceNote(outfit, context, style),
          quickActions: [
            { type: 'wear' as const, label: 'Wear This', icon: 'checkmark-circle' },
            { type: 'save' as const, label: 'Save for Later', icon: 'bookmark' },
            { type: 'share' as const, label: 'Share', icon: 'share' }
          ],
          confidenceScore: this.calculateBasicConfidenceScore(outfit.items),
          reasoning: this.generateReasoningForOutfit(outfit.items, context),
          isQuickOption: i === 0, // First recommendation is the quick option
          createdAt: new Date()
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate an outfit for a specific style
   */
  private static async generateOutfitForStyle(
    wardrobe: WardrobeItem[],
    context: RecommendationContext,
    style: string
  ): Promise<{ items: WardrobeItem[] } | null> {
    try {
      // Basic outfit generation logic
      // This will be enhanced with AI in task 3
      
      const availableItems = wardrobe.filter(item => 
        this.isItemAppropriateForWeather(item, context.weather)
      );

      if (availableItems.length < 2) {
        return null; // Not enough items for an outfit
      }

      // Simple outfit composition: top + bottom + optional accessories
      const tops = availableItems.filter(item => item.category === 'tops');
      const bottoms = availableItems.filter(item => item.category === 'bottoms');
      const shoes = availableItems.filter(item => item.category === 'shoes');
      const accessories = availableItems.filter(item => item.category === 'accessories');

      const outfit: WardrobeItem[] = [];

      // Add a top
      if (tops.length > 0) {
        const selectedTop = this.selectItemByStyle(tops, style);
        if (selectedTop) outfit.push(selectedTop);
      }

      // Add bottoms
      if (bottoms.length > 0) {
        const selectedBottom = this.selectItemByStyle(bottoms, style);
        if (selectedBottom) outfit.push(selectedBottom);
      }

      // Add shoes if available
      if (shoes.length > 0) {
        const selectedShoes = this.selectItemByStyle(shoes, style);
        if (selectedShoes) outfit.push(selectedShoes);
      }

      // Add an accessory occasionally
      if (accessories.length > 0 && Math.random() > 0.5) {
        const selectedAccessory = this.selectItemByStyle(accessories, style);
        if (selectedAccessory) outfit.push(selectedAccessory);
      }

      return outfit.length >= 2 ? { items: outfit } : null;

    } catch (error) {
      console.error('[AynaMirrorService] Failed to generate outfit for style:', style, error);
      return null;
    }
  }

  /**
   * Select an item that matches the desired style
   */
  private static selectItemByStyle(items: WardrobeItem[], style: string): WardrobeItem | null {
    // Prioritize items that haven't been worn recently
    const neglectedItems = items.filter(item => {
      if (!item.lastWorn) return true;
      const daysSince = Math.floor((Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 7;
    });

    const candidateItems = neglectedItems.length > 0 ? neglectedItems : items;
    
    // For now, select randomly from candidates
    // This will be enhanced with style matching in task 3
    return candidateItems[Math.floor(Math.random() * candidateItems.length)] || null;
  }

  /**
   * Check if an item is appropriate for current weather
   * Uses WeatherService for sophisticated weather analysis
   */
  private static isItemAppropriateForWeather(item: WardrobeItem, weather: WeatherContext): boolean {
    try {
      // Use WeatherService for sophisticated weather appropriateness analysis
      const appropriatenessScore = WeatherService.analyzeWeatherAppropriatenessForItem(
        { category: item.category, tags: item.tags },
        weather
      );
      
      // Consider item appropriate if score is above threshold
      return appropriatenessScore >= 0.4;
    } catch (error) {
      console.error('[AynaMirrorService] Failed to analyze weather appropriateness:', error);
      
      // Fallback to basic logic
      const temp = weather.temperature;
      
      switch (item.category) {
        case 'outerwear':
          return temp < 60; // Fahrenheit
        case 'activewear':
          return weather.condition === 'sunny' || item.tags.includes('indoor');
        case 'shoes':
          return weather.condition !== 'rainy' || item.tags.includes('waterproof');
        default:
          return true; // Most items are weather-neutral
      }
    }
  }

  // ============================================================================
  // OUTFIT RANKING AND SELECTION
  // ============================================================================

  /**
   * Rank and select the best recommendations based on multiple criteria
   */
  private static async rankAndSelectRecommendations(
    recommendations: OutfitRecommendation[],
    context: RecommendationContext
  ): Promise<OutfitRecommendation[]> {
    try {
      console.log(`[AynaMirrorService] Ranking ${recommendations.length} recommendations`);

      // Calculate comprehensive scores for each recommendation
      const scoredRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          // Get AI-powered compatibility score
          const compatibilityScore = await this.intelligenceService.calculateOutfitCompatibility(rec.items);
          
          // Get AI-powered confidence score
          const aiConfidenceScore = await this.intelligenceService.calculateConfidenceScore(
            { 
              id: rec.id, 
              userId: context.userId, 
              items: rec.items, 
              createdAt: new Date() 
            } as any,
            { userId: context.userId } as any
          );

          // Calculate user satisfaction prediction
          const satisfactionScore = await this.intelligenceService.predictUserSatisfaction(
            { 
              id: rec.id, 
              userId: context.userId, 
              items: rec.items, 
              createdAt: new Date() 
            } as any,
            context.styleProfile
          );

          // Calculate contextual relevance (weather, calendar, etc.)
          const contextualScore = this.calculateContextualRelevance(rec.items, context);

          // Calculate novelty score (balance between familiar and new combinations)
          const noveltyScore = await this.calculateNoveltyScore(rec.items, context.userId);

          // Weighted final score
          const finalScore = (
            compatibilityScore * 0.25 +      // Style compatibility
            aiConfidenceScore * 0.30 +       // User confidence prediction
            satisfactionScore * 0.25 +       // User satisfaction prediction
            contextualScore * 0.15 +         // Weather/calendar relevance
            noveltyScore * 0.05              // Novelty factor
          );

          return {
            ...rec,
            confidenceScore: finalScore,
            ranking: {
              compatibilityScore,
              aiConfidenceScore,
              satisfactionScore,
              contextualScore,
              noveltyScore,
              finalScore
            }
          };
        })
      );

      // Sort by final score and select top 3
      const rankedRecommendations = scoredRecommendations
        .sort((a, b) => b.ranking.finalScore - a.ranking.finalScore)
        .slice(0, 3);

      // Ensure diversity in the final selection
      const diverseRecommendations = this.ensureRecommendationDiversity(rankedRecommendations);

      console.log(`[AynaMirrorService] Selected ${diverseRecommendations.length} top recommendations`);
      return diverseRecommendations;

    } catch (error) {
      console.error('[AynaMirrorService] Failed to rank recommendations:', error);
      // Return original recommendations if ranking fails
      return recommendations.slice(0, 3);
    }
  }

  /**
   * Calculate contextual relevance score based on weather, calendar, etc.
   */
  private static calculateContextualRelevance(items: WardrobeItem[], context: RecommendationContext): number {
    let score = 0.5; // Base score

    // Weather appropriateness
    const weatherScore = this.calculateWeatherAppropriatenesScore(items, context.weather);
    score += weatherScore * 0.4;

    // Calendar/occasion appropriateness
    if (context.calendar) {
      const occasionScore = this.calculateOccasionAppropriatenessScore(items, context.calendar);
      score += occasionScore * 0.3;
    }

    // Time of day appropriateness
    const timeScore = this.calculateTimeAppropriatenessScore(items, context.date);
    score += timeScore * 0.3;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Calculate novelty score to balance familiar vs new combinations
   */
  private static async calculateNoveltyScore(items: WardrobeItem[], userId: string): Promise<number> {
    try {
      // Check if this exact combination has been worn before
      const itemIds = items.map(item => item.id).sort();
      
      const { data: previousOutfits, error } = await supabase
        .from('outfit_recommendations')
        .select('item_ids, selected_at')
        .eq('user_id', userId)
        .not('selected_at', 'is', null);

      if (error) throw error;

      // Check for exact matches
      const exactMatches = previousOutfits?.filter(outfit => {
        const outfitIds = outfit.item_ids.sort();
        return JSON.stringify(itemIds) === JSON.stringify(outfitIds);
      }) || [];

      if (exactMatches.length === 0) {
        return 0.8; // High novelty for completely new combinations
      }

      // Check how recently this combination was worn
      const mostRecentMatch = exactMatches.reduce((latest, current) => {
        return new Date(current.selected_at) > new Date(latest.selected_at) ? current : latest;
      });

      const daysSinceWorn = Math.floor(
        (Date.now() - new Date(mostRecentMatch.selected_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Higher novelty score for combinations not worn recently
      if (daysSinceWorn > 30) return 0.6;
      if (daysSinceWorn > 14) return 0.4;
      if (daysSinceWorn > 7) return 0.2;
      return 0.1; // Low novelty for recently worn combinations

    } catch (error) {
      console.error('[AynaMirrorService] Failed to calculate novelty score:', error);
      return 0.5; // Default neutral score
    }
  }

  /**
   * Ensure diversity in the final recommendation selection
   */
  private static ensureRecommendationDiversity(recommendations: any[]): OutfitRecommendation[] {
    if (recommendations.length <= 3) return recommendations;

    const diverse: any[] = [];
    const usedCategories = new Set<string>();
    const usedColors = new Set<string>();

    // First, add the highest-scoring recommendation
    diverse.push(recommendations[0]);
    recommendations[0].items.forEach((item: WardrobeItem) => {
      usedCategories.add(item.category);
      item.colors.forEach(color => usedColors.add(color));
    });

    // Then add recommendations that provide diversity
    for (let i = 1; i < recommendations.length && diverse.length < 3; i++) {
      const rec = recommendations[i];
      
      // Check if this recommendation adds diversity
      const newCategories = rec.items.filter((item: WardrobeItem) => !usedCategories.has(item.category));
      const newColors = rec.items.flatMap((item: WardrobeItem) => item.colors).filter((color: string) => !usedColors.has(color));
      
      // Add if it provides significant diversity or if we need to fill slots
      if (newCategories.length > 0 || newColors.length > 2 || diverse.length < 2) {
        diverse.push(rec);
        rec.items.forEach((item: WardrobeItem) => {
          usedCategories.add(item.category);
          item.colors.forEach(color => usedColors.add(color));
        });
      }
    }

    // Fill remaining slots if needed
    while (diverse.length < 3 && diverse.length < recommendations.length) {
      const remaining = recommendations.filter(rec => !diverse.includes(rec));
      if (remaining.length > 0) {
        diverse.push(remaining[0]);
      } else {
        break;
      }
    }

    return diverse;
  }

  /**
   * Calculate weather appropriateness score using WeatherService
   */
  private static calculateWeatherAppropriatenesScore(items: WardrobeItem[], weather: WeatherContext): number {
    try {
      // Use WeatherService to calculate overall outfit weather score
      const outfitScore = items.reduce((totalScore, item) => {
        const itemScore = WeatherService.analyzeWeatherAppropriatenessForItem(
          { category: item.category, tags: item.tags },
          weather
        );
        return totalScore + itemScore;
      }, 0);

      // Return average score across all items
      return items.length > 0 ? outfitScore / items.length : 0.5;
    } catch (error) {
      console.error('[AynaMirrorService] Failed to calculate weather appropriateness score:', error);
      
      // Fallback to basic scoring logic
      let score = 0.5;
      const temp = weather.temperature;
      const condition = weather.condition;

      // Temperature appropriateness
      const hasOuterwear = items.some(item => item.category === 'outerwear');
      const hasLightClothing = items.some(item => item.tags.includes('light') || item.tags.includes('summer'));
      const hasWarmClothing = items.some(item => item.tags.includes('warm') || item.tags.includes('winter'));

      if (temp < 50) {
        // Cold weather
        if (hasOuterwear || hasWarmClothing) score += 0.3;
        if (hasLightClothing) score -= 0.2;
      } else if (temp > 80) {
        // Hot weather
        if (hasLightClothing) score += 0.3;
        if (hasOuterwear || hasWarmClothing) score -= 0.2;
      }

      // Condition appropriateness
      switch (condition) {
        case 'rainy':
          const hasWaterproof = items.some(item => item.tags.includes('waterproof'));
          if (hasWaterproof) score += 0.2;
          break;
        case 'sunny':
          const hasSunProtection = items.some(item => item.tags.includes('sun-protection'));
          if (hasSunProtection) score += 0.1;
          break;
      }

      return Math.min(Math.max(score, 0), 1);
    }
  }

  /**
   * Calculate occasion appropriateness score
   */
  private static calculateOccasionAppropriatenessScore(items: WardrobeItem[], calendar: CalendarContext): number {
    let score = 0.5;

    const formalityLevel = calendar.formalityLevel;
    const hasFormalItems = items.some(item => 
      item.tags.some(tag => ['formal', 'business', 'elegant'].includes(tag.toLowerCase()))
    );
    const hasCasualItems = items.some(item => 
      item.tags.some(tag => ['casual', 'everyday', 'relaxed'].includes(tag.toLowerCase()))
    );

    switch (formalityLevel) {
      case 'formal':
        if (hasFormalItems) score += 0.4;
        if (hasCasualItems) score -= 0.2;
        break;
      case 'business':
        if (hasFormalItems) score += 0.3;
        if (hasCasualItems) score -= 0.1;
        break;
      case 'casual':
        if (hasCasualItems) score += 0.3;
        if (hasFormalItems) score -= 0.1;
        break;
    }

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Calculate time appropriateness score
   */
  private static calculateTimeAppropriatenessScore(items: WardrobeItem[], date: Date): number {
    const hour = date.getHours();
    let score = 0.5;

    // Morning (6-12): Professional or casual
    if (hour >= 6 && hour < 12) {
      const hasWorkAppropriate = items.some(item => 
        item.tags.some(tag => ['work', 'business', 'professional'].includes(tag.toLowerCase()))
      );
      if (hasWorkAppropriate) score += 0.2;
    }

    // Evening (18-24): More relaxed or elegant
    if (hour >= 18) {
      const hasEveningAppropriate = items.some(item => 
        item.tags.some(tag => ['evening', 'elegant', 'dressy'].includes(tag.toLowerCase()))
      );
      if (hasEveningAppropriate) score += 0.2;
    }

    return Math.min(Math.max(score, 0), 1);
  }

  // ============================================================================
  // CONFIDENCE NOTE GENERATION
  // ============================================================================

  /**
   * Generate personalized confidence note using AI intelligence
   */
  private static async generatePersonalizedConfidenceNote(
    outfit: { items: WardrobeItem[] },
    context: RecommendationContext
  ): Promise<string> {
    try {
      // Use intelligence service to generate personalized confidence note
      const aiNote = await this.intelligenceService.generateConfidenceNote(
        { 
          id: '', 
          userId: context.userId, 
          items: outfit.items, 
          createdAt: new Date() 
        } as any,
        { userId: context.userId } as any
      );

      if (aiNote && aiNote.length > 0) {
        return aiNote;
      }

      // Fallback to basic confidence note generation
      return await this.generateConfidenceNote(outfit, context, 'personalized');
    } catch (error) {
      console.error('[AynaMirrorService] Failed to generate personalized confidence note:', error);
      // Fallback to basic confidence note
      return await this.generateConfidenceNote(outfit, context, 'personalized');
    }
  }

  /**
   * Generate a confidence-building note for an outfit
   */
  static async generateConfidenceNote(
    outfit: { items: WardrobeItem[] },
    context: RecommendationContext,
    style: string
  ): Promise<string> {
    try {
      // Get user's confidence note style preference
      const noteStyle = context.userPreferences.notificationTime ? 'encouraging' : 'friendly';
      
      // Check if any items have positive history
      const highConfidenceItems = outfit.items.filter(item => 
        item.usageStats.averageRating > 4
      );

      // Check for neglected items being featured
      const neglectedItems = outfit.items.filter(item => {
        if (!item.lastWorn) return true;
        const daysSince = Math.floor((Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 30;
      });

      // Generate note based on context
      let note = '';

      if (highConfidenceItems.length > 0) {
        const item = highConfidenceItems[0];
        note = `Your ${item.colors[0] || ''} ${item.category.slice(0, -1)} always makes you shine! ✨`;
      } else if (neglectedItems.length > 0) {
        const item = neglectedItems[0];
        note = `Time to rediscover your ${item.colors[0] || ''} ${item.category.slice(0, -1)} - it's been waiting to make you feel amazing! 💫`;
      } else {
        // Default encouraging notes based on style
        switch (style) {
          case 'professional':
            note = 'This combination says "I mean business" in the most elegant way. You\'ve got this! 💼';
            break;
          case 'creative':
            note = 'Your creative spirit shines through this unique combination. Express yourself boldly! 🎨';
            break;
          default:
            note = 'This effortless combination will have you feeling comfortable and confident all day! ☀️';
        }
      }

      // Add weather context if relevant
      if (context.weather.condition === 'rainy') {
        note += ' Perfect for dancing through puddles with style!';
      } else if (context.weather.condition === 'sunny') {
        note += ' Sunshine and style - what a perfect combination!';
      }

      return note;

    } catch (error) {
      console.error('[AynaMirrorService] Failed to generate confidence note:', error);
      return 'You look amazing today! ✨';
    }
  }

  // ============================================================================
  // SCORING AND REASONING
  // ============================================================================

  /**
   * Calculate a basic confidence score for an outfit
   */
  private static calculateBasicConfidenceScore(items: WardrobeItem[]): number {
    if (items.length === 0) return 0;

    // Average the confidence scores of individual items
    const totalScore = items.reduce((sum, item) => sum + item.usageStats.averageRating, 0);
    const averageScore = totalScore / items.length;

    // Boost score for complete outfits (top + bottom + shoes)
    const hasTop = items.some(item => item.category === 'tops');
    const hasBottom = items.some(item => item.category === 'bottoms');
    const hasShoes = items.some(item => item.category === 'shoes');
    
    let completenessBonus = 0;
    if (hasTop && hasBottom) completenessBonus += 0.5;
    if (hasShoes) completenessBonus += 0.3;

    return Math.min(5, averageScore + completenessBonus);
  }

  /**
   * Generate reasoning for why this outfit was recommended
   */
  private static generateReasoningForOutfit(items: WardrobeItem[], context: RecommendationContext): string[] {
    const reasons: string[] = [];

    // Weather-based reasoning
    const temp = context.weather.temperature;
    const condition = context.weather.condition;
    
    if (temp < 50) {
      reasons.push('Perfect for cold weather - keeps you warm and stylish');
    } else if (temp < 65) {
      reasons.push('Ideal for cool weather conditions');
    } else if (temp > 80) {
      reasons.push('Light and breathable for warm weather');
    } else if (temp > 75) {
      reasons.push('Comfortable for warm temperature');
    }

    // Weather condition specific reasoning
    switch (condition) {
      case 'rainy':
        reasons.push('Weather-appropriate for rainy conditions');
        break;
      case 'sunny':
        reasons.push('Perfect for sunny weather');
        break;
      case 'cloudy':
        reasons.push('Great for overcast conditions');
        break;
      case 'windy':
        reasons.push('Suitable for windy weather');
        break;
    }

    // Item-based reasoning
    const neglectedItems = items.filter(item => {
      if (!item.lastWorn) return true;
      const daysSince = Math.floor((Date.now() - item.lastWorn.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 14;
    });

    if (neglectedItems.length > 0) {
      reasons.push('Features items you haven\'t worn recently');
    }

    // Color coordination
    const colors = items.flatMap(item => item.colors);
    const uniqueColors = Array.from(new Set(colors));
    if (uniqueColors.length <= 3) {
      reasons.push('Harmonious color palette');
    }

    // High confidence items
    const highConfidenceItems = items.filter(item => item.usageStats.averageRating > 4);
    if (highConfidenceItems.length > 0) {
      reasons.push('Includes your favorite high-confidence pieces');
    }

    return reasons;
  }

  // ============================================================================
  // CONTEXT BUILDING
  // ============================================================================

  /**
   * Build comprehensive context for recommendations
   */
  private static async buildRecommendationContext(
    userId: string,
    preferences: UserPreferences
  ): Promise<RecommendationContext> {
    try {
      // Get weather context using WeatherService
      const weather = await WeatherService.getCurrentWeatherContext(userId);
      
      // Get calendar context (placeholder for now)
      const calendar = await this.getCalendarContext(userId);

      // Get or create style profile
      const styleProfile = await this.getStyleProfile(userId);

      return {
        userId,
        date: new Date(),
        weather,
        calendar,
        userPreferences: preferences,
        styleProfile
      };

    } catch (error) {
      console.error('[AynaMirrorService] Failed to build recommendation context:', error);
      throw error;
    }
  }

  /**
   * Get weather context for recommendations
   * Integrates with WeatherService for real-time weather data
   */
  private static async getWeatherContext(userId?: string): Promise<WeatherContext> {
    try {
      return await WeatherService.getCurrentWeatherContext(userId);
    } catch (error) {
      console.error('[AynaMirrorService] Failed to get weather context:', error);
      
      // Return fallback weather context
      return {
        temperature: 72,
        condition: 'cloudy',
        humidity: 50,
        windSpeed: 5,
        location: 'Unknown',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get calendar context for recommendations
   * TODO: Integrate with calendar API
   */
  private static async getCalendarContext(userId: string): Promise<CalendarContext | undefined> {
    // Placeholder - no calendar integration yet
    return undefined;
  }

  /**
   * Get user's style profile
   * TODO: Implement in intelligence service (task 3)
   */
  private static async getStyleProfile(userId: string) {
    // Placeholder style profile
    return {
      userId,
      preferredColors: [],
      preferredStyles: [],
      bodyTypePreferences: [],
      occasionPreferences: {},
      confidencePatterns: [],
      lastUpdated: new Date()
    };
  }

  // ============================================================================
  // DATABASE OPERATIONS
  // ============================================================================

  /**
   * Save daily recommendations to database
   */
  private static async saveDailyRecommendations(recommendations: DailyRecommendations): Promise<void> {
    try {
      // Save daily recommendation record
      const { data: dailyRec, error: dailyError } = await supabase
        .from('daily_recommendations')
        .insert({
          id: recommendations.id,
          user_id: recommendations.userId,
          recommendation_date: recommendations.date.toISOString().split('T')[0],
          weather_context: recommendations.weatherContext,
          calendar_context: recommendations.calendarContext,
          generated_at: recommendations.generatedAt.toISOString()
        })
        .select()
        .single();

      if (dailyError) throw dailyError;

      // Save individual outfit recommendations
      const outfitRecords = recommendations.recommendations.map(rec => ({
        id: rec.id,
        daily_recommendation_id: recommendations.id,
        item_ids: rec.items.map(item => item.id),
        confidence_note: rec.confidenceNote,
        confidence_score: rec.confidenceScore,
        reasoning: rec.reasoning,
        is_quick_option: rec.isQuickOption,
        created_at: rec.createdAt.toISOString()
      }));

      const { error: outfitError } = await supabase
        .from('outfit_recommendations')
        .insert(outfitRecords);

      if (outfitError) throw outfitError;

    } catch (error) {
      console.error('[AynaMirrorService] Failed to save daily recommendations:', error);
      throw error;
    }
  }

  /**
   * Get user preferences, creating defaults if none exist
   */
  private static async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // Create default preferences
        const defaultPreferences = {
          user_id: userId,
          notification_time: '06:00:00',
          timezone: 'UTC',
          style_preferences: {},
          privacy_settings: {},
          engagement_history: {}
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (insertError) throw insertError;
        return this.transformPreferencesRecord(newData);
      }

      return this.transformPreferencesRecord(data);

    } catch (error) {
      console.error('[AynaMirrorService] Failed to get user preferences:', error);
      throw error;
    }
  }

  /**
   * Transform database preferences record to UserPreferences interface
   */
  private static transformPreferencesRecord(record: any): UserPreferences {
    return {
      userId: record.user_id,
      notificationTime: new Date(`1970-01-01T${record.notification_time}`),
      timezone: record.timezone,
      stylePreferences: {
        userId: record.user_id,
        preferredColors: record.style_preferences?.preferredColors || [],
        preferredStyles: record.style_preferences?.preferredStyles || [],
        bodyTypePreferences: record.style_preferences?.bodyTypePreferences || [],
        occasionPreferences: record.style_preferences?.occasionPreferences || {},
        confidencePatterns: record.style_preferences?.confidencePatterns || [],
        lastUpdated: new Date(record.updated_at)
      },
      privacySettings: {
        shareUsageData: record.privacy_settings?.shareUsageData ?? true,
        allowLocationTracking: record.privacy_settings?.allowLocationTracking ?? true,
        enableSocialFeatures: record.privacy_settings?.enableSocialFeatures ?? true,
        dataRetentionDays: record.privacy_settings?.dataRetentionDays ?? 365
      },
      engagementHistory: {
        totalDaysActive: record.engagement_history?.totalDaysActive || 0,
        streakDays: record.engagement_history?.streakDays || 0,
        averageRating: record.engagement_history?.averageRating || 0,
        lastActiveDate: record.engagement_history?.lastActiveDate 
          ? new Date(record.engagement_history.lastActiveDate) 
          : new Date(),
        preferredInteractionTimes: record.engagement_history?.preferredInteractionTimes || []
      },
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }

  // ============================================================================
  // FEEDBACK PROCESSING
  // ============================================================================

  /**
   * Process user feedback to improve future recommendations
   * TODO: Enhance with machine learning in task 3
   */
  static async processUserFeedback(feedback: OutfitFeedback): Promise<void> {
    try {
      console.log('[AynaMirrorService] Processing user feedback:', feedback);

      // Save feedback to database
      await this.saveFeedback(feedback);

      // Update user preferences based on feedback
      await this.updateUserPreferences(feedback.userId, feedback);

      // Update confidence scores for individual items
      const outfitItems = await this.getOutfitItems(feedback.outfitRecommendationId);
      for (const item of outfitItems) {
        await supabase.rpc('update_item_confidence_score', {
          item_id: item.id,
          new_rating: feedback.confidenceRating
        });
      }

    } catch (error) {
      console.error('[AynaMirrorService] Failed to process user feedback:', error);
      throw error;
    }
  }

  /**
   * Save feedback to database
   */
  private static async saveFeedback(feedback: OutfitFeedback): Promise<void> {
    const { error } = await supabase
      .from('outfit_feedback')
      .insert({
        id: feedback.id,
        user_id: feedback.userId,
        outfit_recommendation_id: feedback.outfitRecommendationId,
        confidence_rating: feedback.confidenceRating,
        emotional_response: feedback.emotionalResponse,
        social_feedback: feedback.socialFeedback,
        occasion: feedback.occasion,
        comfort_rating: feedback.comfort.confidence, // Using confidence as overall comfort
        created_at: feedback.timestamp.toISOString()
      });

    if (error) throw error;
  }

  /**
   * Update user preferences based on feedback
   */
  static async updateUserPreferences(userId: string, feedback: OutfitFeedback): Promise<void> {
    try {
      // TODO: Implement sophisticated preference learning
      // For now, just update engagement history
      
      // Get current engagement history first
      const { data: currentPrefs } = await supabase
        .from('user_preferences')
        .select('engagement_history')
        .eq('user_id', userId)
        .single();

      const currentHistory = currentPrefs?.engagement_history || {};
      const updatedHistory = {
        ...currentHistory,
        lastActiveDate: new Date().toISOString(),
        totalDaysActive: (currentHistory.totalDaysActive || 0) + 1
      };

      const { error } = await supabase
        .from('user_preferences')
        .update({
          engagement_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

    } catch (error) {
      console.error('[AynaMirrorService] Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Get items from an outfit recommendation
   */
  private static async getOutfitItems(outfitRecommendationId: string): Promise<WardrobeItem[]> {
    try {
      const { data, error } = await supabase
        .from('outfit_recommendations')
        .select('item_ids')
        .eq('id', outfitRecommendationId)
        .single();

      if (error) throw error;

      // Get the actual wardrobe items
      const { data: items, error: itemsError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .in('id', data.item_ids);

      if (itemsError) throw itemsError;

      // Transform items using the enhanced wardrobe service
      const transformedItems: WardrobeItem[] = [];
      for (const item of items) {
        // Create a temporary service instance to access transformation
        const tempService = new EnhancedWardrobeService();
        // We'll get the items through getUserWardrobe which handles transformation
        const userItems = await enhancedWardrobeService.getUserWardrobe(item.user_id);
        const matchingItem = userItems.find(ui => ui.id === item.id);
        if (matchingItem) {
          transformedItems.push(matchingItem);
        }
      }
      return transformedItems;

    } catch (error) {
      console.error('[AynaMirrorService] Failed to get outfit items:', error);
      return [];
    }
  }
}

// Export default for convenience
export default AynaMirrorService;