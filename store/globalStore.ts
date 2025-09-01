import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleDNAProfile } from '@/hooks/useStyleDNA';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface GlobalState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Style DNA state
  styleDNA: StyleDNAProfile | null;
  
  // App state
  isOnboardingComplete: boolean;
  hasCompletedStyleDNA: boolean;
  
  // UI state
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setStyleDNA: (styleDNA: StyleDNAProfile | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setStyleDNAComplete: (complete: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'tr' | 'en') => void;
  clearUserData: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  styleDNA: null,
  isOnboardingComplete: false,
  hasCompletedStyleDNA: false,
  theme: 'system' as const,
  language: 'tr' as const,
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: user !== null 
        });
      },

      setAuthenticated: (authenticated) => {
        set({ isAuthenticated: authenticated });
        if (!authenticated) {
          set({ user: null });
        }
      },

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

      setTheme: (theme) => {
        set({ theme });
      },

      setLanguage: (language) => {
        set({ language });
      },

      clearUserData: () => {
        set({
          user: null,
          isAuthenticated: false,
          styleDNA: null,
          hasCompletedStyleDNA: false,
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
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        styleDNA: state.styleDNA,
        isOnboardingComplete: state.isOnboardingComplete,
        hasCompletedStyleDNA: state.hasCompletedStyleDNA,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// Selectors for better performance
export const useUser = () => useGlobalStore(state => state.user);
export const useIsAuthenticated = () => useGlobalStore(state => state.isAuthenticated);
export const useStyleDNA = () => useGlobalStore(state => state.styleDNA);
export const useIsOnboardingComplete = () => useGlobalStore(state => state.isOnboardingComplete);
export const useHasCompletedStyleDNA = () => useGlobalStore(state => state.hasCompletedStyleDNA);
export const useTheme = () => useGlobalStore(state => state.theme);
export const useLanguage = () => useGlobalStore(state => state.language);

// Action selectors
export const useGlobalActions = () => useGlobalStore(state => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setStyleDNA: state.setStyleDNA,
  setOnboardingComplete: state.setOnboardingComplete,
  setStyleDNAComplete: state.setStyleDNAComplete,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
  clearUserData: state.clearUserData,
  reset: state.reset,
}));