// Central configuration for tunable efficiency & sustainability metrics
// Extracted from inline literals to enable future dynamic tuning or remote overrides

export interface SustainabilityConfig {
  careComplianceDefault: number; // 0-1
  repairHistoryDefault: number; // 0-1 (fraction of items repaired)
  donationRateDefault: number; // 0-1
  maxAgeBonusYears: number; // years cap for age-based scoring normalization
}

export interface VersatilityConfig {
  crossCategoryUsageDefault: number; // 0-1
  seasonalAdaptabilityDefault: number; // 0-1
  styleFlexibilityDefault: number; // 0-1
}

// Efficiency Score Calculation Constants
export interface EfficiencyScoreWeights {
  utilization: number;
  costEfficiency: number;
  sustainability: number;
  versatility: number;
  curation: number;
}

export interface EfficiencyScoreConstants {
  // Sustainability scoring constants
  sustainability: {
    ageScoreMultiplier: number; // (age/365) * multiplier
    maxAgeScore: number;
    careScoreMultiplier: number; // careCompliance * multiplier
    maxRepairScore: number;
    repairScoreMultiplier: number; // repairHistory * multiplier
    maxDonationScore: number;
    donationScoreMultiplier: number; // donationRate * multiplier
  };
  // Versatility scoring constants
  versatility: {
    outfitScoreMultiplier: number; // averageOutfitsPerItem * multiplier
    maxOutfitScore: number;
    crossCategoryMultiplier: number; // crossCategoryUsage * multiplier
    seasonalMultiplier: number; // seasonalAdaptability * multiplier
    styleMultiplier: number; // styleFlexibility * multiplier
  };
  // Curation scoring constants
  curation: {
    qualityMultiplier: number; // qualityScore * multiplier
    diversityMultiplier: number; // brandDiversity * multiplier
    harmonyMultiplier: number; // colorHarmony * multiplier
    maxGapPenalty: number; // max penalty for gaps
    gapPenaltyMultiplier: number; // gapAnalysis * multiplier
  };
  // Cost efficiency constants
  costEfficiency: {
    maxPriceOutlier: number; // Cap for outlier prices (e.g., 10000)
    optimalCostPerWear: number; // Target cost per wear for scoring
    maxCostPerWear: number; // Maximum cost per wear threshold
    maxPurchasePrice: number; // Maximum purchase price threshold
  };
  // Overall score weights
  weights: EfficiencyScoreWeights;
}

export interface MetricsConfig {
  sustainability: SustainabilityConfig;
  versatility: VersatilityConfig;
  efficiencyScore: EfficiencyScoreConstants;
}

export const metricsConfig: MetricsConfig = {
  sustainability: {
    careComplianceDefault: 0.8,
    repairHistoryDefault: 0.1,
    donationRateDefault: 0.05,
    maxAgeBonusYears: 5,
  },
  versatility: {
    crossCategoryUsageDefault: 0.6,
    seasonalAdaptabilityDefault: 0.7,
    styleFlexibilityDefault: 0.65,
  },
  efficiencyScore: {
    sustainability: {
      ageScoreMultiplier: 20,
      maxAgeScore: 40,
      careScoreMultiplier: 30,
      maxRepairScore: 20,
      repairScoreMultiplier: 20,
      maxDonationScore: 10,
      donationScoreMultiplier: 10,
    },
    versatility: {
      outfitScoreMultiplier: 10,
      maxOutfitScore: 40,
      crossCategoryMultiplier: 25,
      seasonalMultiplier: 20,
      styleMultiplier: 15,
    },
    curation: {
      qualityMultiplier: 30,
      diversityMultiplier: 20,
      harmonyMultiplier: 25,
      maxGapPenalty: 25,
      gapPenaltyMultiplier: 25,
    },
    costEfficiency: {
      maxPriceOutlier: 10000, // Cap outlier prices at 10,000
      optimalCostPerWear: 10, // Target cost per wear for optimal scoring
      maxCostPerWear: 100, // Maximum cost per wear threshold
      maxPurchasePrice: 5000, // Maximum purchase price threshold
    },
    weights: {
      utilization: 0.25,
      costEfficiency: 0.25,
      sustainability: 0.2,
      versatility: 0.2,
      curation: 0.1,
    },
  },
};

export function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

// Helper function to cap outlier values
export function capOutlier(value: number, max: number): number {
  return Math.min(value, max);
}
