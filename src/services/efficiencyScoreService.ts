import { capOutlier, clamp01, metricsConfig } from '../config/metricsConfig';
import { supabase } from '../config/supabaseClient';
import { WardrobeItem } from '../types/aynaMirror';
import { errorInDev } from '../utils/consoleSuppress';
import { ErrorHandler } from '../utils/ErrorHandler';
import { mapSupabaseError } from '../utils/supabaseErrorMapping';
import { isSupabaseOk, wrap } from '../utils/supabaseResult';
import { enhancedWardrobeService } from './enhancedWardrobeService';

interface ScoreRecord {
  overall_score: number;
  utilization_score: number;
  cost_efficiency_score: number;
  sustainability_score: number;
  versatility_score: number;
  curation_score: number;
}

export interface EfficiencyScore {
  overall: number; // 0-100
  breakdown: {
    utilization: number; // How much of wardrobe is actively used
    costEfficiency: number; // Cost per wear optimization
    sustainability: number; // Longevity and care practices
    versatility: number; // Item mix-and-match potential
    curation: number; // Quality over quantity
  };
  insights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  trends: {
    monthlyChange: number;
    yearlyChange: number;
    trajectory: 'improving' | 'stable' | 'declining';
  };
  benchmarks: {
    userPercentile: number; // Compared to other users
    categoryAverages: Record<string, number>;
  };
}

export interface EfficiencyMetrics {
  wardrobeUtilization: {
    totalItems: number;
    activeItems: number;
    neglectedItems: number;
    utilizationRate: number;
    recentActivity: number;
  };
  costEfficiency: {
    averageCostPerWear: number;
    bestPerformingItems: Array<{ itemId: string; costPerWear: number }>;
    worstPerformingItems: Array<{ itemId: string; costPerWear: number }>;
    totalInvestment: number;
    realizedValue: number;
  };
  sustainability: {
    averageItemAge: number;
    careCompliance: number;
    repairHistory: number;
    donationRate: number;
  };
  versatility: {
    averageOutfitsPerItem: number;
    crossCategoryUsage: number;
    seasonalAdaptability: number;
    styleFlexibility: number;
  };
  curation: {
    qualityScore: number;
    brandDiversity: number;
    colorHarmony: number;
    gapAnalysis: number;
  };
}

export interface EfficiencyGoal {
  id: string;
  userId: string;
  type: 'utilization' | 'cost_efficiency' | 'sustainability' | 'versatility' | 'curation';
  target: number;
  current: number;
  deadline: Date;
  description: string;
  milestones: Array<{
    value: number;
    achieved: boolean;
    achievedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class EfficiencyScoreService {
  // Lightweight guard helpers to avoid pervasive any usage
  private isWardrobeItemArray(arr: unknown): arr is WardrobeItem[] {
    return Array.isArray(arr);
  }

  private average(numbers: number[]): number {
    const valid = numbers.filter((n) => typeof n === 'number' && !isNaN(n));
    return valid.length ? valid.reduce((s, n) => s + n, 0) / valid.length : 0;
  }
  /**
   * Calculate comprehensive efficiency score for a user
   */
  async calculateEfficiencyScore(userId: string): Promise<EfficiencyScore> {
    try {
      const metrics = await this.gatherEfficiencyMetrics(userId);
      const breakdown = this.calculateScoreBreakdown(metrics);
      const insights = this.generateInsights(metrics, breakdown);
      const trends = await this.calculateTrends(userId);
      const benchmarks = await this.calculateBenchmarks(userId, breakdown);

      const overall = this.calculateOverallScore(breakdown);

      return {
        overall,
        breakdown,
        insights,
        trends,
        benchmarks,
      };
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to calculate efficiency score:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Gather all efficiency-related metrics
   */
  private async gatherEfficiencyMetrics(userId: string): Promise<EfficiencyMetrics> {
    const [utilizationStats, wardrobeItems] = await Promise.all([
      enhancedWardrobeService.getWardrobeUtilizationStats(userId),
      enhancedWardrobeService.getUserWardrobe(userId),
    ]);

    const wardrobeUtilization = {
      totalItems: utilizationStats.totalItems,
      activeItems: utilizationStats.activeItems,
      neglectedItems: utilizationStats.neglectedItems,
      utilizationRate: utilizationStats.utilizationPercentage,
      recentActivity: await this.calculateRecentActivity(userId),
    };

    const costEfficiency = await this.calculateCostEfficiencyMetrics(wardrobeItems);
    const sustainability = this.calculateSustainabilityMetrics(wardrobeItems);
    const versatility = this.calculateVersatilityMetrics(wardrobeItems, userId);
    const curation = this.calculateCurationMetrics(wardrobeItems);

    return {
      wardrobeUtilization,
      costEfficiency,
      sustainability,
      versatility,
      curation,
    };
  }

  /**
   * Calculate score breakdown for each category
   */
  private calculateScoreBreakdown(metrics: EfficiencyMetrics): EfficiencyScore['breakdown'] {
    return {
      utilization: this.scoreUtilization(metrics.wardrobeUtilization),
      costEfficiency: this.scoreCostEfficiency(metrics.costEfficiency),
      sustainability: this.scoreSustainability(metrics.sustainability),
      versatility: this.scoreVersatility(metrics.versatility),
      curation: this.scoreCuration(metrics.curation),
    };
  }

  /**
   * Score utilization metrics (0-100)
   */
  private scoreUtilization(metrics: EfficiencyMetrics['wardrobeUtilization']): number {
    const utilizationScore = Math.min(metrics.utilizationRate, 100);
    const activityBonus = Math.min(metrics.recentActivity * 10, 20);
    const neglectedPenalty = Math.min((metrics.neglectedItems / metrics.totalItems) * 30, 30);

    return Math.max(0, Math.min(100, utilizationScore + activityBonus - neglectedPenalty));
  }

  /**
   * Score cost efficiency metrics (0-100)
   */
  private scoreCostEfficiency(metrics: EfficiencyMetrics['costEfficiency']): number {
    const avgCostPerWear = metrics.averageCostPerWear;
    const realizedValueRatio = metrics.realizedValue / metrics.totalInvestment;

    // Lower cost per wear is better
    const costScore = Math.max(0, 100 - avgCostPerWear * 2);
    const valueScore = realizedValueRatio * 100;

    return Math.min(100, (costScore + valueScore) / 2);
  }

  /**
   * Score sustainability metrics (0-100)
   */
  private scoreSustainability(metrics: EfficiencyMetrics['sustainability']): number {
    const config = metricsConfig.efficiencyScore.sustainability;

    const ageScore = Math.min(
      (metrics.averageItemAge / 365) * config.ageScoreMultiplier,
      config.maxAgeScore,
    );
    const careScore = metrics.careCompliance * config.careScoreMultiplier;
    const repairScore = Math.min(
      metrics.repairHistory * config.repairScoreMultiplier,
      config.maxRepairScore,
    );
    const donationScore = Math.min(
      metrics.donationRate * config.donationScoreMultiplier,
      config.maxDonationScore,
    );

    return Math.min(100, ageScore + careScore + repairScore + donationScore);
  }

  /**
   * Score versatility metrics (0-100)
   */
  private scoreVersatility(metrics: EfficiencyMetrics['versatility']): number {
    const config = metricsConfig.efficiencyScore.versatility;

    const outfitScore = Math.min(
      metrics.averageOutfitsPerItem * config.outfitScoreMultiplier,
      config.maxOutfitScore,
    );
    const crossCategoryScore = metrics.crossCategoryUsage * config.crossCategoryMultiplier;
    const seasonalScore = metrics.seasonalAdaptability * config.seasonalMultiplier;
    const styleScore = metrics.styleFlexibility * config.styleMultiplier;

    return Math.min(100, outfitScore + crossCategoryScore + seasonalScore + styleScore);
  }

  /**
   * Score curation metrics (0-100)
   */
  private scoreCuration(metrics: EfficiencyMetrics['curation']): number {
    const config = metricsConfig.efficiencyScore.curation;

    const qualityScore = metrics.qualityScore * config.qualityMultiplier;
    const diversityScore = metrics.brandDiversity * config.diversityMultiplier;
    const harmonyScore = metrics.colorHarmony * config.harmonyMultiplier;
    const gapScore = Math.max(
      0,
      config.maxGapPenalty - metrics.gapAnalysis * config.gapPenaltyMultiplier,
    );

    return Math.min(100, qualityScore + diversityScore + harmonyScore + gapScore);
  }

  /**
   * Calculate overall efficiency score
   */
  private calculateOverallScore(breakdown: EfficiencyScore['breakdown']): number {
    const weights = metricsConfig.efficiencyScore.weights;

    return Math.round(
      breakdown.utilization * weights.utilization +
        breakdown.costEfficiency * weights.costEfficiency +
        breakdown.sustainability * weights.sustainability +
        breakdown.versatility * weights.versatility +
        breakdown.curation * weights.curation,
    );
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(
    metrics: EfficiencyMetrics,
    breakdown: EfficiencyScore['breakdown'],
  ): EfficiencyScore['insights'] {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths
    if (breakdown.utilization >= 80) {
      strengths.push('Excellent wardrobe utilization - you wear most of your items regularly');
    }
    if (breakdown.costEfficiency >= 75) {
      strengths.push('Great cost efficiency - your cost per wear is optimized');
    }
    if (breakdown.sustainability >= 70) {
      strengths.push('Strong sustainability practices - you care for and maintain your items well');
    }
    if (breakdown.versatility >= 75) {
      strengths.push('Highly versatile wardrobe - your items work well together');
    }
    if (breakdown.curation >= 80) {
      strengths.push('Well-curated collection - quality pieces that complement each other');
    }

    // Identify improvements
    if (breakdown.utilization < 60) {
      improvements.push('Increase wardrobe utilization by wearing neglected items');
      recommendations.push('Try the rediscovery challenge to reconnect with forgotten pieces');
    }
    if (breakdown.costEfficiency < 50) {
      improvements.push('Optimize cost per wear by using items more frequently');
      recommendations.push('Focus on wearing higher-cost items to improve their value');
    }
    if (breakdown.sustainability < 60) {
      improvements.push('Enhance sustainability through better item care and longevity');
      recommendations.push('Follow care instructions and consider repairs over replacements');
    }
    if (breakdown.versatility < 50) {
      improvements.push('Build more versatile outfit combinations');
      recommendations.push('Experiment with mixing different categories and styles');
    }
    if (breakdown.curation < 60) {
      improvements.push('Improve wardrobe curation and quality');
      recommendations.push('Consider quality over quantity in future purchases');
    }

    return { strengths, improvements, recommendations };
  }

  /**
   * Calculate efficiency trends over time
   */
  private async calculateTrends(userId: string): Promise<EfficiencyScore['trends']> {
    try {
      const { data: historicalScores, error } = await supabase
        .from('efficiency_scores')
        .select('overall_score, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12); // Last 12 records

      if (error) {
        throw error;
      }

      if (!historicalScores || historicalScores.length < 2) {
        return {
          monthlyChange: 0,
          yearlyChange: 0,
          trajectory: 'stable',
        };
      }

      const current = historicalScores[0]?.overall_score ?? 0;
      const lastMonth = historicalScores[1]?.overall_score ?? current;
      const lastYear = historicalScores[11]?.overall_score ?? current;

      const monthlyChange = current - lastMonth;
      const yearlyChange = current - lastYear;

      let trajectory: 'improving' | 'stable' | 'declining' = 'stable';
      if (monthlyChange > 2) {
        trajectory = 'improving';
      } else if (monthlyChange < -2) {
        trajectory = 'declining';
      }

      return {
        monthlyChange,
        yearlyChange,
        trajectory,
      };
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to calculate trends:',
        error instanceof Error ? error : String(error),
      );
      return {
        monthlyChange: 0,
        yearlyChange: 0,
        trajectory: 'stable',
      };
    }
  }

  /**
   * Calculate benchmarks against other users
   */
  private async calculateBenchmarks(
    userId: string,
    breakdown: EfficiencyScore['breakdown'],
  ): Promise<EfficiencyScore['benchmarks']> {
    try {
      const { data: allScores, error } = await supabase
        .from('efficiency_scores')
        .select(
          'overall_score, utilization_score, cost_efficiency_score, sustainability_score, versatility_score, curation_score',
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!allScores || allScores.length === 0) {
        return {
          userPercentile: 50,
          categoryAverages: {
            utilization: 50,
            costEfficiency: 50,
            sustainability: 50,
            versatility: 50,
            curation: 50,
          },
        };
      }

      const userOverallScore = this.calculateOverallScore(breakdown);
      const betterScores = allScores.filter(
        (score: ScoreRecord) => score.overall_score < userOverallScore,
      ).length;
      const userPercentile = Math.round((betterScores / allScores.length) * 100);

      const categoryAverages = {
        utilization: this.calculateAverage(allScores.map((s: ScoreRecord) => s.utilization_score)),
        costEfficiency: this.calculateAverage(
          allScores.map((s: ScoreRecord) => s.cost_efficiency_score),
        ),
        sustainability: this.calculateAverage(
          allScores.map((s: ScoreRecord) => s.sustainability_score),
        ),
        versatility: this.calculateAverage(allScores.map((s: ScoreRecord) => s.versatility_score)),
        curation: this.calculateAverage(allScores.map((s: ScoreRecord) => s.curation_score)),
      };

      return {
        userPercentile,
        categoryAverages,
      };
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to calculate benchmarks:',
        error instanceof Error ? error : String(error),
      );
      return {
        userPercentile: 50,
        categoryAverages: {
          utilization: 50,
          costEfficiency: 50,
          sustainability: 50,
          versatility: 50,
          curation: 50,
        },
      };
    }
  }

  /**
   * Store efficiency score in database
   */
  async storeEfficiencyScore(userId: string, score: EfficiencyScore): Promise<void> {
    try {
      const insRes = await wrap(
        async () =>
          await supabase
            .from('efficiency_scores')
            .insert({
              user_id: userId,
              overall_score: score.overall,
              utilization_score: score.breakdown.utilization,
              cost_efficiency_score: score.breakdown.costEfficiency,
              sustainability_score: score.breakdown.sustainability,
              versatility_score: score.breakdown.versatility,
              curation_score: score.breakdown.curation,
              insights: score.insights,
              trends: score.trends,
              benchmarks: score.benchmarks,
              created_at: new Date().toISOString(),
            })
            .select('*')
            .single(),
      );
      if (!isSupabaseOk(insRes)) {
        const mapped = mapSupabaseError(insRes.error, { action: 'storeEfficiencyScore' });
        try {
          // Log & report via unified handler (fire and forget)
          void ErrorHandler.getInstance().handleError(mapped);
        } catch {}
        throw mapped;
      }
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to store efficiency score:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  /**
   * Get user's efficiency goals
   */
  async getEfficiencyGoals(userId: string): Promise<EfficiencyGoal[]> {
    try {
      const { data, error } = await supabase
        .from('efficiency_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to get efficiency goals:',
        error instanceof Error ? error : String(error),
      );
      return [];
    }
  }

  /**
   * Create efficiency goal
   */
  async createEfficiencyGoal(
    goal: Omit<EfficiencyGoal, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<EfficiencyGoal> {
    try {
      const { data, error } = await supabase
        .from('efficiency_goals')
        .insert({
          ...goal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to create efficiency goal:',
        error instanceof Error ? error : String(error),
      );
      throw error;
    }
  }

  // Helper methods for metric calculations
  private async calculateRecentActivity(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('outfit_feedback')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw error;
      }
      return (data?.length || 0) / 7; // Average daily activity
    } catch (error) {
      errorInDev(
        '[EfficiencyScoreService] Failed to calculate recent activity:',
        error instanceof Error ? error : String(error),
      );
      return 0;
    }
  }

  private async calculateCostEfficiencyMetrics(
    items: WardrobeItem[],
  ): Promise<EfficiencyMetrics['costEfficiency']> {
    const costPerWearData = await Promise.all(
      items.map(async (item) => {
        try {
          const costPerWear = await enhancedWardrobeService.calculateCostPerWear(item.id);
          // Apply outlier guard to prevent extreme cost per wear values
          const cappedCostPerWear = capOutlier(
            costPerWear,
            metricsConfig.efficiencyScore.costEfficiency.maxCostPerWear,
          );
          return { itemId: item.id, costPerWear: cappedCostPerWear };
        } catch {
          return { itemId: item.id, costPerWear: 0 };
        }
      }),
    );

    const validData = costPerWearData.filter((d) => d.costPerWear > 0);
    const averageCostPerWear =
      validData.length > 0
        ? validData.reduce((sum, d) => sum + d.costPerWear, 0) / validData.length
        : 0;

    const sortedByCost = validData.sort((a, b) => a.costPerWear - b.costPerWear);
    const bestPerformingItems = sortedByCost.slice(0, 5);
    const worstPerformingItems = sortedByCost.slice(-5).reverse();

    // Apply outlier guard to purchase prices as well
    const totalInvestment = items.reduce((sum, item) => {
      const price = capOutlier(
        item.purchasePrice || 0,
        metricsConfig.efficiencyScore.costEfficiency.maxPurchasePrice,
      );
      return sum + price;
    }, 0);

    const realizedValue = items.reduce((sum, item) => {
      const wears = item.usageStats?.totalWears || 0;
      const price = capOutlier(
        item.purchasePrice || 0,
        metricsConfig.efficiencyScore.costEfficiency.maxPurchasePrice,
      );
      return sum + Math.min(price, wears * 10); // Assume $10 value per wear
    }, 0);

    return {
      averageCostPerWear,
      bestPerformingItems,
      worstPerformingItems,
      totalInvestment,
      realizedValue,
    };
  }

  private calculateSustainabilityMetrics(
    items: WardrobeItem[],
  ): EfficiencyMetrics['sustainability'] {
    const now = Date.now();
    const averageItemAge =
      items.reduce((sum, item) => {
        const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate).getTime() : now;
        return sum + Math.max(0, now - purchaseDate);
      }, 0) / Math.max(1, items.length);

    const { sustainability } = metricsConfig;
    const careCompliance = clamp01(sustainability.careComplianceDefault);
    const repairHistory = clamp01(sustainability.repairHistoryDefault);
    const donationRate = clamp01(sustainability.donationRateDefault);

    return {
      averageItemAge,
      careCompliance,
      repairHistory,
      donationRate,
    };
  }

  private calculateVersatilityMetrics(
    items: WardrobeItem[],
    userId: string,
  ): EfficiencyMetrics['versatility'] {
    // Calculate average outfits per item based on usage data
    const averageOutfitsPerItem =
      items.reduce((sum, item) => sum + (item.usageStats?.totalWears || 0), 0) /
      Math.max(1, items.length);

    const { versatility } = metricsConfig;
    const crossCategoryUsage = clamp01(versatility.crossCategoryUsageDefault);
    const seasonalAdaptability = clamp01(versatility.seasonalAdaptabilityDefault);
    const styleFlexibility = clamp01(versatility.styleFlexibilityDefault);

    return {
      averageOutfitsPerItem,
      crossCategoryUsage,
      seasonalAdaptability,
      styleFlexibility,
    };
  }

  private calculateCurationMetrics(items: WardrobeItem[]): EfficiencyMetrics['curation'] {
    // Calculate quality score based on confidence ratings
    const qualityScore = items.length
      ? items.reduce((sum, item) => {
          const history = (item as unknown as { confidenceHistory?: Array<{ rating: number }> })
            .confidenceHistory;
          const avg =
            history && history.length ? this.average(history.map((h) => h.rating || 0)) / 5 : 0.5;
          return sum + avg;
        }, 0) / items.length
      : 0;

    // Calculate brand diversity
    const brands = new Set(items.map((item) => item.brand).filter(Boolean));
    const brandDiversity = Math.min(brands.size / 10, 1); // Normalize to 0-1

    // Calculate color harmony
    const colors = items.flatMap((item) => item.colors || []);
    const uniqueColors = new Set(colors);
    const colorHarmony = Math.max(0, 1 - uniqueColors.size / 20); // Fewer colors = better harmony

    // Gap analysis - calculate wardrobe completeness
    const essentialCategories = ['tops', 'bottoms', 'outerwear', 'shoes'];
    const availableCategories = new Set(items.map((item) => item.category));
    const missingCategories = essentialCategories.filter((cat) => !availableCategories.has(cat));
    const gapAnalysis = Math.max(0, 1 - missingCategories.length / essentialCategories.length);

    return {
      qualityScore,
      brandDiversity,
      colorHarmony,
      gapAnalysis,
    };
  }

  private calculateAverage(values: number[]): number {
    const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));
    return validValues.length > 0
      ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length
      : 50;
  }
}

export const efficiencyScoreService = new EfficiencyScoreService();

// Export the calculateEfficiencyScore function for testing
export const calculateEfficiencyScore = (userId: string) =>
  efficiencyScoreService.calculateEfficiencyScore(userId);
