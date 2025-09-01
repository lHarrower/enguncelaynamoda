// AI Provider - Context for AI services and state management
import React, { createContext, ReactNode, useCallback, useContext } from 'react';

import { AIService, ImageAnalysis, StyleAdvice } from '@/services/AIService';
import { WardrobeItem } from '@/types/aynaMirror';
import { UserProfile } from '@/types/user';
import {
  useAILoading,
  useAIError,
  useLastAnalysis,
  useStyleAdvice,
  useAnalysisHistory,
  useProcessingQueue,
  useAIActions,
} from '@/store/globalStore';

// State interfaces moved to globalStore.ts

interface ItemCategorizationResult {
  category: string;
  subcategory?: string;
  confidence: number;
}

interface ColorExtractionResult {
  dominantColors: string[];
  colorPalette: string[];
  confidence: number;
}

interface ClothingDetectionResult {
  items: Array<{
    type: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

interface AIContextType {
  analyzeImage: (imageUri: string) => Promise<ImageAnalysis | null>;
  generateStyleAdvice: (
    userProfile: UserProfile,
    wardrobeItems: WardrobeItem[],
  ) => Promise<StyleAdvice | null>;
  categorizeItem: (description: string) => Promise<ItemCategorizationResult | null>;
  extractColors: (imageUri: string) => Promise<ColorExtractionResult | null>;
  detectClothingItems: (imageUri: string) => Promise<ClothingDetectionResult | null>;
  clearError: () => void;
  resetState: () => void;
  isProcessing: (imageUri: string) => boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const processingQueue = useProcessingQueue();
  const aiActions = useAIActions();
  const aiService = new AIService();

  const analyzeImage = useCallback(
    async (imageUri: string): Promise<ImageAnalysis | null> => {
      try {
        aiActions.setAILoading(true);
        aiActions.addToProcessingQueue(imageUri);
        aiActions.clearAIError();

        const analysis = await aiService.analyzeImage(imageUri);

        // Convert AIService ImageAnalysis to our store format
        const storeAnalysis = {
          id: `analysis_${Date.now()}`,
          imageUri,
          timestamp: new Date(),
          colors: analysis.colors || [],
          style: analysis.style || 'unknown',
          category: analysis.category || 'unknown',
          confidence: analysis.confidence || 0.8,
        };

        aiActions.setLastAnalysis(storeAnalysis);
        aiActions.addToAnalysisHistory(storeAnalysis);
        aiActions.removeFromProcessingQueue(imageUri);

        return analysis;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
        aiActions.setAIError(errorMessage);
        aiActions.removeFromProcessingQueue(imageUri);
        return null;
      }
    },
    [aiService],
  );

  const generateStyleAdvice = useCallback(
    async (
      userProfile: UserProfile,
      wardrobeItems: WardrobeItem[],
    ): Promise<StyleAdvice | null> => {
      try {
        aiActions.setAILoading(true);
        aiActions.clearAIError();

        const advice = await aiService.generateStyleAdvice(userProfile, wardrobeItems);

        // Convert AIService StyleAdvice to our store format
        const storeAdvice = {
          id: `advice_${Date.now()}`,
          advice: advice.advice || '',
          recommendations: advice.recommendations || [],
          confidence: advice.confidence || 0.8,
          timestamp: new Date(),
        };

        aiActions.setStyleAdvice(storeAdvice);

        return advice;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to generate style advice';
        aiActions.setAIError(errorMessage);
        return null;
      }
    },
    [aiService, aiActions],
  );

  const categorizeItem = useCallback(
    async (description: string): Promise<ItemCategorizationResult | null> => {
      try {
        aiActions.setAILoading(true);
        aiActions.clearAIError();

        const result = await aiService.categorizeItem(description);

        aiActions.setAILoading(false);

        return result as ItemCategorizationResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to categorize item';
        aiActions.setAIError(errorMessage);
        return null;
      }
    },
    [aiService, aiActions],
  );

  const extractColors = useCallback(
    async (imageUri: string): Promise<ColorExtractionResult | null> => {
      try {
        aiActions.setAILoading(true);
        aiActions.clearAIError();

        const result = await aiService.extractColors(imageUri);

        aiActions.setAILoading(false);

        // Map ColorExtraction to ColorExtractionResult
        return {
          dominantColors: result.dominantColors || [],
          colorPalette: result.dominantColors || [],
          confidence: 0.8, // Default confidence since ColorExtraction doesn't have this field
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to extract colors';
        aiActions.setAIError(errorMessage);
        return null;
      }
    },
    [aiService, aiActions],
  );

  const detectClothingItems = useCallback(
    async (imageUri: string): Promise<ClothingDetectionResult | null> => {
      try {
        aiActions.setAILoading(true);
        aiActions.clearAIError();

        const result = await aiService.detectClothingItems(imageUri);

        aiActions.setAILoading(false);

        // Map the result to match ClothingDetectionResult interface
        const mappedResult: ClothingDetectionResult = {
          items: result.items.map((item) => ({
            type: item.name || 'unknown',
            confidence: item.confidence,
            boundingBox: item.boundingBox,
          })),
        };

        return mappedResult;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to detect clothing items';
        aiActions.setAIError(errorMessage);
        return null;
      }
    },
    [aiService, aiActions],
  );

  const clearError = useCallback(() => {
    aiActions.clearAIError();
  }, [aiActions]);

  const resetState = useCallback(() => {
    aiActions.resetAIState();
  }, [aiActions]);

  const isProcessing = useCallback(
    (imageUri: string): boolean => {
      return processingQueue.includes(imageUri);
    },
    [processingQueue],
  );

  const value: AIContextType = {
    analyzeImage,
    generateStyleAdvice,
    categorizeItem,
    extractColors,
    detectClothingItems,
    clearError,
    resetState,
    isProcessing,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI(): AIContextType {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

export default AIProvider;
