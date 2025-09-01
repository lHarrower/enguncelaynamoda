import { apiClient } from '@/services/apiClient';
import { StyleDNAProfile, StyleDNAData } from '@/hooks/useStyleDNA';

class StyleDNAService {
  private baseUrl = '/style-dna';

  async saveStyleDNA(data: StyleDNAData): Promise<StyleDNAProfile> {
    try {
      const response = await apiClient.post(`${this.baseUrl}`, data);
      return response.data;
    } catch (error) {
      console.error('Error saving Style DNA:', error);
      throw new Error('Stil DNA kaydedilemedi');
    }
  }

  async getStyleDNA(userId: string): Promise<StyleDNAProfile | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No Style DNA found for user
      }
      console.error('Error getting Style DNA:', error);
      throw new Error('Stil DNA alınamadı');
    }
  }

  async updateStyleDNA(id: string, updates: Partial<StyleDNAProfile>): Promise<StyleDNAProfile> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating Style DNA:', error);
      throw new Error('Stil DNA güncellenemedi');
    }
  }

  async deleteStyleDNA(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting Style DNA:', error);
      throw new Error('Stil DNA silinemedi');
    }
  }

  async getStyleRecommendations(personality: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/recommendations/${personality}`);
      return response.data;
    } catch (error) {
      console.error('Error getting style recommendations:', error);
      throw new Error('Stil önerileri alınamadı');
    }
  }

  async getOutfitSuggestions(userId: string, occasion?: string): Promise<any[]> {
    try {
      const params = occasion ? { occasion } : {};
      const response = await apiClient.get(`${this.baseUrl}/${userId}/outfits`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting outfit suggestions:', error);
      throw new Error('Kombin önerileri alınamadı');
    }
  }

  // Mock data for development - remove when backend is ready
  async getMockStyleDNA(personality: string): Promise<StyleDNAProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockData: StyleDNAProfile = {
      id: `mock_${Date.now()}`,
      userId: 'mock_user',
      personality,
      answers: [],
      completedAt: new Date().toISOString(),
      traits: this.getMockTraits(personality),
      colors: this.getMockColors(personality),
      styleKeywords: this.getMockStyleKeywords(personality),
    };

    return mockData;
  }

  private getMockTraits(personality: string): string[] {
    const traits: Record<string, string[]> = {
      calm_strength: [
        'Zamansız zarafet',
        'Güvenilir karizma',
        'Minimalist sofistikasyon',
        'Doğal otoriteye sahip'
      ],
      creative_spark: [
        'Artistik vizyon',
        'Cesur kombinasyonlar',
        'Özgün perspektif',
        'Yaratıcı problem çözme'
      ],
      warm_approachable: [
        'Doğal çekicilik',
        'Samimi enerji',
        'Uyumlu kombinasyonlar',
        'Rahat sofistikasyon'
      ],
      bold_magnetic: [
        'Güçlü karizma',
        'Cesur seçimler',
        'Trend belirleyici',
        'Manyetik çekicilik'
      ]
    };
    return traits[personality] || [];
  }

  private getMockColors(personality: string): string[] {
    const colors: Record<string, string[]> = {
      calm_strength: ['Nötr tonlar', 'Toprak renkleri', 'Derin maviler', 'Klasik beyaz'],
      creative_spark: ['Canlı renkler', 'Sanatsal desenler', 'Beklenmedik kombinasyonlar', 'Vintage tonları'],
      warm_approachable: ['Sıcak tonlar', 'Pastel renkler', 'Doğal nüanslar', 'Yumuşak kontrastlar'],
      bold_magnetic: ['Güçlü kontrastlar', 'Canlı renkler', 'Metalik detaylar', 'Dramatik tonlar']
    };
    return colors[personality] || [];
  }

  private getMockStyleKeywords(personality: string): string[] {
    const keywords: Record<string, string[]> = {
      calm_strength: ['Minimalist', 'Klasik', 'Sofistike', 'Zamansız'],
      creative_spark: ['Artistik', 'Özgün', 'Cesur', 'Yaratıcı'],
      warm_approachable: ['Sıcak', 'Rahat', 'Doğal', 'Uyumlu'],
      bold_magnetic: ['Cesur', 'Güçlü', 'Dramatik', 'Etkileyici']
    };
    return keywords[personality] || [];
  }
}

export const styleDNAService = new StyleDNAService();