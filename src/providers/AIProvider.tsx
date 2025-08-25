// AI Provider - Context for AI services and state management
import React, { createContext, ReactNode, useCallback, useContext, useReducer } from 'react';

import { AIService, ImageAnalysis, StyleAdvice } from '@/services/AIService';
import { WardrobeItem } from '@/types/aynaMirror';
import { UserProfile } from '@/types/user';

interface AIState {
  loading: boolean;
  error: string | null;
  lastAnalysis: ImageAnalysis | null;
  styleAdvice: StyleAdvice | null;
  analysisHistory: ImageAnalysis[];
  processingQueue: string[];
}

type AIAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ANALYSIS'; payload: ImageAnalysis }
  | { type: 'SET_STYLE_ADVICE'; payload: StyleAdvice }
  | { type: 'ADD_TO_HISTORY'; payload: ImageAnalysis }
  | { type: 'ADD_TO_QUEUE'; payload: string }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

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
  state: AIState;
  dispatch: React.Dispatch<AIAction>;
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

const initialState: AIState = {
  loading: false,
  error: null,
  lastAnalysis: null,
  styleAdvice: null,
  analysisHistory: [],
  processingQueue: [],
};

function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ANALYSIS':
      return {
        ...state,
        lastAnalysis: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_STYLE_ADVICE':
      return {
        ...state,
        styleAdvice: action.payload,
        loading: false,
        error: null,
      };
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        analysisHistory: [action.payload, ...state.analysisHistory].slice(0, 50), // Keep last 50
      };
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        processingQueue: [...state.processingQueue, action.payload],
      };
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        processingQueue: state.processingQueue.filter((uri) => uri !== action.payload),
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const aiService = new AIService();

  const analyzeImage = useCallback(
    async (imageUri: string): Promise<ImageAnalysis | null> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'ADD_TO_QUEUE', payload: imageUri });
        dispatch({ type: 'CLEAR_ERROR' });

        const analysis = await aiService.analyzeImage(imageUri);

        dispatch({ type: 'SET_ANALYSIS', payload: analysis });
        dispatch({ type: 'ADD_TO_HISTORY', payload: analysis });
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: imageUri });

        return analysis;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: imageUri });
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
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const advice = await aiService.generateStyleAdvice(userProfile, wardrobeItems);

        dispatch({ type: 'SET_STYLE_ADVICE', payload: advice });

        return advice;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to generate style advice';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return null;
      }
    },
    [aiService],
  );

  const categorizeItem = useCallback(
    async (description: string): Promise<ItemCategorizationResult | null> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const result = await aiService.categorizeItem(description);

        dispatch({ type: 'SET_LOADING', payload: false });

        return result as ItemCategorizationResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to categorize item';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return null;
      }
    },
    [aiService],
  );

  const extractColors = useCallback(
    async (imageUri: string): Promise<ColorExtractionResult | null> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const result = await aiService.extractColors(imageUri);

        dispatch({ type: 'SET_LOADING', payload: false });

        // Map ColorExtraction to ColorExtractionResult
        return {
          dominantColors: result.dominantColors || [],
          colorPalette: result.dominantColors || [],
          confidence: 0.8, // Default confidence since ColorExtraction doesn't have this field
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to extract colors';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return null;
      }
    },
    [aiService],
  );

  const detectClothingItems = useCallback(
    async (imageUri: string): Promise<ClothingDetectionResult | null> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });

        const result = await aiService.detectClothingItems(imageUri);

        dispatch({ type: 'SET_LOADING', payload: false });

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
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return null;
      }
    },
    [aiService],
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const isProcessing = useCallback(
    (imageUri: string): boolean => {
      return state.processingQueue.includes(imageUri);
    },
    [state.processingQueue],
  );

  const value: AIContextType = {
    state,
    dispatch,
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
