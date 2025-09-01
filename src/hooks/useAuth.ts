// Authentication Hook
import { useCallback, useEffect, useState } from 'react';

import { logInDev, warnInDev } from '@/utils/consoleSuppress';
import { apiClient, LoginRequest, RegisterRequest, UserProfile as ApiUserProfile } from '@/services/api/apiClient';

import { User, UserAppPreferences, UserProfile, UserSubscription } from '../types/user';
import { isObject, safeParse } from '../utils/safeJSON';
import { secureStorage } from '../utils/secureStorage';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Load user from storage on mount
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        await secureStorage.initialize();
        const stored = await secureStorage.getItem('ayna_auth_user');
        if (stored) {
          const raw = safeParse<unknown>(stored, null);
          // Minimal structural guard; we intentionally avoid deep validation here
          if (isObject(raw) && typeof raw.id === 'string' && typeof raw.email === 'string') {
            // Reconstruct to satisfy typing while tolerating partial persisted shape
            const user: User = {
              id: String(raw.id),
              email: String(raw.email),
              name: typeof raw.name === 'string' ? raw.name : '',
              avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
              // Provide defensive fallbacks for nested objects
              preferences: isObject(raw.preferences)
                ? {
                    theme:
                      typeof (raw.preferences as Partial<UserAppPreferences>).theme === 'string'
                        ? ((raw.preferences as Partial<UserAppPreferences>).theme as
                            | 'light'
                            | 'dark')
                        : 'light',
                    notifications: Boolean(
                      (raw.preferences as Partial<UserAppPreferences>).notifications ?? true,
                    ),
                    hapticFeedback: Boolean(
                      (raw.preferences as Partial<UserAppPreferences>).hapticFeedback ?? true,
                    ),
                    autoBackup: Boolean(
                      (raw.preferences as Partial<UserAppPreferences>).autoBackup ?? true,
                    ),
                    aiSuggestions: Boolean(
                      (raw.preferences as Partial<UserAppPreferences>).aiSuggestions ?? true,
                    ),
                    privacyMode: Boolean(
                      (raw.preferences as Partial<UserAppPreferences>).privacyMode ?? false,
                    ),
                  }
                : {
                    theme: 'light',
                    notifications: true,
                    hapticFeedback: true,
                    autoBackup: true,
                    aiSuggestions: true,
                    privacyMode: false,
                  },
              profile: isObject(raw.profile)
                ? {
                    style:
                      typeof (raw.profile as Partial<UserProfile>).style === 'string'
                        ? (raw.profile as Partial<UserProfile>).style!
                        : 'casual',
                    favoriteColors: Array.isArray(
                      (raw.profile as Partial<UserProfile>).favoriteColors,
                    )
                      ? (raw.profile as Partial<UserProfile>).favoriteColors!
                      : [],
                    bodyType:
                      typeof (raw.profile as Partial<UserProfile>).bodyType === 'string'
                        ? (raw.profile as Partial<UserProfile>).bodyType!
                        : 'average',
                    lifestyle:
                      typeof (raw.profile as Partial<UserProfile>).lifestyle === 'string'
                        ? (raw.profile as Partial<UserProfile>).lifestyle!
                        : 'casual',
                    budget: ['low', 'medium', 'high'].includes(
                      (raw.profile as Partial<UserProfile>).budget!,
                    )
                      ? ((raw.profile as Partial<UserProfile>).budget as 'low' | 'medium' | 'high')
                      : 'medium',
                    sustainabilityGoals: Array.isArray(
                      (raw.profile as Partial<UserProfile>).sustainabilityGoals,
                    )
                      ? (raw.profile as Partial<UserProfile>).sustainabilityGoals!
                      : [],
                  }
                : {
                    style: 'casual',
                    favoriteColors: [],
                    bodyType: 'average',
                    lifestyle: 'casual',
                    budget: 'medium',
                    sustainabilityGoals: [],
                  },
              subscription: isObject(raw.subscription)
                ? {
                    plan:
                      (raw.subscription as Partial<UserSubscription>).plan &&
                      ['free', 'premium', 'pro'].includes(
                        (raw.subscription as Partial<UserSubscription>).plan!,
                      )
                        ? (raw.subscription as Partial<UserSubscription>).plan!
                        : 'free',
                    status:
                      (raw.subscription as Partial<UserSubscription>).status &&
                      ['active', 'inactive', 'cancelled', 'expired'].includes(
                        (raw.subscription as Partial<UserSubscription>).status!,
                      )
                        ? (raw.subscription as Partial<UserSubscription>).status!
                        : 'active',
                    expiresAt: (raw.subscription as Partial<UserSubscription>).expiresAt
                      ? new Date((raw.subscription as Partial<UserSubscription>).expiresAt!)
                      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  }
                : {
                    plan: 'free',
                    status: 'active',
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  },
              createdAt: (raw as { createdAt?: string | Date }).createdAt
                ? new Date((raw as { createdAt?: string | Date }).createdAt as string)
                : new Date(),
              updatedAt: (raw as { updatedAt?: string | Date }).updatedAt
                ? new Date((raw as { updatedAt?: string | Date }).updatedAt as string)
                : new Date(),
            };
            setState((prev) => ({
              ...prev,
              user,
              isAuthenticated: true,
              loading: false,
            }));
            return;
          }
        }
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        warnInDev('Failed to load stored user:', error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    void loadStoredUser(); // eslint-disable-line no-void
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuth = await apiClient.isAuthenticated();
        if (isAuth) {
          const profileResponse = await apiClient.getUserProfile();
          if (profileResponse.success && profileResponse.data) {
            // Convert API user profile to local User type
            const apiUser = profileResponse.data;
            const user: User = {
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name || '',
              avatar: apiUser.avatar_url,
              preferences: {
                theme: 'light',
                notifications: true,
                hapticFeedback: true,
                autoBackup: true,
                aiSuggestions: true,
                privacyMode: false,
              },
              profile: {
                style: 'casual',
                favoriteColors: [],
                bodyType: 'average',
                lifestyle: 'casual',
                budget: 'medium',
                sustainabilityGoals: [],
              },
              subscription: {
                plan: 'free',
                status: 'active',
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
              createdAt: new Date(apiUser.created_at),
              updatedAt: new Date(apiUser.updated_at),
            };
            
            setState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
              loading: false,
            }));
            
            await secureStorage.setItem('ayna_auth_user', JSON.stringify(user));
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        warnInDev('Auth check failed:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    void checkAuthStatus();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const loginRequest: LoginRequest = { email, password };
      const response = await apiClient.login(loginRequest);

      if (response.success && response.data) {
        const apiUser = response.data.user;
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name || '',
          avatar: apiUser.avatar_url,
          preferences: {
            theme: 'light',
            notifications: true,
            hapticFeedback: true,
            autoBackup: true,
            aiSuggestions: true,
            privacyMode: false,
          },
          profile: {
            style: 'casual',
            favoriteColors: [],
            bodyType: 'average',
            lifestyle: 'casual',
            budget: 'medium',
            sustainabilityGoals: [],
          },
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          createdAt: new Date(apiUser.created_at),
          updatedAt: new Date(apiUser.updated_at),
        };

        setState((prev) => ({ 
          ...prev, 
          user,
          loading: false, 
          isAuthenticated: true 
        }));
        
        await secureStorage.setItem('ayna_auth_user', JSON.stringify(user));
        return { success: true };
      } else {
        const errorMessage = response.error || 'Giriş başarısız';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const registerRequest: RegisterRequest = { 
        email, 
        password, 
        name: name || '' 
      };
      const response = await apiClient.register(registerRequest);

      if (response.success && response.data) {
        const apiUser = response.data.user;
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name || '',
          avatar: apiUser.avatar_url,
          preferences: {
            theme: 'light',
            notifications: true,
            hapticFeedback: true,
            autoBackup: true,
            aiSuggestions: true,
            privacyMode: false,
          },
          profile: {
            style: 'casual',
            favoriteColors: [],
            bodyType: 'average',
            lifestyle: 'casual',
            budget: 'medium',
            sustainabilityGoals: [],
          },
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          createdAt: new Date(apiUser.created_at),
          updatedAt: new Date(apiUser.updated_at),
        };

        setState((prev) => ({ 
          ...prev, 
          user,
          loading: false, 
          isAuthenticated: true 
        }));
        
        await secureStorage.setItem('ayna_auth_user', JSON.stringify(user));
        return { success: true };
      } else {
        const errorMessage = response.error || 'Kayıt başarısız';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıt başarısız';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      await apiClient.logout();

      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });

      await secureStorage.removeItem('ayna_auth_user');
    } catch (error) {
      warnInDev('Sign out failed:', error);
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      await secureStorage.removeItem('ayna_auth_user');
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        if (!state.user) {
          return { success: false, error: 'Kullanıcı girişi yapılmamış' };
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Map local User updates to API format
        const apiUpdates: Partial<ApiUserProfile> = {
          name: updates.name,
          avatar_url: updates.avatar,
        };

        const response = await apiClient.updateUserProfile(apiUpdates);

        if (response.success && response.data) {
          const updatedUser = { ...state.user, ...updates, updatedAt: new Date() };
          setState((prev) => ({
            ...prev,
            user: updatedUser,
            loading: false,
          }));

          await secureStorage.setItem('ayna_auth_user', JSON.stringify(updatedUser));
          return { success: true };
        } else {
          const errorMessage = response.error || 'Profil güncellenemedi';
          setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Profil güncellenemedi';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }
    },
    [state.user],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
  };
}

export default useAuth;
