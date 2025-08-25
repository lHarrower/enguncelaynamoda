// React hook for AI-powered item naming
import { useCallback, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { AINameingService } from '@/services/aiNamingService';
import {
  ItemCategory,
  NamingPreferences,
  NamingRequest,
  NamingResponse,
  WardrobeItem,
} from '@/types/aynaMirror';

import { errorInDev, logInDev } from '../utils/consoleSuppress';

export interface UseAINamingReturn {
  // State
  isGenerating: boolean;
  error: string | null;
  lastResponse: NamingResponse | null;

  // Actions
  generateName: (request: NamingRequest) => Promise<NamingResponse | null>;
  generateNameForItem: (item: Partial<WardrobeItem>) => Promise<NamingResponse | null>;
  clearError: () => void;

  // Preferences
  preferences: NamingPreferences | null;
  updatePreferences: (prefs: Partial<NamingPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;

  // Utilities
  getEffectiveName: (item: WardrobeItem) => string;
  saveNamingChoice: (itemId: string, choice: 'ai' | 'user', customName?: string) => Promise<void>;
}

export const useAINaming = (): UseAINamingReturn => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<NamingResponse | null>(null);
  const [preferences, setPreferences] = useState<NamingPreferences | null>(null);

  /**
   * Generate name using AI naming service
   */
  const generateName = useCallback(
    async (request: NamingRequest): Promise<NamingResponse | null> => {
      if (!user) {
        setError('User must be authenticated to generate names');
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        logInDev('[useAINaming] Generating name for request:', request);

        const response = await AINameingService.generateItemName({
          ...request,
          userPreferences: request.userPreferences
            ? ({
                userId: request.userPreferences.userId || user.id,
                namingStyle: request.userPreferences.namingStyle,
                includeBrand: request.userPreferences.includeBrand,
                includeColor: request.userPreferences.includeColor,
                includeMaterial: request.userPreferences.includeMaterial,
                includeStyle: request.userPreferences.includeStyle,
                preferredLanguage: request.userPreferences.preferredLanguage,
                autoAcceptAINames: request.userPreferences.autoAcceptAINames,
                createdAt: request.userPreferences.createdAt,
                updatedAt: request.userPreferences.updatedAt,
              } as NamingPreferences)
            : undefined,
        });

        setLastResponse(response);
        logInDev('[useAINaming] Generated name response:', response);

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate name';
        errorInDev(
          '[useAINaming] Error generating name:',
          err instanceof Error ? err : String(err),
        );
        setError(errorMessage);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [user],
  );

  /**
   * Generate name for a wardrobe item
   */
  const generateNameForItem = useCallback(
    async (item: Partial<WardrobeItem>): Promise<NamingResponse | null> => {
      if (!item.imageUri) {
        setError('Item must have an image to generate name');
        return null;
      }

      const request: NamingRequest = {
        itemId: item.id,
        imageUri: item.imageUri,
        category: item.category as ItemCategory,
        colors: item.colors,
        brand: item.brand,
        userPreferences: undefined,
      };

      return generateName(request);
    },
    [generateName, user],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load user naming preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const prefs = await AINameingService.getUserNamingPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      errorInDev(
        '[useAINaming] Error loading preferences:',
        err instanceof Error ? err : String(err),
      );
      setError('Failed to load naming preferences');
    }
  }, [user]);

  /**
   * Update user naming preferences
   */
  const updatePreferences = useCallback(
    async (prefs: Partial<NamingPreferences>) => {
      if (!user) {
        setError('User must be authenticated to update preferences');
        return;
      }

      try {
        const updatedPrefs = await AINameingService.updateNamingPreferences(user.id, prefs);
        setPreferences(updatedPrefs);
      } catch (err) {
        errorInDev(
          '[useAINaming] Error updating preferences:',
          err instanceof Error ? err : String(err),
        );
        setError('Failed to update naming preferences');
      }
    },
    [user],
  );

  /**
   * Get effective name for an item (user name or AI name)
   */
  const getEffectiveName = useCallback((item: WardrobeItem): string => {
    return AINameingService.getEffectiveItemName(
      item.name,
      item.aiGeneratedName,
      item.category,
      item.colors,
    );
  }, []);

  /**
   * Save user's naming choice and update history
   */
  const saveNamingChoice = useCallback(
    async (itemId: string, choice: 'ai' | 'user', customName?: string) => {
      if (!user || !lastResponse) {
        return;
      }

      try {
        await AINameingService.saveNamingHistory(
          itemId,
          user.id,
          lastResponse.aiGeneratedName,
          choice === 'user' ? customName : undefined,
          lastResponse.analysisData,
        );
      } catch (err) {
        errorInDev(
          '[useAINaming] Error saving naming choice:',
          err instanceof Error ? err : String(err),
        );
        setError('Failed to save naming choice');
      }
    },
    [user, lastResponse],
  );

  return {
    // State
    isGenerating,
    error,
    lastResponse,

    // Actions
    generateName,
    generateNameForItem,
    clearError,

    // Preferences
    preferences,
    updatePreferences,
    loadPreferences,

    // Utilities
    getEffectiveName,
    saveNamingChoice,
  };
};

// Hook for quick name generation without state management
export const useQuickNaming = () => {
  const generateQuickName = useCallback(
    async (
      imageUri: string,
      category?: string,
      colors?: string[],
      brand?: string,
    ): Promise<string> => {
      try {
        const request: NamingRequest = {
          imageUri,
          category: category as ItemCategory,
          colors,
          brand,
        };

        const response = await AINameingService.generateItemName(request);
        return response.aiGeneratedName;
      } catch (error) {
        errorInDev(
          '[useQuickNaming] Error generating quick name:',
          error instanceof Error ? error : String(error),
        );

        // Return fallback name
        if (colors && colors.length > 0 && category) {
          return `${colors[0]} ${category}`;
        }
        return category || 'Item';
      }
    },
    [],
  );

  return { generateQuickName };
};

// Hook for naming preferences management
export const useNamingPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NamingPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prefs = await AINameingService.getUserNamingPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      errorInDev(
        '[useNamingPreferences] Error loading preferences:',
        err instanceof Error ? err : String(err),
      );
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updatePreferences = useCallback(
    async (prefs: Partial<NamingPreferences>) => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedPrefs = await AINameingService.updateNamingPreferences(user.id, prefs);
        setPreferences(updatedPrefs);
      } catch (err) {
        errorInDev(
          '[useNamingPreferences] Error updating preferences:',
          err instanceof Error ? err : String(err),
        );
        setError('Failed to update preferences');
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  return {
    preferences,
    isLoading,
    error,
    loadPreferences,
    updatePreferences,
  };
};
