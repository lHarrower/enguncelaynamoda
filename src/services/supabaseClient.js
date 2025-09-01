/**
 * AYNAMODA Supabase Client Service
 * Merkezi Supabase istemci soyutlaması
 * Tüm veritabanı işlemleri bu servis üzerinden yapılır
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Supabase yapılandırması
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key ortam değişkenleri tanımlanmalıdır');
}

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Supabase Client Wrapper Class
 * Tüm veritabanı işlemleri için merkezi soyutlama
 */
class SupabaseService {
  constructor() {
    this.client = supabase;
  }

  // Auth işlemleri
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      logger.info('Kullanıcı kaydı başarılı', { userId: data.user?.id });
      return { data, error: null };
    } catch (error) {
      logger.error('Kullanıcı kaydı hatası', error);
      return { data: null, error };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      logger.info('Kullanıcı girişi başarılı', { userId: data.user?.id });
      return { data, error: null };
    } catch (error) {
      logger.error('Kullanıcı girişi hatası', error);
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      logger.info('Kullanıcı çıkışı başarılı');
      return { error: null };
    } catch (error) {
      logger.error('Kullanıcı çıkışı hatası', error);
      return { error };
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email);
      if (error) throw error;
      logger.info('Şifre sıfırlama e-postası gönderildi', { email });
      return { error: null };
    } catch (error) {
      logger.error('Şifre sıfırlama hatası', error);
      return { error };
    }
  }

  getCurrentUser() {
    return this.client.auth.getUser();
  }

  getCurrentSession() {
    return this.client.auth.getSession();
  }

  onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange(callback);
  }

  // Veritabanı işlemleri
  async select(table, options = {}) {
    try {
      let query = this.client.from(table).select(options.select || '*');
      
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.range) {
        query = query.range(options.range.from, options.range.to);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error(`${table} tablosundan veri çekme hatası`, error);
      return { data: null, error };
    }
  }

  async insert(table, data) {
    try {
      const { data: result, error } = await this.client
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      logger.info(`${table} tablosuna veri eklendi`, { count: result?.length });
      return { data: result, error: null };
    } catch (error) {
      logger.error(`${table} tablosuna veri ekleme hatası`, error);
      return { data: null, error };
    }
  }

  async update(table, data, conditions) {
    try {
      let query = this.client.from(table).update(data);
      
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      logger.info(`${table} tablosunda veri güncellendi`, { count: result?.length });
      return { data: result, error: null };
    } catch (error) {
      logger.error(`${table} tablosunda veri güncelleme hatası`, error);
      return { data: null, error };
    }
  }

  async delete(table, conditions) {
    try {
      let query = this.client.from(table).delete();
      
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { error } = await query;
      
      if (error) throw error;
      logger.info(`${table} tablosundan veri silindi`);
      return { error: null };
    } catch (error) {
      logger.error(`${table} tablosundan veri silme hatası`, error);
      return { error };
    }
  }

  // Dosya yükleme işlemleri
  async uploadFile(bucket, path, file, options = {}) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file, options);
      
      if (error) throw error;
      logger.info('Dosya yüklendi', { bucket, path });
      return { data, error: null };
    } catch (error) {
      logger.error('Dosya yükleme hatası', error);
      return { data: null, error };
    }
  }

  async downloadFile(bucket, path) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error('Dosya indirme hatası', error);
      return { data: null, error };
    }
  }

  getPublicUrl(bucket, path) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Realtime işlemleri
  subscribeToTable(table, callback, filter = '*') {
    return this.client
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { event: filter, schema: 'public', table }, 
        callback
      )
      .subscribe();
  }

  unsubscribe(subscription) {
    return this.client.removeChannel(subscription);
  }

  // RPC (Remote Procedure Call) işlemleri
  async callFunction(functionName, params = {}) {
    try {
      const { data, error } = await this.client.rpc(functionName, params);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error(`RPC fonksiyon çağrısı hatası: ${functionName}`, error);
      return { data: null, error };
    }
  }
}

// Singleton instance
const supabaseService = new SupabaseService();

export default supabaseService;
export { SupabaseService };