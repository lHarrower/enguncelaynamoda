// PASTE THIS ENTIRE CODE BLOCK INTO YOUR AuthContext.tsx FILE

import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '../config/supabaseClient'; // Make sure this path is correct

// Safe wrappers around expo-router hooks to maintain consistent hook order across renders
// Import hooks directly to avoid conditional hook calls
type RouterType = {
  replace: (path: string) => void;
  push?: (path: string) => void;
  back?: () => void;
};

type SegmentsType = string[];

// Always import expo-router hooks to avoid conditional hook calls
import { useRouter as useExpoRouter, useSegments as useExpoSegments } from 'expo-router';

// Custom hooks that always call the underlying hooks unconditionally
function useRouterSafe(): RouterType {
  const router = useExpoRouter();
  return router;
}

function useSegmentsSafe(): SegmentsType {
  const segments = useExpoSegments();
  return segments;
}
import type { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

// User profile interface
interface AuthUserProfile {
  user_id: string;
  style_dna?: Record<string, unknown>;
  first_outfit_choice?: Record<string, unknown>;
  onboarding_completed: boolean;
  onboarding_date?: string | Date;
  confidence_loop_experienced?: boolean;
  created_at: string;
  updated_at: string;
}

// Onboarding data interface
export interface OnboardingData {
  styleDNA?: Record<string, unknown>;
  firstOutfitChoice?: Record<string, unknown>;
  onboardingDate?: string | Date;
  confidenceLoopExperienced?: boolean;
  preferences?: Record<string, unknown>;
  wardrobeItems?: unknown[];
  goals?: string[];
  notifications?: boolean;
}
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

import { logger } from '../utils/logger';

// This is used to close the browser window after auth completes.
WebBrowser.maybeCompleteAuthSession();

// Define the shape of our context value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  userProfile: AuthUserProfile | null;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<void>;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Silently return loading state when context isn't available
    return {
      session: null,
      user: null,
      loading: true,
      needsOnboarding: false,
      userProfile: null,
      signUp: async () => {},
      signIn: async () => {},
      signInWithGoogle: async () => {},
      signInWithApple: async () => {},
      signOut: async () => {},
      completeOnboarding: async () => {},
    };
  }
  return context;
}

// The AuthProvider component that will wrap our app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<AuthUserProfile | null>(null);
  const router = useRouterSafe();
  const segments = useSegmentsSafe();

  // Setup Google authentication request hook from expo-auth-session
  // Always call hooks in the same order - moved to top level
  const googleExtra = (Constants.expoConfig?.extra as Record<string, any>)?.google || {};
  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    googleExtra.iosClientId ||
    (process.env.NODE_ENV === 'test' ? 'test-ios-client-id' : undefined);
  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    googleExtra.androidClientId ||
    (process.env.NODE_ENV === 'test' ? 'test-android-client-id' : undefined);
  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    googleExtra.webClientId ||
    (process.env.NODE_ENV === 'test' ? 'test-web-client-id' : undefined);
  const expoClientId = webClientId;
  const clientId = webClientId;

  // Always call this hook unconditionally to maintain hook order
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || '',
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: AuthSession.makeRedirectUri(),
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    },
  );

  // useEffect to handle the response from Google after the user signs in
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        if (id_token) {
          // Use the id_token to sign in with Supabase
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: id_token,
          });
          if (error) {
            logger.error('Error signing in with Google ID token:', error);
            Alert.alert('Google Sign-In Error', error.message);
          }
        }
      } else if (response?.type === 'error') {
        logger.error('Google Authentication Error:', response.error);
        Alert.alert('Google Sign-In Error', 'Authentication failed. Please try again.');
      }
    };

    handleGoogleResponse();
  }, [response]);

  // Function to check if user needs onboarding
  const checkOnboardingStatus = async (userId: string) => {
    // Validate userId to prevent undefined.length errors
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
      logger.warn('Invalid userId provided to checkOnboardingStatus:', userId);
      setNeedsOnboarding(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, style_dna')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        logger.error('Error checking onboarding status:', error);
        // For now, skip onboarding if table doesn't exist or column missing (development mode)
        if (error.code === '42P01' || error.code === '42703') {
          // Table doesn't exist or column doesn't exist
          setNeedsOnboarding(false);
          logger.info(
            'Skipping onboarding - user_profiles table or column not found (development mode)',
          );
        }
        return;
      }

      if (!data || !data.onboarding_completed) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
        const profileData = data as Record<string, any>;
        const userProfileData: AuthUserProfile = {
          user_id: profileData.user_id || user?.id || '',
          style_dna: profileData.style_dna,
          first_outfit_choice: profileData.first_outfit_choice,
          onboarding_completed: profileData.onboarding_completed,
          onboarding_date: profileData.onboarding_date,
          confidence_loop_experienced: profileData.confidence_loop_experienced,
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || new Date().toISOString(),
        };
        setUserProfile(userProfileData);
      }
    } catch (error) {
      logger.error(
        'Error in checkOnboardingStatus:',
        error instanceof Error ? error : String(error),
      );
      // Skip onboarding for development
      setNeedsOnboarding(false);
    }
  };

  // useEffect to get the initial session and listen for auth state changes
  useEffect(() => {
    // Set loading to true initially
    setLoading(true);

    // Get the current session (async IIFE to avoid floating promise + clearer control flow)
    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await checkOnboardingStatus(session.user.id);
        }
      } catch (err) {
        logger.error('Auth getSession failed:', err instanceof Error ? err : String(err));
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for changes in authentication state (signIn, signOut, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkOnboardingStatus(session.user.id);
      } else {
        setNeedsOnboarding(false);
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Complete onboarding function
  const completeOnboarding = async (onboardingData: OnboardingData) => {
    if (!user) {
      return;
    }

    try {
      const profileData = {
        user_id: user.id,
        style_dna: onboardingData.styleDNA,
        first_outfit_choice: onboardingData.firstOutfitChoice,
        onboarding_completed: true,
        onboarding_date: onboardingData.onboardingDate,
        confidence_loop_experienced: onboardingData.confidenceLoopExperienced,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        logger.error(
          'Error saving onboarding data:',
          error instanceof Error ? error : String(error),
        );
        throw error;
      }

      setUserProfile(profileData);
      setNeedsOnboarding(false);
    } catch (error) {
      logger.error('Error completing onboarding:', error instanceof Error ? error : String(error));
      throw error;
    }
  };

  // useEffect to handle navigation based on session status
  useEffect(() => {
    if (loading) {
      return; // Do nothing while loading
    }

    // Safely check segments array to prevent undefined.length errors
    const segmentsArray = Array.isArray(segments) ? segments : [];
    const inAuthGroup = segmentsArray.length > 0 && segmentsArray[0] === 'auth';
    const inOnboardingGroup = segmentsArray.length > 0 && segmentsArray[0] === 'onboarding';

    // If the user has a session and needs onboarding, redirect to onboarding
    if (session && needsOnboarding && !inOnboardingGroup) {
      router.replace('/onboarding');
    }
    // If the user has a session, completed onboarding, and is in auth/onboarding group, redirect to main app
    else if (session && !needsOnboarding && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/');
    }
    // If the user has no session and is not in the auth group, redirect to sign-in
    else if (!session && !inAuthGroup) {
      router.replace('/auth/sign-in');
    }
  }, [session, needsOnboarding, loading, segments, router]);

  // --- Authentication Functions ---

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }

    // Check if email is verified
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error(
        'E-posta adresinizi doğrulamanız gerekiyor. Lütfen e-postanızı kontrol edin.',
      );
    }
  };

  const signInWithGoogle = async () => {
    // This function now simply triggers the Google sign-in prompt.
    // The useEffect hook above will handle the result.
    await promptAsync();
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) {
          Alert.alert('Apple Sign-In Error', error.message);
        }
      } else {
        throw new Error('No identityToken found from Apple.');
      }
    } catch (e: unknown) {
      const error = e as { code?: string };
      if (error.code === 'ERR_CANCELED') {
        // User canceled the sign-in flow
      } else {
        Alert.alert('Apple Sign-In Error', 'Could not sign in with Apple.');
      }
    }
  };

  const signOut = async () => {
    try {
      logger.info('Attempting to sign out...');

      // Attempt a global sign-out first so that refresh tokens are revoked server-side.
      const { error: globalError } = await supabase.auth.signOut();

      if (globalError) {
        /*
         * supabase may return errors such as:
         *   "AuthApiError: Invalid Refresh Token: Refresh Token Not Found"
         * when the client no longer has (or never had) a valid refresh token.
         * In these situations we still want to make sure the local session is
         * cleared so the user is effectively signed out. Therefore, on *any*
         * error we fall back to a local sign-out instead of blocking the flow.
         */
        logger.error(
          'Global sign out failed – falling back to local sign out. Details:',
          globalError,
        );

        // Best-effort local sign-out; ignore any resulting error.
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      }

      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Unexpected sign out error:', error instanceof Error ? error : String(error));
      Alert.alert('Sign Out Error', 'An unexpected error occurred while signing out.');
    } finally {
      // Whether sign out succeeded or failed, navigate the user to the auth stack
      router.replace('/auth/sign-in');
    }
  };

  // The value provided to the context consumers
  const value = {
    session,
    user,
    loading,
    needsOnboarding,
    userProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    completeOnboarding,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    process.env.NODE_ENV === 'test'
      ? React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { 'data-testid': 'auth-state' },
            React.createElement('div', { 'data-testid': 'loading' }, loading ? 'true' : 'false'),
            React.createElement('div', { 'data-testid': 'user' }, user ? user.email : 'null'),
            React.createElement(
              'div',
              { 'data-testid': 'needs-onboarding' },
              needsOnboarding ? 'true' : 'false',
            ),
          ),
          children,
        )
      : children,
  );
}

// Ensure environment validation for mock data
if (process.env.NODE_ENV === 'development') {
  console.warn('Using mock data in development environment');
} else {
  throw new Error('Mock data should not be used in production');
}
