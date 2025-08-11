import { supabase } from '@/config/supabaseClient';
import { WardrobeItem } from '@/types/aynaMirror';
import { enhancedWardrobeService } from './enhancedWardrobeService';
import { antiConsumptionService } from './antiConsumptionService';
import { logInDev, errorInDev } from '@/utils/consoleSuppress';

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
  /**
   * Calculate comprehensive efficiency score for a user
   */
  async calculateEfficiencyScore(userId: string): Promise<EfficiencyScore> {
    try {
      const metrics = await this.gatherEfficiencyMetrics(userId);
      const breakdown = await this.calculateScoreBreakdown(metrics);
      const insights = await this.generateInsights(metrics, breakdown);
      const trends = await this.calculateTrends(userId);
      const benchmarks = await this.calculateBenchmarks(userId, breakdown);

      const overall = this.calculateOverallScore(breakdown);

      return {
        overall,
        breakdown,
        insights,
        trends,
        benchmarks
      };
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to calculate efficiency score:', error);
      throw error;
    }
  }

  /**
   * Gather all efficiency-related metrics
   */
  private async gatherEfficiencyMetrics(userId: string): Promise<EfficiencyMetrics> {
    const [utilizationStats, wardrobeItems] = await Promise.all([
      enhancedWardrobeService.getWardrobeUtilizationStats(userId),
      enhancedWardrobeService.getUserWardrobe(userId)
    ]);

    const wardrobeUtilization = {
      totalItems: utilizationStats.totalItems,
      activeItems: utilizationStats.activeItems,
      neglectedItems: utilizationStats.neglectedItems,
      utilizationRate: utilizationStats.utilizationPercentage,
      recentActivity: await this.calculateRecentActivity(userId)
    };

    const costEfficiency = await this.calculateCostEfficiencyMetrics(wardrobeItems);
    const sustainability = await this.calculateSustainabilityMetrics(wardrobeItems);
    const versatility = await this.calculateVersatilityMetrics(wardrobeItems, userId);
    const curation = await this.calculateCurationMetrics(wardrobeItems);

    return {
      wardrobeUtilization,
      costEfficiency,
      sustainability,
      versatility,
      curation
    };
  }

  /**
   * Calculate score breakdown for each category
   */
  private async calculateScoreBreakdown(metrics: EfficiencyMetrics): Promise<EfficiencyScore['breakdown']> {
    return {
      utilization: this.scoreUtilization(metrics.wardrobeUtilization),
      costEfficiency: this.scoreCostEfficiency(metrics.costEfficiency),
      sustainability: this.scoreSustainability(metrics.sustainability),
      versatility: this.scoreVersatility(metrics.versatility),
      curation: this.scoreCuration(metrics.curation)
    };
  }

  /**
   * Score utilization metrics (0-100)
   */
  private scoreUtilization(metrics: EfficiencyMetrics['wardrobeUtilization']): number {
    const utilizationScore = Math.min(metrics.utilizationRate, 100);
    const activityBonus = Math.min(metrics.recentActivity * 10, 20);
    const neglectedPenalty = Math.min(metrics.neglectedItems / metrics.totalItems * 30, 30);
    
    return Math.max(0, Math.min(100, utilizationScore + activityBonus - neglectedPenalty));
  }

  /**
   * Score cost efficiency metrics (0-100)
   */
  private scoreCostEfficiency(metrics: EfficiencyMetrics['costEfficiency']): number {
    const avgCostPerWear = metrics.averageCostPerWear;
    const realizedValueRatio = metrics.realizedValue / metrics.totalInvestment;
    
    // Lower cost per wear is better
    const costScore = Math.max(0, 100 - (avgCostPerWear * 2));
    const valueScore = realizedValueRatio * 100;
    
    return Math.min(100, (costScore + valueScore) / 2);
  }

  /**
   * Score sustainability metrics (0-100)
   */
  private scoreSustainability(metrics: EfficiencyMetrics['sustainability']): number {
    const ageScore = Math.min(metrics.averageItemAge / 365 * 20, 40); // Bonus for older items
    const careScore = metrics.careCompliance * 30;
    const repairScore = Math.min(metrics.repairHistory * 20, 20);
    const donationScore = Math.min(metrics.donationRate * 10, 10);
    
    return Math.min(100, ageScore + careScore + repairScore + donationScore);
  }

  /**
   * Score versatility metrics (0-100)
   */
  private scoreVersatility(metrics: EfficiencyMetrics['versatility']): number {
    const outfitScore = Math.min(metrics.averageOutfitsPerItem * 10, 40);
    const crossCategoryScore = metrics.crossCategoryUsage * 25;
    const seasonalScore = metrics.seasonalAdaptability * 20;
    const styleScore = metrics.styleFlexibility * 15;
    
    return Math.min(100, outfitScore + crossCategoryScore + seasonalScore + styleScore);
  }

  /**
   * Score curation metrics (0-100)
   */
  private scoreCuration(metrics: EfficiencyMetrics['curation']): number {
    const qualityScore = metrics.qualityScore * 30;
    const diversityScore = metrics.brandDiversity * 20;
    const harmonyScore = metrics.colorHarmony * 25;
    const gapScore = Math.max(0, 25 - metrics.gapAnalysis * 25); // Fewer gaps is better
    
    return Math.min(100, qualityScore + diversityScore + harmonyScore + gapScore);
  }

  /**
   * Calculate overall efficiency score
   */
  private calculateOverallScore(breakdown: EfficiencyScore['breakdown']): number {
    const weights = {
      utilization: 0.25,
      costEfficiency: 0.25,
      sustainability: 0.20,
      versatility: 0.20,
      curation: 0.10
    };

    return Math.round(
      breakdown.utilization * weights.utilization +
      breakdown.costEfficiency * weights.costEfficiency +
      breakdown.sustainability * weights.sustainability +
      breakdown.versatility * weights.versatility +
      breakdown.curation * weights.curation
    );
  }

  /**
   * Generate actionable insights
   */
  private async generateInsights(
    metrics: EfficiencyMetrics,
    breakdown: EfficiencyScore['breakdown']
  ): Promise<EfficiencyScore['insights']> {
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

      if (error) throw error;

      if (!historicalScores || historicalScores.length < 2) {
        return {
          monthlyChange: 0,
          yearlyChange: 0,
          trajectory: 'stable'
        };
      }

      const current = historicalScores[0].overall_score;
      const lastMonth = historicalScores[1]?.overall_score || current;
      const lastYear = historicalScores[11]?.overall_score || current;

      const monthlyChange = current - lastMonth;
      const yearlyChange = current - lastYear;

      let trajectory: 'improving' | 'stable' | 'declining' = 'stable';
      if (monthlyChange > 2) trajectory = 'improving';
      else if (monthlyChange < -2) trajectory = 'declining';

      return {
        monthlyChange,
        yearlyChange,
        trajectory
      };
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to calculate trends:', error);
      return {
        monthlyChange: 0,
        yearlyChange: 0,
        trajectory: 'stable'
      };
    }
  }

  /**
   * Calculate benchmarks against other users
   */
  private async calculateBenchmarks(
    userId: string,
    breakdown: EfficiencyScore['breakdown']
  ): Promise<EfficiencyScore['benchmarks']> {
    try {
      const { data: allScores, error } = await supabase
        .from('efficiency_scores')
        .select('overall_score, utilization_score, cost_efficiency_score, sustainability_score, versatility_score, curation_score')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allScores || allScores.length === 0) {
        return {
          userPercentile: 50,
          categoryAverages: {
            utilization: 50,
            costEfficiency: 50,
            sustainability: 50,
            versatility: 50,
            curation: 50
          }
        };
      }

      const userOverallScore = this.calculateOverallScore(breakdown);
      const betterScores = allScores.filter(score => score.overall_score < userOverallScore).length;
      const userPercentile = Math.round((betterScores / allScores.length) * 100);

      const categoryAverages = {
        utilization: this.calculateAverage(allScores.map(s => s.utilization_score)),
        costEfficiency: this.calculateAverage(allScores.map(s => s.cost_efficiency_score)),
        sustainability: this.calculateAverage(allScores.map(s => s.sustainability_score)),
        versatility: this.calculateAverage(allScores.map(s => s.versatility_score)),
        curation: this.calculateAverage(allScores.map(s => s.curation_score))
      };

      return {
        userPercentile,
        categoryAverages
      };
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to calculate benchmarks:', error);
      return {
        userPercentile: 50,
        categoryAverages: {
          utilization: 50,
          costEfficiency: 50,
          sustainability: 50,
          versatility: 50,
          curation: 50
        }
      };
    }
  }

  /**
   * Store efficiency score in database
   */
  async storeEfficiencyScore(userId: string, score: EfficiencyScore): Promise<void> {
    try {
      const { error } = await supabase
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
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to store efficiency score:', error);
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

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to get efficiency goals:', error);
      return [];
    }
  }

  /**
   * Create efficiency goal
   */
  async createEfficiencyGoal(goal: Omit<EfficiencyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<EfficiencyGoal> {
    try {
      const { data, error } = await supabase
        .from('efficiency_goals')
        .insert({
          ...goal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to create efficiency goal:', error);
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

      if (error) throw error;
      return (data?.length || 0) / 7; // Average daily activity
    } catch (error) {
      errorInDev('[EfficiencyScoreService] Failed to calculate recent activity:', error);
      return 0;
    }
  }

  private async calculateCostEfficiencyMetrics(items: WardrobeItem[]): Promise<EfficiencyMetrics['costEfficiency']> {
    const costPerWearData = await Promise.all(
      items.map(async (item) => {
        try {
          const costPerWear = await enhancedWardrobeService.calculateCostPerWear(item.id);
          return { itemId: item.id, costPerWear };
        } catch {
          return { itemId: item.id, costPerWear: 0 };
        }
      })
    );

    const validData = costPerWearData.filter(d => d.costPerWear > 0);
    const averageCostPerWear = validData.length > 0 
      ? validData.reduce((sum, d) => sum + d.costPerWear, 0) / validData.length 
      : 0;

    const sortedByCost = validData.sort((a, b) => a.costPerWear - b.costPerWear);
    const bestPerformingItems = sortedByCost.slice(0, 5);
    const worstPerformingItems = sortedByCost.slice(-5).reverse();

    const totalInvestment = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    const realizedValue = items.reduce((sum, item) => {
      const wears = item.usageStats?.totalWears || 0;
      const price = item.purchasePrice || 0;
      return sum + Math.min(price, wears * 10); // Assume $10 value per wear
    }, 0);

    return {
      averageCostPerWear,
      bestPerformingItems,
      worstPerformingItems,
      totalInvestment,
      realizedValue
    };
  }

  private async calculateSustainabilityMetrics(items: WardrobeItem[]): Promise<EfficiencyMetrics['sustainability']> {
    const now = Date.now();
    const averageItemAge = items.reduce((sum, item) => {
      const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate).getTime() : now;
      return sum + (now - purchaseDate);
    }, 0) / items.length;

    // Placeholder values - would be enhanced with actual care tracking
    const careCompliance = 0.8; // 80% care compliance
    const repairHistory = 0.1; // 10% of items have been repaired
    const donationRate = 0.05; // 5% donation rate

    return {
      averageItemAge,
      careCompliance,
      repairHistory,
      donationRate
    };
  }

  private async calculateVersatilityMetrics(items: WardrobeItem[], userId: string): Promise<EfficiencyMetrics['versatility']> {
    // Calculate average outfits per item based on usage data
    const averageOutfitsPerItem = items.reduce((sum, item) => {
      return sum + (item.usageStats?.totalWears || 0);
    }, 0) / items.length;

    // Placeholder values - would be enhanced with actual outfit tracking
    const crossCategoryUsage = 0.6; // 60% cross-category usage
    const seasonalAdaptability = 0.7; // 70% seasonal adaptability
    const styleFlexibility = 0.65; // 65% style flexibility

    return {
      averageOutfitsPerItem,
      crossCategoryUsage,
      seasonalAdaptability,
      styleFlexibility
    };
  }

  private async calculateCurationMetrics(items: WardrobeItem[]): Promise<EfficiencyMetrics['curation']> {
    // Calculate quality score based on confidence ratings
    const qualityScore = items.reduce((sum, item) => {
  const history = (item as any).confidenceHistory as Array<{ rating: number }> | undefined;
  const avg = history && history.length > 0 ? (history.reduce((s, r) => s + (r.rating || 0), 0) / history.length) / 5 : 0.5;
  return sum + avg;
    }, 0) / items.length;

    // Calculate brand diversity
    const brands = new Set(items.map(item => item.brand).filter(Boolean));
    const brandDiversity = Math.min(brands.size / 10, 1); // Normalize to 0-1

    // Calculate color harmony
    const colors = items.flatMap(item => item.colors || []);
    const uniqueColors = new Set(colors);
    const colorHarmony = Math.max(0, 1 - (uniqueColors.size / 20)); // Fewer colors = better harmony

    // Gap analysis - placeholder
    const gapAnalysis = 0.2; // 20% gaps in wardrobe

    return {
      qualityScore,
      brandDiversity,
      colorHarmony,
      gapAnalysis
    };
  }

  private calculateAverage(values: number[]): number {
    const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    return validValues.length > 0 
      ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length 
      : 50;
  }
}

export const efficiencyScoreService = new EfficiencyScoreService();