/**
 * AYNAMODA Services Index
 * Tüm servis modüllerinin merkezi export dosyası
 */

// Ana Supabase client
export { default as supabaseService, SupabaseService } from './supabaseClient';

// Kimlik doğrulama servisi
export { default as authService, AuthService } from './authService';

// Gardırop servisi
export { default as wardrobeService, WardrobeService } from './wardrobeService';

// Mevcut servisler (varsa)
export * from './AIService';
export * from './ErrorReporting';
export * from './HapticService';
export * from './analyticsService';

// Tip tanımları
export type {
  // Auth types
  User,
  Session,
  AuthError,
} from '@supabase/supabase-js';

// Servis yapılandırması
export const serviceConfig = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  features: {
    realtime: true,
    auth: true,
    storage: true,
  },
};

// Servis durumu kontrol fonksiyonu
export const checkServiceHealth = async () => {
  try {
    const { data, error } = await supabaseService.getCurrentSession();
    return {
      supabase: !error,
      auth: !!data.session,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      supabase: false,
      auth: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};