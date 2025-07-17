// This is the correct content for config/supabaseClient.ts

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERROR_MESSAGES } from '../constants/AppConstants';

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
  
  // Check for other required environment variables
  if (!process.env.EXPO_PUBLIC_HUGGINGFACE_TOKEN) {
    missingVars.push('EXPO_PUBLIC_HUGGINGFACE_TOKEN');
  }
  
  if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    missingVars.push('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  }
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. ${ERROR_MESSAGES.SUPABASE_MISSING}`;
    console.error('❌ Environment Variable Error:', errorMessage);
    throw new Error(errorMessage);
  }
  
  // Validate URL format
  try {
    new URL(supabaseUrl!);
  } catch (error) {
    throw new Error(`Invalid EXPO_PUBLIC_SUPABASE_URL format. Please ensure it's a valid URL.`);
  }
  
  // Basic validation for anon key format (should be a JWT-like string)
  if (supabaseAnonKey!.length < 100) {
    console.warn('⚠️ Warning: EXPO_PUBLIC_SUPABASE_ANON_KEY seems too short. Please verify it\'s correct.');
  }
};

// Run validation
validateEnvironmentVariables();

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Changed from false to true
  },
});

// Provide a default export for convenience (supports both `import supabase` and `import { supabase }` patterns)
export default supabase;

// Export validated environment variables for use in other parts of the app
export const ENV = {
  SUPABASE_URL: supabaseUrl!,
  SUPABASE_ANON_KEY: supabaseAnonKey!,
  HUGGINGFACE_TOKEN: process.env.EXPO_PUBLIC_HUGGINGFACE_TOKEN!,
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
} as const;