import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleDNAProfile } from '@/hooks/useStyleDNA';
import { WardrobeItem } from '@/types/wardrobe';
import { ConsentType } from '@/services/kvkkConsentService';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppError {
  id: string;
  message: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

interface ImageAnalysis {
  id: string;
  imageUri: string;
  timestamp: Date;
  colors: string[];
  style: string;
  category: string;
  confidence: number;
}

interface StyleAdvice {
  id: string;
  advice: string;
  recommendations: string[];
  confidence: number;
  timestamp: Date;
}

interface GlobalState {
  // User & Auth state
  user: User | null;
  isAuthenticated: boolean;
  session: any | null;
  
  // Style DNA state
  styleDNA: StyleDNAProfile | null;
  
  // App state
  isOnboardingComplete: boolean;
  hasCompletedStyleDNA: boolean;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  
  // Wardrobe state (consolidated from WardrobeProvider)
  wardrobeItems: WardrobeItem[];
  wardrobeLoading: boolean;
  wardrobeError: string | null;
  wardrobeFavorites: string[];
  wardrobeSearchQuery: string;
  wardrobeSelectedCategory: string | null;
  wardrobeSortBy: 'name' | 'date' | 'category';
  
  // Error state (consolidated from ErrorProvider)
  globalError: AppError | null;
  errors: Record<string, AppError>;
  errorReportingEnabled: boolean;
  
  // KVKK state (consolidated from KVKKContext)
  kvkkConsents: Record<ConsentType, boolean>;
  kvkkCompliant: boolean;
  kvkkModalVisible: boolean;
  kvkkBannerVisible: boolean;
  
  // AI state (consolidated from AIProvider)
  aiLoading: boolean;
  aiError: string | null;
  lastAnalysis: ImageAnalysis | null;
  styleAdvice: StyleAdvice | null;
  analysisHistory: ImageAnalysis[];
  processingQueue: string[];
  
  // Loading states
  appLoading: boolean;
  
  // Actions - User & Auth
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setSession: (session: any | null) => void;
  
  // Actions - Style DNA
  setStyleDNA: (styleDNA: StyleDNAProfile | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setStyleDNAComplete: (complete: boolean) => void;
  
  // Actions - UI
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'tr' | 'en') => void;
  
  // Actions - AI
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string | null) => void;
  setLastAnalysis: (analysis: ImageAnalysis | null) => void;
  setStyleAdvice: (advice: StyleAdvice | null) => void;
  addToAnalysisHistory: (analysis: ImageAnalysis) => void;
  addToProcessingQueue: (imageUri: string) => void;
  removeFromProcessingQueue: (imageUri: string) => void;
  clearAIError: () => void;
  resetAIState: () => void;
  
  // Actions - Wardrobe
  setWardrobeItems: (items: WardrobeItem[]) => void;
  addWardrobeItem: (item: WardrobeItem) => void;
  updateWardrobeItem: (id: string, updates: Partial<WardrobeItem>) => void;
  removeWardrobeItem: (id: string) => void;
  setWardrobeLoading: (loading: boolean) => void;
  setWardrobeError: (error: string | null) => void;
  toggleWardrobeFavorite: (id: string) => void;
  setWardrobeSearchQuery: (query: string) => void;
  setWardrobeSelectedCategory: (category: string | null) => void;
  setWardrobeSortBy: (sortBy: 'name' | 'date' | 'category') => void;
  
  // Actions - Error Management
  setGlobalError: (error: AppError | null) => void;
  addError: (id: string, error: AppError) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  setErrorReporting: (enabled: boolean) => void;
  
  // Actions - KVKK
  setKVKKConsent: (type: ConsentType, granted: boolean) => void;
  setKVKKCompliant: (compliant: boolean) => void;
  setKVKKModalVisible: (visible: boolean) => void;
  setKVKKBannerVisible: (visible: boolean) => void;
  
  // Actions - App
  setAppLoading: (loading: boolean) => void;
  clearUserData: () => void;
  reset: () => void;
}

const initialState = {
  // User & Auth
  user: null,
  isAuthenticated: false,
  session: null,
  
  // Style DNA
  styleDNA: null,
  isOnboardingComplete: false,
  hasCompletedStyleDNA: false,
  
  // UI
  theme: 'system' as const,
  language: 'tr' as const,
  
  // Wardrobe
  wardrobeItems: [],
  wardrobeLoading: false,
  wardrobeError: null,
  wardrobeFavorites: [],
  wardrobeSearchQuery: '',
  wardrobeSelectedCategory: null,
  wardrobeSortBy: 'date' as const,
  
  // Error Management
  globalError: null,
  errors: {},
  errorReportingEnabled: true,
  
  // KVKK
  kvkkConsents: {} as Record<ConsentType, boolean>,
  kvkkCompliant: false,
  kvkkModalVisible: false,
  kvkkBannerVisible: true,
  
  // AI
  aiLoading: false,
  aiError: null,
  lastAnalysis: null,
  styleAdvice: null,
  analysisHistory: [],
  processingQueue: [],
  
  // App
  appLoading: false,
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User & Auth Actions
      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: user !== null 
        });
      },

      setAuthenticated: (authenticated) => {
        set({ isAuthenticated: authenticated });
        if (!authenticated) {
          set({ user: null, session: null });
        }
      },

      setSession: (session) => {
        set({ session });
      },

      // Style DNA Actions
      setStyleDNA: (styleDNA) => {
        set({ 
          styleDNA,
          hasCompletedStyleDNA: styleDNA !== null 
        });
      },

      setOnboardingComplete: (complete) => {
        set({ isOnboardingComplete: complete });
      },

      setStyleDNAComplete: (complete) => {
        set({ hasCompletedStyleDNA: complete });
      },

      // UI Actions
      setTheme: (theme) => {
        set({ theme });
      },

      setLanguage: (language) => {
        set({ language });
      },

      // AI Actions
      setAILoading: (loading) => {
        set({ aiLoading: loading });
      },

      setAIError: (error) => {
        set({ aiError: error, aiLoading: false });
      },

      setLastAnalysis: (analysis) => {
        set({ lastAnalysis: analysis, aiLoading: false, aiError: null });
      },

      setStyleAdvice: (advice) => {
        set({ styleAdvice: advice, aiLoading: false, aiError: null });
      },

      addToAnalysisHistory: (analysis) => {
        set((state) => ({
          analysisHistory: [analysis, ...state.analysisHistory].slice(0, 50) // Keep last 50
        }));
      },

      addToProcessingQueue: (imageUri) => {
        set((state) => ({
          processingQueue: [...state.processingQueue, imageUri]
        }));
      },

      removeFromProcessingQueue: (imageUri) => {
        set((state) => ({
          processingQueue: state.processingQueue.filter(uri => uri !== imageUri)
        }));
      },

      clearAIError: () => {
        set({ aiError: null });
      },

      resetAIState: () => {
        set({
          aiLoading: false,
          aiError: null,
          lastAnalysis: null,
          styleAdvice: null,
          analysisHistory: [],
          processingQueue: []
        });
      },

      // Wardrobe Actions
      setWardrobeItems: (items) => {
        set({ wardrobeItems: items });
      },

      addWardrobeItem: (item) => {
        set((state) => ({
          wardrobeItems: [item, ...state.wardrobeItems]
        }));
      },

      updateWardrobeItem: (id, updates) => {
        set((state) => ({
          wardrobeItems: state.wardrobeItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
          )
        }));
      },

      removeWardrobeItem: (id) => {
        set((state) => ({
          wardrobeItems: state.wardrobeItems.filter(item => item.id !== id),
          wardrobeFavorites: state.wardrobeFavorites.filter(fav => fav !== id)
        }));
      },

      setWardrobeLoading: (loading) => {
        set({ wardrobeLoading: loading });
      },

      setWardrobeError: (error) => {
        set({ wardrobeError: error });
      },

      toggleWardrobeFavorite: (id) => {
        set((state) => {
          const isFavorite = state.wardrobeFavorites.includes(id);
          return {
            wardrobeFavorites: isFavorite 
              ? state.wardrobeFavorites.filter(fav => fav !== id)
              : [...state.wardrobeFavorites, id]
          };
        });
      },

      setWardrobeSearchQuery: (query) => {
        set({ wardrobeSearchQuery: query });
      },

      setWardrobeSelectedCategory: (category) => {
        set({ wardrobeSelectedCategory: category });
      },

      setWardrobeSortBy: (sortBy) => {
        set({ wardrobeSortBy: sortBy });
      },

      // Error Management Actions
      setGlobalError: (error) => {
        set({ globalError: error });
      },

      addError: (id, error) => {
        set((state) => ({
          errors: { ...state.errors, [id]: error }
        }));
      },

      removeError: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.errors;
          return { errors: rest };
        });
      },

      clearAllErrors: () => {
        set({ errors: {}, globalError: null });
      },

      setErrorReporting: (enabled) => {
        set({ errorReportingEnabled: enabled });
      },

      // KVKK Actions
      setKVKKConsent: (type, granted) => {
        set((state) => ({
          kvkkConsents: { ...state.kvkkConsents, [type]: granted }
        }));
      },

      setKVKKCompliant: (compliant) => {
        set({ kvkkCompliant: compliant });
      },

      setKVKKModalVisible: (visible) => {
        set({ kvkkModalVisible: visible });
      },

      setKVKKBannerVisible: (visible) => {
        set({ kvkkBannerVisible: visible });
      },

      // App Actions
      setAppLoading: (loading) => {
        set({ appLoading: loading });
      },

      clearUserData: () => {
        set({
          user: null,
          isAuthenticated: false,
          session: null,
          styleDNA: null,
          hasCompletedStyleDNA: false,
          wardrobeItems: [],
          wardrobeFavorites: [],
          wardrobeSearchQuery: '',
          wardrobeSelectedCategory: null,
          errors: {},
          globalError: null,
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'aynamoda-global-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist core user data
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        session: state.session,
        styleDNA: state.styleDNA,
        isOnboardingComplete: state.isOnboardingComplete,
        hasCompletedStyleDNA: state.hasCompletedStyleDNA,
        theme: state.theme,
        language: state.language,
        // Persist wardrobe data
        wardrobeItems: state.wardrobeItems,
        wardrobeFavorites: state.wardrobeFavorites,
        wardrobeSearchQuery: state.wardrobeSearchQuery,
        wardrobeSelectedCategory: state.wardrobeSelectedCategory,
        wardrobeSortBy: state.wardrobeSortBy,
        // Persist KVKK consents
        kvkkConsents: state.kvkkConsents,
        kvkkCompliant: state.kvkkCompliant,
        // Persist error reporting preference
        errorReportingEnabled: state.errorReportingEnabled,
      }),
    }
  )
);

// ===== SELECTORS FOR BETTER PERFORMANCE =====

// User & Auth Selectors
export const useUser = () => useGlobalStore(state => state.user);
export const useIsAuthenticated = () => useGlobalStore(state => state.isAuthenticated);
export const useSession = () => useGlobalStore(state => state.session);

// Style DNA Selectors
export const useStyleDNA = () => useGlobalStore(state => state.styleDNA);
export const useIsOnboardingComplete = () => useGlobalStore(state => state.isOnboardingComplete);
export const useHasCompletedStyleDNA = () => useGlobalStore(state => state.hasCompletedStyleDNA);

// UI Selectors
export const useTheme = () => useGlobalStore(state => state.theme);
export const useLanguage = () => useGlobalStore(state => state.language);

// Wardrobe Selectors
export const useWardrobeItems = () => useGlobalStore(state => state.wardrobeItems);
export const useWardrobeLoading = () => useGlobalStore(state => state.wardrobeLoading);
export const useWardrobeError = () => useGlobalStore(state => state.wardrobeError);
export const useWardrobeFavorites = () => useGlobalStore(state => state.wardrobeFavorites);
export const useWardrobeSearchQuery = () => useGlobalStore(state => state.wardrobeSearchQuery);
export const useWardrobeSelectedCategory = () => useGlobalStore(state => state.wardrobeSelectedCategory);
export const useWardrobeSortBy = () => useGlobalStore(state => state.wardrobeSortBy);

// Computed Wardrobe Selectors
export const useFilteredWardrobeItems = () => useGlobalStore(state => {
  const { wardrobeItems, wardrobeSearchQuery, wardrobeSelectedCategory, wardrobeSortBy } = state;
  
  let filtered = wardrobeItems;
  
  // Apply search filter
  if (wardrobeSearchQuery) {
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(wardrobeSearchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(wardrobeSearchQuery.toLowerCase())
    );
  }
  
  // Apply category filter
  if (wardrobeSelectedCategory) {
    filtered = filtered.filter(item => item.category === wardrobeSelectedCategory);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (wardrobeSortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'date':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });
  
  return filtered;
});

export const useFavoriteWardrobeItems = () => useGlobalStore(state => {
  const { wardrobeItems, wardrobeFavorites } = state;
  return wardrobeItems.filter(item => wardrobeFavorites.includes(item.id));
});

// Error Selectors
export const useGlobalError = () => useGlobalStore(state => state.globalError);
export const useErrors = () => useGlobalStore(state => state.errors);
export const useErrorReportingEnabled = () => useGlobalStore(state => state.errorReportingEnabled);

// KVKK Selectors
export const useKVKKConsents = () => useGlobalStore(state => state.kvkkConsents);
export const useKVKKCompliant = () => useGlobalStore(state => state.kvkkCompliant);
export const useKVKKModalVisible = () => useGlobalStore(state => state.kvkkModalVisible);
export const useKVKKBannerVisible = () => useGlobalStore(state => state.kvkkBannerVisible);

// AI Selectors
export const useAILoading = () => useGlobalStore(state => state.aiLoading);
export const useAIError = () => useGlobalStore(state => state.aiError);
export const useLastAnalysis = () => useGlobalStore(state => state.lastAnalysis);
export const useStyleAdvice = () => useGlobalStore(state => state.styleAdvice);
export const useAnalysisHistory = () => useGlobalStore(state => state.analysisHistory);
export const useProcessingQueue = () => useGlobalStore(state => state.processingQueue);

// App Selectors
export const useAppLoading = () => useGlobalStore(state => state.appLoading);

// ===== ACTION SELECTORS =====

// User & Auth Actions
export const useUserActions = () => useGlobalStore(state => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setSession: state.setSession,
  clearUserData: state.clearUserData,
}));

// Style DNA Actions
export const useStyleDNAActions = () => useGlobalStore(state => ({
  setStyleDNA: state.setStyleDNA,
  setOnboardingComplete: state.setOnboardingComplete,
  setStyleDNAComplete: state.setStyleDNAComplete,
}));

// UI Actions
export const useUIActions = () => useGlobalStore(state => ({
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
}));

// Wardrobe Actions
export const useWardrobeActions = () => useGlobalStore(state => ({
  setWardrobeItems: state.setWardrobeItems,
  addWardrobeItem: state.addWardrobeItem,
  updateWardrobeItem: state.updateWardrobeItem,
  removeWardrobeItem: state.removeWardrobeItem,
  setWardrobeLoading: state.setWardrobeLoading,
  setWardrobeError: state.setWardrobeError,
  toggleWardrobeFavorite: state.toggleWardrobeFavorite,
  setWardrobeSearchQuery: state.setWardrobeSearchQuery,
  setWardrobeSelectedCategory: state.setWardrobeSelectedCategory,
  setWardrobeSortBy: state.setWardrobeSortBy,
}));

// Error Actions
export const useErrorActions = () => useGlobalStore(state => ({
  setGlobalError: state.setGlobalError,
  addError: state.addError,
  removeError: state.removeError,
  clearAllErrors: state.clearAllErrors,
  setErrorReporting: state.setErrorReporting,
}));

// KVKK Actions
export const useKVKKActions = () => useGlobalStore(state => ({
  setKVKKConsent: state.setKVKKConsent,
  setKVKKCompliant: state.setKVKKCompliant,
  setKVKKModalVisible: state.setKVKKModalVisible,
  setKVKKBannerVisible: state.setKVKKBannerVisible,
}));

// AI Actions
export const useAIActions = () => useGlobalStore(state => ({
  setAILoading: state.setAILoading,
  setAIError: state.setAIError,
  setLastAnalysis: state.setLastAnalysis,
  setStyleAdvice: state.setStyleAdvice,
  addToAnalysisHistory: state.addToAnalysisHistory,
  addToProcessingQueue: state.addToProcessingQueue,
  removeFromProcessingQueue: state.removeFromProcessingQueue,
  clearAIError: state.clearAIError,
  resetAIState: state.resetAIState,
}));

// App Actions
export const useAppActions = () => useGlobalStore(state => ({
  setAppLoading: state.setAppLoading,
  reset: state.reset,
}));

// Legacy Actions Selector (for backward compatibility)
export const useGlobalActions = () => useGlobalStore(state => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setSession: state.setSession,
  setStyleDNA: state.setStyleDNA,
  setOnboardingComplete: state.setOnboardingComplete,
  setStyleDNAComplete: state.setStyleDNAComplete,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
  clearUserData: state.clearUserData,
  reset: state.reset,
}));