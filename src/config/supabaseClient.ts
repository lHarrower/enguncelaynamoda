// This is the correct content for config/supabaseClient.ts

import 'react-native-url-polyfill/auto';

import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';

import { errorInDev, warnInDev } from '@/utils/consoleSuppress';

import { ERROR_MESSAGES } from '../constants/AppConstants';
import { secureStorage } from '../utils/secureStorage';

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
const validateEnvironmentVariables = () => {
  const missingVars: string[] = [];

  if (!supabaseUrl) {
    missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    missingVars.push('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. ${ERROR_MESSAGES.SUPABASE_MISSING}`;
    errorInDev('❌ Environment Variable Error:', errorMessage);
    throw new Error(errorMessage);
  }

  // Validate URL format
  try {
    if (supabaseUrl) {
      new URL(supabaseUrl);
    }
  } catch (error) {
    throw new Error("Invalid EXPO_PUBLIC_SUPABASE_URL format. Please ensure it's a valid URL.");
  }

  // Check for known invalid domains
  const invalidDomains = ['votekgezalqzmjtzebgi', 'example', 'localhost'];
  if (supabaseUrl && invalidDomains.some((domain) => supabaseUrl.includes(domain))) {
    throw new Error(
      'Invalid Supabase domain detected. Please update your .env file with a valid Supabase project URL.',
    );
  }

  // Basic validation for anon key format (should be a JWT-like string)
  if (supabaseAnonKey && supabaseAnonKey.length < 100) {
    warnInDev(
      "⚠️ Warning: EXPO_PUBLIC_SUPABASE_ANON_KEY seems too short. Please verify it's correct.",
    );
  }
};

// Run validation
let hasEnvError = false;
try {
  validateEnvironmentVariables();
} catch (error) {
  hasEnvError = true;
  errorInDev('Supabase configuration error:', error);
  // In development, show the error but don't crash
  if (__DEV__) {
    warnInDev('Running in development mode with invalid Supabase config');
  } else {
    throw error;
  }
}

// Create a stub Supabase-like client for development when env vars are missing
function createSupabaseStub() {
  interface QueryStub {
    select: (columns?: string) => QueryStub;
    insert: (data?: Record<string, unknown>) => QueryStub;
    upsert: (data?: Record<string, unknown>) => QueryStub;
    update: (data?: Record<string, unknown>) => QueryStub;
    delete: () => QueryStub;
    eq: (key?: string, value?: unknown) => QueryStub;
    order: (column?: string, options?: Record<string, unknown>) => QueryStub;
    limit: (count?: number) => QueryStub;
    lt: (column?: string, value?: unknown) => QueryStub;
    single: () => Promise<PostgrestSingleResponse<any>>;
    data: null;
    error: { message: string; code: string } | null;
  }

  const buildQueryStub = (): QueryStub => {
    const result: QueryStub = {
      select: (_?: string) => result,
      insert: (_?: Record<string, unknown>) => result,
      upsert: (_?: Record<string, unknown>) => result,
      update: (_?: Record<string, unknown>) => result,
      delete: () => result,
      eq: (_key?: string, _value?: unknown) => result,
      order: (_column?: string, _options?: Record<string, unknown>) => result,
      limit: (_count?: number) => result,
      lt: (_column?: string, _value?: unknown) => result,
      single: async (): Promise<PostgrestSingleResponse<any>> => ({
        data: null,
        error: { message: 'Supabase not configured', code: 'CONFIG' },
        status: 500,
        statusText: 'Internal Server Error'
      } as PostgrestSingleResponse<any>),
      data: null,
      error: { message: 'Supabase not configured', code: 'CONFIG' },
    };
    return result;
  };

  return {
    auth: {
      signInWithPassword: async () => {
        throw new Error('Supabase not configured');
      },
      signUp: async () => {
        throw new Error('Supabase not configured');
      },
      signOut: async () => {
        throw new Error('Supabase not configured');
      },
      signInWithIdToken: async () => {
        throw new Error('Supabase not configured');
      },
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (_cb?: (event: string, session: unknown) => void) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      }),
    },
    rpc: async (_fn: string, _params?: Record<string, unknown>) => ({
      data: null,
      error: { message: 'Supabase not configured', code: 'CONFIG' },
    }),
    from: (_table: string) => buildQueryStub(),
  };
}

// Create and export the Supabase client with error handling
const supabaseClient =
  !hasEnvError && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: {
            getItem: async (key: string) => {
              await secureStorage.initialize();
              return await secureStorage.getItem(key);
            },
            setItem: async (key: string, value: string) => {
              await secureStorage.initialize();
              await secureStorage.setItem(key, value);
            },
            removeItem: async (key: string) => {
              await secureStorage.initialize();
              await secureStorage.removeItem(key);
            },
          },
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : createSupabaseStub();

export const supabase = supabaseClient;

// Export the supabase client for mocking in tests
export { supabaseClient };

// Provide a default export for convenience (supports both `import supabase` and `import { supabase }` patterns)
export default supabaseClient;

// Export validated environment variables for use in other parts of the app
export const ENV = {
  SUPABASE_URL: supabaseUrl ?? '',
  SUPABASE_ANON_KEY: supabaseAnonKey ?? '',
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
} as const;
