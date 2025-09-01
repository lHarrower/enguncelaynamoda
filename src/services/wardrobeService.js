/**
 * AYNAMODA Wardrobe Service
 * Gardırop yönetimi için özel servis
 */

import supabaseService from './supabaseClient';
import { logger } from '@/lib/logger';

class WardrobeService {
  constructor() {
    this.supabase = supabaseService;
  }

  // Gardırop öğesi ekleme
  async addWardrobeItem(userId, itemData) {
    try {
      const { data, error } = await this.supabase.insert('wardrobe_items', {
        user_id: userId,
        name: itemData.name,
        category: itemData.category,
        subcategory: itemData.subcategory,
        brand: itemData.brand,
        color: itemData.color,
        size: itemData.size,
        price: itemData.price,
        purchase_date: itemData.purchaseDate,
        image_url: itemData.imageUrl,
        tags: itemData.tags || [],
        notes: itemData.notes,
        ai_generated_name: itemData.aiGeneratedName,
        style_dna: itemData.styleDna || {},
        sustainability_score: itemData.sustainabilityScore,
        wear_count: 0,
        last_worn: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      return { data: data[0], error: null };
    } catch (error) {
      logger.error('Gardırop öğesi ekleme hatası', error);
      return { data: null, error };
    }
  }

  // Kullanıcının gardırop öğelerini getir
  async getUserWardrobeItems(userId, filters = {}) {
    try {
      let options = {
        eq: { user_id: userId },
        order: { column: 'created_at', ascending: false },
      };
      
      // Kategori filtresi
      if (filters.category && filters.category !== 'all') {
        options.eq.category = filters.category;
      }
      
      // Renk filtresi
      if (filters.colors && filters.colors.length > 0) {
        // Supabase'de array içinde arama için özel sorgu gerekebilir
      }
      
      // Marka filtresi
      if (filters.brands && filters.brands.length > 0) {
        // Supabase'de array içinde arama için özel sorgu gerekebilir
      }
      
      const { data, error } = await this.supabase.select('wardrobe_items', options);
      
      if (error) throw error;
      
      // Client-side filtreleme (gerekirse)
      let filteredData = data;
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredData = data.filter(item => 
          item.name?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      if (filters.hasAIName !== null) {
        filteredData = filteredData.filter(item => 
          filters.hasAIName ? !!item.ai_generated_name : !item.ai_generated_name
        );
      }
      
      return { data: filteredData, error: null };
    } catch (error) {
      logger.error('Gardırop öğeleri getirme hatası', error);
      return { data: null, error };
    }
  }

  // Gardırop öğesini güncelle
  async updateWardrobeItem(itemId, updates) {
    try {
      const { data, error } = await this.supabase.update(
        'wardrobe_items',
        {
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { id: itemId }
      );
      
      if (error) throw error;
      
      return { data: data[0], error: null };
    } catch (error) {
      logger.error('Gardırop öğesi güncelleme hatası', error);
      return { data: null, error };
    }
  }

  // Gardırop öğesini sil
  async deleteWardrobeItem(itemId) {
    try {
      const { error } = await this.supabase.delete('wardrobe_items', { id: itemId });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      logger.error('Gardırop öğesi silme hatası', error);
      return { error };
    }
  }

  // Öğe giyildi olarak işaretle
  async markItemAsWorn(itemId) {
    try {
      // Önce mevcut wear_count'u getir
      const { data: currentItem, error: fetchError } = await this.supabase.select(
        'wardrobe_items',
        {
          eq: { id: itemId },
          select: 'wear_count',
          limit: 1,
        }
      );
      
      if (fetchError) throw fetchError;
      
      const currentWearCount = currentItem[0]?.wear_count || 0;
      
      const { data, error } = await this.supabase.update(
        'wardrobe_items',
        {
          wear_count: currentWearCount + 1,
          last_worn: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { id: itemId }
      );
      
      if (error) throw error;
      
      return { data: data[0], error: null };
    } catch (error) {
      logger.error('Öğe giyildi işaretleme hatası', error);
      return { data: null, error };
    }
  }

  // Gardırop istatistikleri
  async getWardrobeStats(userId) {
    try {
      const { data, error } = await this.supabase.select('wardrobe_items', {
        eq: { user_id: userId },
      });
      
      if (error) throw error;
      
      const stats = {
        totalItems: data.length,
        categories: {},
        brands: {},
        colors: {},
        totalWears: 0,
        averageWears: 0,
        mostWornItem: null,
        leastWornItems: [],
        recentlyAdded: [],
        sustainabilityScore: 0,
      };
      
      data.forEach(item => {
        // Kategori istatistikleri
        stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
        
        // Marka istatistikleri
        if (item.brand) {
          stats.brands[item.brand] = (stats.brands[item.brand] || 0) + 1;
        }
        
        // Renk istatistikleri
        if (item.color) {
          stats.colors[item.color] = (stats.colors[item.color] || 0) + 1;
        }
        
        // Giyim istatistikleri
        stats.totalWears += item.wear_count || 0;
        
        // En çok giyilen öğe
        if (!stats.mostWornItem || (item.wear_count || 0) > (stats.mostWornItem.wear_count || 0)) {
          stats.mostWornItem = item;
        }
        
        // Az giyilen öğeler (0-2 kez giyilen)
        if ((item.wear_count || 0) <= 2) {
          stats.leastWornItems.push(item);
        }
        
        // Sürdürülebilirlik skoru
        if (item.sustainability_score) {
          stats.sustainabilityScore += item.sustainability_score;
        }
      });
      
      // Ortalama giyim sayısı
      stats.averageWears = data.length > 0 ? stats.totalWears / data.length : 0;
      
      // Ortalama sürdürülebilirlik skoru
      stats.sustainabilityScore = data.length > 0 ? stats.sustainabilityScore / data.length : 0;
      
      // Son eklenen öğeler (son 7 gün)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      stats.recentlyAdded = data.filter(item => 
        new Date(item.created_at) > sevenDaysAgo
      );
      
      return { data: stats, error: null };
    } catch (error) {
      logger.error('Gardırop istatistikleri getirme hatası', error);
      return { data: null, error };
    }
  }

  // Öğe resmi yükleme
  async uploadItemImage(itemId, file) {
    try {
      const fileExt = file.name?.split('.').pop();
      const fileName = `${itemId}-${Date.now()}.${fileExt}`;
      const filePath = `wardrobe/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await this.supabase.uploadFile(
        'wardrobe-images',
        filePath,
        file
      );
      
      if (uploadError) throw uploadError;
      
      const imageUrl = this.supabase.getPublicUrl('wardrobe-images', filePath);
      
      // Öğeyi resim URL ile güncelle
      const { data: itemData, error: itemError } = await this.updateWardrobeItem(
        itemId,
        { image_url: imageUrl }
      );
      
      if (itemError) throw itemError;
      
      return { imageUrl, error: null };
    } catch (error) {
      logger.error('Öğe resmi yükleme hatası', error);
      return { imageUrl: null, error };
    }
  }

  // AI isim önerisi kaydetme
  async saveAIGeneratedName(itemId, aiName) {
    try {
      const { data, error } = await this.updateWardrobeItem(itemId, {
        ai_generated_name: aiName,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      logger.error('AI isim kaydetme hatası', error);
      return { data: null, error };
    }
  }

  // Stil DNA güncelleme
  async updateStyleDNA(itemId, styleDna) {
    try {
      const { data, error } = await this.updateWardrobeItem(itemId, {
        style_dna: styleDna,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      logger.error('Stil DNA güncelleme hatası', error);
      return { data: null, error };
    }
  }
}

// Singleton instance
const wardrobeService = new WardrobeService();

export default wardrobeService;
export { WardrobeService };