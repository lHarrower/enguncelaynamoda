/**
 * AYNAMODA Authentication Service
 * Kimlik doğrulama işlemleri için özel servis
 */

import supabaseService from './supabaseClient';
import { logger } from '../lib/logger';

class AuthService {
  constructor() {
    this.supabase = supabaseService;
  }

  // Kullanıcı kaydı
  async register(email, password, userData = {}) {
    try {
      const { data, error } = await this.supabase.signUp(email, password, {
        full_name: userData.fullName,
        avatar_url: userData.avatarUrl,
        preferences: userData.preferences || {},
      });

      if (error) throw error;

      // Kullanıcı profili oluştur
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: data.user.email,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          preferences: userData.preferences || {},
        });
      }

      return { user: data.user, error: null };
    } catch (error) {
      logger.error('Kullanıcı kaydı hatası', error);
      return { user: null, error };
    }
  }

  // Kullanıcı girişi
  async login(email, password) {
    try {
      const { data, error } = await this.supabase.signIn(email, password);
      
      if (error) throw error;
      
      // Kullanıcı profilini getir
      const profile = await this.getUserProfile(data.user.id);
      
      return { 
        user: data.user, 
        session: data.session,
        profile: profile.data,
        error: null 
      };
    } catch (error) {
      logger.error('Kullanıcı girişi hatası', error);
      return { user: null, session: null, profile: null, error };
    }
  }

  // Kullanıcı çıkışı
  async logout() {
    try {
      const { error } = await this.supabase.signOut();
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      logger.error('Kullanıcı çıkışı hatası', error);
      return { error };
    }
  }

  // Şifre sıfırlama
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.resetPassword(email);
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      logger.error('Şifre sıfırlama hatası', error);
      return { error };
    }
  }

  // Mevcut kullanıcıyı getir
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.getCurrentUser();
      
      if (error) throw error;
      
      if (data.user) {
        const profile = await this.getUserProfile(data.user.id);
        return { 
          user: data.user, 
          profile: profile.data,
          error: null 
        };
      }
      
      return { user: null, profile: null, error: null };
    } catch (error) {
      logger.error('Mevcut kullanıcı getirme hatası', error);
      return { user: null, profile: null, error };
    }
  }

  // Mevcut oturumu getir
  async getCurrentSession() {
    try {
      const { data, error } = await this.supabase.getCurrentSession();
      
      if (error) throw error;
      
      return { session: data.session, error: null };
    } catch (error) {
      logger.error('Mevcut oturum getirme hatası', error);
      return { session: null, error };
    }
  }

  // Auth durumu değişikliklerini dinle
  onAuthStateChange(callback) {
    return this.supabase.onAuthStateChange((event, session) => {
      logger.info('Auth durumu değişti', { event, userId: session?.user?.id });
      callback(event, session);
    });
  }

  // Kullanıcı profili oluştur
  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await this.supabase.insert('profiles', {
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      logger.error('Kullanıcı profili oluşturma hatası', error);
      return { data: null, error };
    }
  }

  // Kullanıcı profilini getir
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase.select('profiles', {
        eq: { id: userId },
        limit: 1,
      });
      
      if (error) throw error;
      
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      logger.error('Kullanıcı profili getirme hatası', error);
      return { data: null, error };
    }
  }

  // Kullanıcı profilini güncelle
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase.update(
        'profiles',
        {
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { id: userId }
      );
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      logger.error('Kullanıcı profili güncelleme hatası', error);
      return { data: null, error };
    }
  }

  // Kullanıcı tercihlerini güncelle
  async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await this.supabase.update(
        'profiles',
        {
          preferences,
          updated_at: new Date().toISOString(),
        },
        { id: userId }
      );
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      logger.error('Kullanıcı tercihleri güncelleme hatası', error);
      return { data: null, error };
    }
  }

  // Avatar yükleme
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name?.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await this.supabase.uploadFile(
        'avatars',
        filePath,
        file
      );
      
      if (uploadError) throw uploadError;
      
      const avatarUrl = this.supabase.getPublicUrl('avatars', filePath);
      
      // Profili avatar URL ile güncelle
      const { data: profileData, error: profileError } = await this.updateUserProfile(
        userId,
        { avatar_url: avatarUrl }
      );
      
      if (profileError) throw profileError;
      
      return { avatarUrl, error: null };
    } catch (error) {
      logger.error('Avatar yükleme hatası', error);
      return { avatarUrl: null, error };
    }
  }
}

// Singleton instance
const authService = new AuthService();

export default authService;
export { AuthService };