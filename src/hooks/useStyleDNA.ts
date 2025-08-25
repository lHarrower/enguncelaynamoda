// useStyleDNA Hook
// Provides a clean interface for managing Style DNA operations

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { styleDNAService } from '@/services/styleDNAService';

import { errorInDev, logInDev } from '../utils/consoleSuppress';

interface UploadedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

interface StyleDNAProfile {
  userId: string;
  visualAnalysis: {
    dominantColors: string[];
    styleCategories: string[];
    formalityLevels: string[];
    patterns: string[];
    textures: string[];
    silhouettes: string[];
    occasions: string[];
    confidence: number;
  };
  stylePersonality: {
    primary: string;
    secondary: string;
    description: string;
  };
  colorPalette: {
    primary: string[];
    accent: string[];
    neutral: string[];
  };
  stylePreferences: {
    formality: 'casual' | 'business' | 'formal' | 'mixed';
    energy: 'calm' | 'bold' | 'creative' | 'classic';
    silhouette: 'fitted' | 'relaxed' | 'structured' | 'flowing';
  };
  recommendations: {
    strengths: string[];
    suggestions: string[];
    avoidances: string[];
  };
  confidence: number;
  createdAt: string;
}

interface UseStyleDNAReturn {
  // State
  styleDNA: StyleDNAProfile | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateStyleDNA: (photos: UploadedPhoto[]) => Promise<StyleDNAProfile | null>;
  refreshStyleDNA: () => Promise<void>;
  clearError: () => void;

  // Computed values
  hasStyleDNA: boolean;
  confidenceLevel: 'high' | 'good' | 'moderate' | 'low';
  primaryColors: string[];
  stylePersonalityText: string;
}

export const useStyleDNA = (): UseStyleDNAReturn => {
  const { user } = useAuth();
  const [styleDNA, setStyleDNA] = useState<StyleDNAProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing Style DNA on mount
  useEffect(() => {
    if (user?.id) {
      loadExistingStyleDNA();
    }
  }, [user?.id]);

  const loadExistingStyleDNA = async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const existingStyleDNA = await styleDNAService.getStyleDNA(user.id);
      setStyleDNA(existingStyleDNA);
    } catch (err) {
      errorInDev('[useStyleDNA] Error loading existing Style DNA:', String(err));
      setError('Failed to load your Style DNA profile');
    } finally {
      setIsLoading(false);
    }
  };

  const generateStyleDNA = useCallback(
    async (photos: UploadedPhoto[]): Promise<StyleDNAProfile | null> => {
      if (!user?.id) {
        setError('User not authenticated');
        return null;
      }

      if (photos.length < 3) {
        setError('At least 3 photos are required for Style DNA generation');
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        logInDev(`[useStyleDNA] Generating Style DNA for ${photos.length} photos`);
        const generatedStyleDNA = await styleDNAService.generateStyleDNA(user.id, photos);
        setStyleDNA(generatedStyleDNA);
        logInDev('[useStyleDNA] Style DNA generated successfully');
        return generatedStyleDNA;
      } catch (err) {
        errorInDev('[useStyleDNA] Error generating Style DNA:', String(err));
        setError(err instanceof Error ? err.message : 'Failed to generate Style DNA');
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [user?.id],
  );

  const refreshStyleDNA = useCallback(async () => {
    await loadExistingStyleDNA();
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const hasStyleDNA = styleDNA !== null;

  const confidenceLevel: 'high' | 'good' | 'moderate' | 'low' = (() => {
    if (!styleDNA) {
      return 'low';
    }
    const confidence = styleDNA.confidence;
    if (confidence >= 0.8) {
      return 'high';
    }
    if (confidence >= 0.6) {
      return 'good';
    }
    if (confidence >= 0.4) {
      return 'moderate';
    }
    return 'low';
  })();

  const primaryColors = styleDNA?.colorPalette.primary || [];

  const stylePersonalityText = styleDNA
    ? `${styleDNA.stylePersonality.primary} • ${styleDNA.stylePersonality.secondary}`
    : '';

  return {
    // State
    styleDNA,
    isLoading,
    isGenerating,
    error,

    // Actions
    generateStyleDNA,
    refreshStyleDNA,
    clearError,

    // Computed values
    hasStyleDNA,
    confidenceLevel,
    primaryColors,
    stylePersonalityText,
  };
};

// Helper functions for Style DNA analysis
export const getStyleDNAInsights = (styleDNA: StyleDNAProfile | null) => {
  if (!styleDNA) {
    return null;
  }

  const { visualAnalysis, stylePreferences, recommendations } = styleDNA;

  return {
    // Color insights
    dominantColorCount: visualAnalysis.dominantColors.length,
    hasColorPreference: visualAnalysis.dominantColors.length > 0,

    // Style insights
    styleVariety: visualAnalysis.styleCategories.length,
    isVersatile: visualAnalysis.formalityLevels.length > 1,

    // Pattern insights
    lovesPatterns: visualAnalysis.patterns.length > 2,
    prefersSimplicity: visualAnalysis.patterns.includes('solid'),

    // Recommendations summary
    strengthCount: recommendations.strengths.length,
    suggestionCount: recommendations.suggestions.length,

    // Overall assessment
    isWellDefined: styleDNA.confidence > 0.7,
    needsMoreData: styleDNA.confidence < 0.5,
  };
};

export const getStyleDNACompatibility = (userStyleDNA: StyleDNAProfile, itemTags: string[]) => {
  if (!userStyleDNA || !itemTags.length) {
    return 0;
  }

  let compatibilityScore = 0;
  let totalChecks = 0;

  // Check color compatibility
  const userColors = [
    ...userStyleDNA.colorPalette.primary,
    ...userStyleDNA.colorPalette.accent,
    ...userStyleDNA.colorPalette.neutral,
  ].map((color) => color.toLowerCase());

  itemTags.forEach((tag) => {
    if (userColors.some((color) => tag.toLowerCase().includes(color))) {
      compatibilityScore += 0.3;
    }
    totalChecks += 0.3;
  });

  // Check style category compatibility
  userStyleDNA.visualAnalysis.styleCategories.forEach((category) => {
    if (itemTags.some((tag) => tag.toLowerCase().includes(category.toLowerCase()))) {
      compatibilityScore += 0.4;
    }
    totalChecks += 0.4;
  });

  // Check formality compatibility
  userStyleDNA.visualAnalysis.formalityLevels.forEach((level) => {
    if (itemTags.some((tag) => tag.toLowerCase().includes(level.toLowerCase()))) {
      compatibilityScore += 0.3;
    }
    totalChecks += 0.3;
  });

  return totalChecks > 0 ? Math.min(compatibilityScore / totalChecks, 1) : 0;
};
