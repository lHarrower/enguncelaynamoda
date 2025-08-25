import { supabase } from '../config/supabaseClient';
import type { WardrobeItem } from '../services/wardrobeService';
import * as WardrobeModule from '../services/wardrobeService';
import { errorInDev } from '../utils/consoleSuppress';
import { isSupabaseOk, wrap } from '../utils/supabaseResult';

export interface ShopYourClosetRecommendation {
  id: string;
  userId: string;
  targetItem: {
    description: string;
    category: string;
    colors: string[];
    style: string;
  };
  similarOwnedItems: WardrobeItem[];
  confidenceScore: number;
  reasoning: string[];
  createdAt: Date;
}

export interface CostPerWearData {
  itemId: string;
  costPerWear: number;
  totalWears: number;
  purchasePrice: number;
  daysSincePurchase: number;
  projectedCostPerWear: number;
}

export interface RediscoveryChallenge {
  id: string;
  userId: string;
  challengeType: 'neglected_items' | 'color_exploration' | 'style_mixing';
  title: string;
  description: string;
  targetItems: WardrobeItem[];
  progress: number;
  totalItems: number;
  reward: string;
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

interface OutfitFeedback {
  confidence_rating: number;
  user_id: string;
  created_at: string;
  item_ids?: string[];
}

interface PurchaseItem {
  purchase_price?: number;
  purchase_date?: string;
}

export interface MonthlyConfidenceMetrics {
  userId: string;
  month: string;
  year: number;
  averageConfidenceRating: number;
  totalOutfitsRated: number;
  confidenceImprovement: number;
  mostConfidentItems: WardrobeItem[];
  leastConfidentItems: WardrobeItem[];
  wardrobeUtilization: number;
  costPerWearImprovement: number;
  shoppingReductionPercentage: number;
}

export interface ShoppingBehaviorData {
  userId: string;
  monthlyPurchases: number;
  previousMonthPurchases: number;
  reductionPercentage: number;
  streakDays: number;
  totalSavings: number;
  lastPurchaseDate?: Date;
}

class AntiConsumptionService {
  /**
   * Generate "Shop Your Closet First" recommendations for a potential purchase
   */
  async generateShopYourClosetRecommendations(
    userId: string,
    targetItemDescription: string,
    category: string,
    colors: string[] = [],
    style: string = '',
  ): Promise<ShopYourClosetRecommendation> {
    try {
      // Get user's wardrobe items (prefer legacy/test API if available)
      const fetchedItems =
        'getWardrobeItems' in WardrobeModule &&
        typeof WardrobeModule.getWardrobeItems === 'function'
          ? await WardrobeModule.getWardrobeItems(userId)
          : await WardrobeModule.wardrobeService.getAllItems(userId);
      const wardrobeItems: WardrobeItem[] = Array.isArray(fetchedItems) ? fetchedItems : [];

      // Find similar items in user's closet
      const similarItems = this.findSimilarItems(wardrobeItems, {
        category,
        colors,
        style,
        description: targetItemDescription,
      });

      // Calculate confidence score based on similarity
      const confidenceScore = this.calculateSimilarityConfidence(similarItems, {
        description: `${category} item in ${colors.join(', ')} with ${style} style`,
        category,
        colors,
        style,
      });

      // Generate reasoning for recommendations
      const reasoning = this.generateShopYourClosetReasoning(similarItems, {
        description: `${category} item in ${colors.join(', ')} with ${style} style`,
        category,
        colors,
        style,
      });

      const recommendation: ShopYourClosetRecommendation = {
        id: `shop_closet_${Date.now()}`,
        userId,
        targetItem: {
          description: targetItemDescription,
          category,
          colors,
          style,
        },
        similarOwnedItems: similarItems,
        confidenceScore,
        reasoning,
        createdAt: new Date(),
      };

      // Store recommendation for tracking
      await this.storeShopYourClosetRecommendation(recommendation);

      return recommendation;
    } catch (error) {
      errorInDev(
        'Error generating shop your closet recommendations:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Calculate cost-per-wear for wardrobe items
   */
  async calculateCostPerWear(itemId: string): Promise<CostPerWearData> {
    try {
      const itemQuery = supabase.from('wardrobe_items').select('*').eq('id', itemId) as any;
      const itemRes = await wrap(async () => (await itemQuery.single()) as any);
      if (!isSupabaseOk(itemRes)) {
        throw itemRes.error;
      }
      const item = itemRes.data as WardrobeItem;

      const usageQuery = supabase
        .from('outfit_feedback')
        .select('created_at')
        .contains('item_ids', [itemId]) as any;
      const usageRes = await wrap(async () => (await usageQuery) as any);
      if (!isSupabaseOk(usageRes)) {
        throw usageRes.error;
      }
      const usageData: Array<Record<string, unknown>> = Array.isArray(usageRes.data)
        ? usageRes.data
        : [];

      const totalWears = usageData?.length || 0;
      const purchasePrice = item.purchasePrice ?? 0;
      const purchaseDate = item.purchaseDate ?? new Date();
      const daysSincePurchase = Math.max(
        1,
        Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)),
      );

      const costPerWear = totalWears > 0 ? purchasePrice / totalWears : purchasePrice;

      // Project cost-per-wear based on typical usage patterns
      const projectedWears = Math.max(totalWears, Math.floor(daysSincePurchase / 30)); // Assume at least monthly wear
      const projectedCostPerWear =
        projectedWears > 0 ? purchasePrice / projectedWears : purchasePrice;

      return {
        itemId,
        costPerWear,
        totalWears,
        purchasePrice,
        daysSincePurchase,
        projectedCostPerWear,
      };
    } catch (error) {
      errorInDev(
        'Error calculating cost per wear:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Create rediscovery challenges for neglected items
   */
  async createRediscoveryChallenge(userId: string): Promise<RediscoveryChallenge | null> {
    try {
      // Get neglected items (not worn in 60+ days)
      const neglectedItems = await this.getNeglectedItems(userId, 60);

      if (neglectedItems.length === 0) {
        return null; // No challenge needed
      }

      // Determine challenge type based on neglected items
      const challengeType = this.determineChallengeType(neglectedItems);
      const challenge = this.generateChallenge(userId, challengeType, neglectedItems);

      // Store challenge in database
      const { data, error } = (await supabase
        .from('rediscovery_challenges')
        .insert([
          {
            user_id: userId,
            challenge_type: challenge.challengeType,
            title: challenge.title,
            description: challenge.description,
            target_item_ids: challenge.targetItems.map((item) => item.id),
            total_items: challenge.totalItems,
            reward: challenge.reward,
            expires_at: challenge.expiresAt.toISOString(),
          },
        ] as any)
        .select()
        .single()) as any;

      if (error) {
        throw error;
      }

      return {
        ...challenge,
        id: data.id,
        progress: 0,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      errorInDev(
        'Error creating rediscovery challenge:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Generate monthly confidence improvement metrics
   */
  async generateMonthlyConfidenceMetrics(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthlyConfidenceMetrics> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Get outfit feedback for the month
      const { data: feedbackData, error: feedbackError } = (await supabase
        .from('outfit_feedback')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())) as any;

      if (feedbackError) {
        throw feedbackError;
      }

      // Calculate metrics
      const totalOutfitsRated = feedbackData?.length || 0;
      const averageConfidenceRating =
        totalOutfitsRated > 0
          ? feedbackData.reduce(
              (sum: number, feedback: OutfitFeedback) => sum + feedback.confidence_rating,
              0,
            ) / totalOutfitsRated
          : 0;

      // Get previous month's average for improvement calculation
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
      const prevEndDate = new Date(prevYear, prevMonth, 0);

      const { data: prevFeedbackData } = (await supabase
        .from('outfit_feedback')
        .select('confidence_rating')
        .eq('user_id', userId)
        .gte('created_at', prevStartDate.toISOString())
        .lte('created_at', prevEndDate.toISOString())) as any;

      const prevAverageRating =
        prevFeedbackData && prevFeedbackData.length > 0
          ? prevFeedbackData.reduce(
              (sum: number, feedback: OutfitFeedback) => sum + feedback.confidence_rating,
              0,
            ) / prevFeedbackData.length
          : 0;

      const confidenceImprovement = averageConfidenceRating - prevAverageRating;

      // Get wardrobe utilization (prefer legacy/test API if available)
      const fetchedItems =
        'getWardrobeItems' in WardrobeModule &&
        typeof WardrobeModule.getWardrobeItems === 'function'
          ? await WardrobeModule.getWardrobeItems(userId)
          : await WardrobeModule.wardrobeService.getAllItems(userId);
      const wardrobeItems: WardrobeItem[] = Array.isArray(fetchedItems) ? fetchedItems : [];
      const usedItems = new Set();

      feedbackData?.forEach((feedback: OutfitFeedback) => {
        if (feedback.item_ids) {
          feedback.item_ids.forEach((itemId: string) => usedItems.add(itemId));
        }
      });

      const wardrobeUtilization =
        wardrobeItems.length > 0 ? (usedItems.size / wardrobeItems.length) * 100 : 0;

      // Calculate cost-per-wear improvement and shopping reduction
      const costPerWearImprovement = await this.calculateCostPerWearImprovement(
        userId,
        month,
        year,
      );
      const shoppingReductionPercentage = await this.calculateShoppingReduction(
        userId,
        month,
        year,
      );

      // Get most and least confident items
      const itemConfidenceMap = new Map();
      feedbackData?.forEach((feedback: OutfitFeedback) => {
        if (feedback.item_ids) {
          feedback.item_ids.forEach((itemId: string) => {
            if (!itemConfidenceMap.has(itemId)) {
              itemConfidenceMap.set(itemId, []);
            }
            itemConfidenceMap.get(itemId).push(feedback.confidence_rating);
          });
        }
      });

      const itemAverages = Array.from(itemConfidenceMap.entries()).map(([itemId, ratings]) => ({
        itemId,
        averageRating:
          ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length,
      }));

      itemAverages.sort((a, b) => b.averageRating - a.averageRating);

      const mostConfidentItemIds = itemAverages.slice(0, 3).map((item) => item.itemId);
      const leastConfidentItemIds = itemAverages.slice(-3).map((item) => item.itemId);

      const mostConfidentItems = wardrobeItems.filter((item: WardrobeItem) =>
        mostConfidentItemIds.includes(item.id),
      );
      const leastConfidentItems = wardrobeItems.filter((item: WardrobeItem) =>
        leastConfidentItemIds.includes(item.id),
      );

      return {
        userId,
        month: `${year}-${month.toString().padStart(2, '0')}`,
        year,
        averageConfidenceRating,
        totalOutfitsRated,
        confidenceImprovement,
        mostConfidentItems,
        leastConfidentItems,
        wardrobeUtilization,
        costPerWearImprovement,
        shoppingReductionPercentage,
      };
    } catch (error) {
      errorInDev(
        'Error generating monthly confidence metrics:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Track and celebrate shopping behavior improvements
   */
  async trackShoppingBehavior(userId: string): Promise<ShoppingBehaviorData> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Get purchase data from wardrobe items
      const { data: currentMonthPurchases, error: currentError } = (await supabase
        .from('wardrobe_items')
        .select('purchase_date, purchase_price')
        .eq('user_id', userId)
        .gte(
          'purchase_date',
          new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
        )
        .lte(
          'purchase_date',
          new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
        )) as any;

      if (currentError) {
        throw currentError;
      }

      const { data: prevMonthPurchases, error: prevError } = (await supabase
        .from('wardrobe_items')
        .select('purchase_date, purchase_price')
        .eq('user_id', userId)
        .gte('purchase_date', new Date(prevYear, prevMonth - 1, 1).toISOString().split('T')[0])
        .lte('purchase_date', new Date(prevYear, prevMonth, 0).toISOString().split('T')[0])) as any;

      if (prevError) {
        throw prevError;
      }

      const monthlyPurchases = currentMonthPurchases?.length || 0;
      const previousMonthPurchases = prevMonthPurchases?.length || 0;

      const reductionPercentage =
        previousMonthPurchases > 0
          ? ((previousMonthPurchases - monthlyPurchases) / previousMonthPurchases) * 100
          : 0;

      // Calculate streak days (days without purchases)
      const { data: recentPurchases } = (await supabase
        .from('wardrobe_items')
        .select('purchase_date')
        .eq('user_id', userId)
        .not('purchase_date', 'is', null)
        .order('purchase_date', { ascending: false })
        .limit(1)) as any;

      const lastPurchaseDate = recentPurchases?.[0]?.purchase_date
        ? new Date(recentPurchases[0].purchase_date)
        : undefined;

      const streakDays = lastPurchaseDate
        ? Math.floor((currentDate.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Calculate total savings (estimated)
      const avgPurchasePrice =
        prevMonthPurchases?.reduce(
          (sum: number, item: PurchaseItem) => sum + (item.purchase_price || 0),
          0,
        ) / Math.max(1, prevMonthPurchases?.length || 1);
      const totalSavings = Math.max(
        0,
        (previousMonthPurchases - monthlyPurchases) * avgPurchasePrice,
      );

      return {
        userId,
        monthlyPurchases,
        previousMonthPurchases,
        reductionPercentage,
        streakDays,
        totalSavings,
        lastPurchaseDate,
      };
    } catch (error) {
      errorInDev(
        'Error tracking shopping behavior:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  // Private helper methods
  private findSimilarItems(
    wardrobeItems: WardrobeItem[],
    target: {
      description: string;
      category: string;
      colors: string[];
      style: string;
    },
  ): WardrobeItem[] {
    return wardrobeItems.filter((item) => {
      let similarity = 0;

      // Category match (highest weight)
      if (item.category === target.category) {
        similarity += 0.4;
      }

      // Color match
      const colorMatches = target.colors.filter((color: string) =>
        item.colors.some((itemColor) => itemColor.toLowerCase().includes(color.toLowerCase())),
      );
      similarity += (colorMatches.length / Math.max(1, target.colors.length)) * 0.3;

      // Style/tag match
      if (
        target.style &&
        Array.isArray(item.tags) &&
        item.tags.some((tag) => tag.toLowerCase().includes(target.style.toLowerCase()))
      ) {
        similarity += 0.3;
      }

      return similarity >= 0.4; // Minimum 40% similarity
    });
  }

  private calculateSimilarityConfidence(
    similarItems: WardrobeItem[],
    target: {
      description: string;
      category: string;
      colors: string[];
      style: string;
    },
  ): number {
    if (similarItems.length === 0) {
      return 0;
    }

    const baseConfidence = Math.min(0.9, similarItems.length * 0.2);
    const qualityBonus = similarItems.some(
      (item) => Array.isArray(item.tags) && item.tags.includes('favorite'),
    )
      ? 0.1
      : 0;

    return Math.min(1, baseConfidence + qualityBonus);
  }

  private generateShopYourClosetReasoning(
    similarItems: WardrobeItem[],
    target: {
      description: string;
      category: string;
      colors: string[];
      style: string;
    },
  ): string[] {
    const reasoning: string[] = [];

    if (similarItems.length > 0) {
      reasoning.push(
        `You already own ${similarItems.length} similar ${target.category.toLowerCase()} item${similarItems.length > 1 ? 's' : ''}`,
      );

      const recentlyWorn = similarItems.filter((item) => {
        const lastWorn = 'lastWorn' in item ? item.lastWorn : null;
        return (
          lastWorn &&
          new Date(lastWorn as string | Date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
      });

      if (recentlyWorn.length > 0) {
        reasoning.push(
          `${recentlyWorn.length} of these items were worn recently, showing they fit your current style`,
        );
      }

      const neglected = similarItems.filter((item) => {
        const lastWorn = 'lastWorn' in item ? item.lastWorn : null;
        return (
          !lastWorn ||
          new Date(lastWorn as string | Date) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        );
      });

      if (neglected.length > 0) {
        reasoning.push(
          `${neglected.length} similar item${neglected.length > 1 ? 's' : ''} could be rediscovered instead of purchasing new`,
        );
      }
    }

    return reasoning;
  }

  private async storeShopYourClosetRecommendation(
    recommendation: ShopYourClosetRecommendation,
  ): Promise<void> {
    try {
      // Some unit tests mock supabase in a way that .from(...) may not include insert.
      // If so, gracefully skip persistence.
      if (!supabase?.from) {
        return;
      }

      const { error } = (await supabase.from('shop_your_closet_recommendations').insert({
        user_id: recommendation.userId,
        target_item: recommendation.targetItem,
        similar_item_ids: recommendation.similarOwnedItems.map((item) => item.id),
        confidence_score: recommendation.confidenceScore,
        reasoning: recommendation.reasoning,
      })) as any;

      if (error) {
        errorInDev(
          'Error storing shop your closet recommendation:',
          error instanceof Error ? error : String(error),
        );
      }
    } catch (err) {
      errorInDev(
        'Error storing shop your closet recommendation:',
        err instanceof Error ? err : String(err),
      );
    }
  }

  private async getNeglectedItems(userId: string, daysSince: number): Promise<WardrobeItem[]> {
    const cutoffDate = new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000);
    try {
      const query = supabase.from('wardrobe_items').select('*').eq('user_id', userId) as any;
      // If .or exists, use it directly
      const queryWithOr = query as typeof query & { or?: (condition: string) => typeof query };
      if (typeof queryWithOr.or === 'function') {
        const rawRes = await wrap(
          async () =>
            (await queryWithOr
              .or(`last_worn.is.null,last_worn.lt.${cutoffDate.toISOString()}`)
              .select('*')) as any,
        );
        if (!isSupabaseOk(rawRes)) {
          throw rawRes.error;
        }
        return (rawRes.data as WardrobeItem[]) || [];
      }
      // Fallback: fetch and filter in-memory for mocked environments
      const fallbackRes = await wrap(async () => (await query.select('*')) as any);
      if (!isSupabaseOk(fallbackRes)) {
        throw fallbackRes.error;
      }
      const items = (fallbackRes.data || []) as WardrobeItem[];
      return items.filter((item) => {
        const lastWorn = 'lastWorn' in item ? item.lastWorn : null;
        return !lastWorn || new Date(lastWorn as string | Date) < cutoffDate;
      });
    } catch (error) {
      throw error;
    }
  }

  private determineChallengeType(
    neglectedItems: WardrobeItem[],
  ): RediscoveryChallenge['challengeType'] {
    const categories = new Set(neglectedItems.map((item) => item.category));
    const colors = new Set(neglectedItems.flatMap((item) => item.colors));

    if (categories.size > 3) {
      return 'style_mixing';
    }
    if (colors.size > 5) {
      return 'color_exploration';
    }
    return 'neglected_items';
  }

  private generateChallenge(
    userId: string,
    type: RediscoveryChallenge['challengeType'],
    items: WardrobeItem[],
  ): Omit<RediscoveryChallenge, 'id' | 'progress' | 'createdAt'> {
    const challenges = {
      neglected_items: {
        title: 'Rediscover Your Hidden Gems',
        description: 'Wear 5 items that have been waiting patiently in your closet',
        reward: 'Unlock a special confidence boost for creative styling!',
      },
      color_exploration: {
        title: 'Color Adventure Challenge',
        description: 'Explore different color combinations with your neglected pieces',
        reward: 'Discover new favorite color pairings!',
      },
      style_mixing: {
        title: 'Style Fusion Challenge',
        description: 'Mix different style categories to create unique looks',
        reward: 'Master the art of versatile styling!',
      },
    };

    const challenge = challenges[type];
    const targetItems = items.slice(0, 5); // Limit to 5 items for manageability

    return {
      userId,
      challengeType: type,
      title: challenge.title,
      description: challenge.description,
      targetItems,
      totalItems: targetItems.length,
      reward: challenge.reward,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    };
  }

  private async calculateCostPerWearImprovement(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    // Calculate the improvement in cost-per-wear metrics
    try {
      const currentMetrics = await this.getCostPerWearMetrics(userId, month, year);
      const previousMetrics = await this.getCostPerWearMetrics(userId, month - 1, year);

      if (previousMetrics.averageCostPerWear === 0) return 0;

      const improvement =
        ((previousMetrics.averageCostPerWear - currentMetrics.averageCostPerWear) /
          previousMetrics.averageCostPerWear) *
        100;
      return Math.max(0, improvement);
    } catch (error) {
      console.warn('Error calculating cost-per-wear improvement:', error);
      return 0;
    }
  }

  private async calculateShoppingReduction(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    // Calculate the shopping reduction percentage
    try {
      const currentPurchases = await this.getPurchaseCount(userId, month, year);
      const previousPurchases = await this.getPurchaseCount(userId, month - 1, year);

      if (previousPurchases === 0) return currentPurchases === 0 ? 100 : 0;

      const reduction = ((previousPurchases - currentPurchases) / previousPurchases) * 100;
      return Math.max(0, Math.min(100, reduction));
    } catch (error) {
      console.warn('Error calculating shopping reduction:', error);
      return 0;
    }
  }
}

export const antiConsumptionService = new AntiConsumptionService();
