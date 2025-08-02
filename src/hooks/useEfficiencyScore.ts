import { useState, useEffect, useCallback } from 'react';
import { efficiencyScoreService, EfficiencyScore, EfficiencyGoal } from '@/services/efficiencyScoreService';
import { useAuth } from './useAuth';

export interface UseEfficiencyScoreReturn {
  // State
  efficiencyScore: EfficiencyScore | null;
  goals: EfficiencyGoal[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  generateScore: () => Promise<void>;
  refreshScore: () => Promise<void>;
  createGoal: (goal: Omit<EfficiencyGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  refreshGoals: () => Promise<void>;
  clearError: () => void;
  
  // Computed values
  hasScore: boolean;
  overallGrade: string;
  strongestCategory: string;
  weakestCategory: string;
  improvementPotential: number;
  isImproving: boolean;
  
  // Helper functions
  getCategoryInsights: (category: keyof EfficiencyScore['breakdown']) => string[];
  getScoreColor: (score: number) => string;
  getGradeFromScore: (score: number) => string;
  getPerformanceLevel: (score: number) => 'excellent' | 'good' | 'fair' | 'poor';
}

export const useEfficiencyScore = (): UseEfficiencyScoreReturn => {
  const { user } = useAuth();
  const [efficiencyScore, setEfficiencyScore] = useState<EfficiencyScore | null>(null);
  const [goals, setGoals] = useState<EfficiencyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      refreshScore();
      refreshGoals();
    }
  }, [user?.id]);

  const generateScore = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      const score = await efficiencyScoreService.calculateEfficiencyScore(user.id);
      setEfficiencyScore(score);
      
      // Store the score for historical tracking
      await efficiencyScoreService.storeEfficiencyScore(user.id, score);
    } catch (err) {
      console.error('Failed to generate efficiency score:', err);
      setError('Failed to generate efficiency score');
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id]);

  const refreshScore = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get cached score first, then generate if needed
      const score = await efficiencyScoreService.calculateEfficiencyScore(user.id);
      setEfficiencyScore(score);
    } catch (err) {
      console.error('Failed to refresh efficiency score:', err);
      setError('Failed to load efficiency score');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createGoal = useCallback(async (goalData: Omit<EfficiencyGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;
    
    try {
      setError(null);
      const newGoal = await efficiencyScoreService.createEfficiencyGoal(goalData);
      setGoals(prev => [newGoal, ...prev]);
    } catch (err) {
      console.error('Failed to create efficiency goal:', err);
      setError('Failed to create goal');
    }
  }, [user?.id]);

  const refreshGoals = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const userGoals = await efficiencyScoreService.getEfficiencyGoals(user.id);
      setGoals(userGoals);
    } catch (err) {
      console.error('Failed to refresh efficiency goals:', err);
      setError('Failed to load goals');
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const hasScore = efficiencyScore !== null;
  
  const overallGrade = efficiencyScore ? getGradeFromScore(efficiencyScore.overall) : 'N/A';
  
  const strongestCategory = efficiencyScore ? (
    Object.entries(efficiencyScore.breakdown)
      .reduce((strongest, [category, score]) => 
        score > strongest.score ? { category, score } : strongest,
        { category: '', score: 0 }
      ).category
  ) : '';
  
  const weakestCategory = efficiencyScore ? (
    Object.entries(efficiencyScore.breakdown)
      .reduce((weakest, [category, score]) => 
        score < weakest.score ? { category, score } : weakest,
        { category: '', score: 100 }
      ).category
  ) : '';
  
  const improvementPotential = efficiencyScore ? (
    100 - efficiencyScore.overall
  ) : 0;
  
  const isImproving = efficiencyScore ? (
    efficiencyScore.trends.trajectory === 'improving'
  ) : false;

  // Helper functions
  const getCategoryInsights = useCallback((category: keyof EfficiencyScore['breakdown']): string[] => {
    if (!efficiencyScore) return [];
    
    const score = efficiencyScore.breakdown[category];
    const insights: string[] = [];
    
    switch (category) {
      case 'utilization':
        if (score >= 80) {
          insights.push('Excellent wardrobe utilization');
          insights.push('You wear most of your items regularly');
        } else if (score >= 60) {
          insights.push('Good utilization with room for improvement');
          insights.push('Try wearing neglected items more often');
        } else {
          insights.push('Low utilization - many items go unworn');
          insights.push('Consider the rediscovery challenge');
        }
        break;
        
      case 'costEfficiency':
        if (score >= 80) {
          insights.push('Excellent cost per wear optimization');
          insights.push('Your investment is paying off');
        } else if (score >= 60) {
          insights.push('Good cost efficiency');
          insights.push('Focus on wearing expensive items more');
        } else {
          insights.push('Poor cost efficiency');
          insights.push('Many items have high cost per wear');
        }
        break;
        
      case 'sustainability':
        if (score >= 80) {
          insights.push('Excellent sustainability practices');
          insights.push('You care for your items well');
        } else if (score >= 60) {
          insights.push('Good sustainability habits');
          insights.push('Consider improving item care routines');
        } else {
          insights.push('Room for sustainability improvement');
          insights.push('Focus on item longevity and care');
        }
        break;
        
      case 'versatility':
        if (score >= 80) {
          insights.push('Highly versatile wardrobe');
          insights.push('Items work well together');
        } else if (score >= 60) {
          insights.push('Good versatility');
          insights.push('Try new outfit combinations');
        } else {
          insights.push('Limited versatility');
          insights.push('Items may be too specialized');
        }
        break;
        
      case 'curation':
        if (score >= 80) {
          insights.push('Well-curated wardrobe');
          insights.push('Quality pieces that complement each other');
        } else if (score >= 60) {
          insights.push('Good curation');
          insights.push('Consider quality over quantity');
        } else {
          insights.push('Poor curation');
          insights.push('Focus on cohesive, quality pieces');
        }
        break;
    }
    
    return insights;
  }, [efficiencyScore]);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    if (score >= 40) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  }, []);

  const getGradeFromScore = useCallback((score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }, []);

  const getPerformanceLevel = useCallback((score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }, []);

  return {
    // State
    efficiencyScore,
    goals,
    isLoading,
    isGenerating,
    error,
    
    // Actions
    generateScore,
    refreshScore,
    createGoal,
    refreshGoals,
    clearError,
    
    // Computed values
    hasScore,
    overallGrade,
    strongestCategory,
    weakestCategory,
    improvementPotential,
    isImproving,
    
    // Helper functions
    getCategoryInsights,
    getScoreColor,
    getGradeFromScore,
    getPerformanceLevel
  };
};

export default useEfficiencyScore;