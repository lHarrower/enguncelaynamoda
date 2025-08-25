// Kullanıcı Tipleri - Kullanıcı profili ve kimlik doğrulama ile ilgili tipler

import { WardrobeColor } from './wardrobe';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserAppPreferences;
  profile: UserProfile;
  subscription: UserSubscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAppPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  hapticFeedback: boolean;
  autoBackup: boolean;
  aiSuggestions: boolean;
  privacyMode: boolean;
  autoSync?: boolean;
  preferredColors?: string[];
  stylePreferences?: string[];
}

export interface UserProfile {
  style: string;
  favoriteColors: WardrobeColor[];
  bodyType: string;
  lifestyle: string;
  budget: 'low' | 'medium' | 'high';
  sustainabilityGoals: string[];
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'pro';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  expiresAt: Date;
  features?: string[];
}

// Yardımcı fonksiyonlar
export const createDefaultUser = (id: string, email: string, name: string): User => {
  return {
    id,
    email,
    name,
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
      bodyType: '',
      lifestyle: 'casual',
      budget: 'medium',
      sustainabilityGoals: [],
    },
    subscription: {
      plan: 'free',
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
