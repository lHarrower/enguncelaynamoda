import { StyleDNAProfile } from '@/hooks/useStyleDNA';

export interface OutfitItem {
  id: string;
  name: string;
  image: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessory' | 'outerwear';
  color: string;
  brand?: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  occasion: 'casual' | 'business' | 'formal' | 'sport' | 'party' | 'all';
  style: string[];
  userId: string;
  createdAt: string;
  lastWorn?: string;
  wornCount: number;
  isFavorite: boolean;
}

export interface OutfitRecommendation {
  id: string;
  items: OutfitItem[];
  occasion: string;
  weather: {
    temperature: number;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
    description: string;
  };
  styleMatch: number;
  confidence: number;
  reasoning: string;
  alternatives: OutfitItem[][];
  createdAt: string;
}

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  description: string;
  humidity: number;
  windSpeed: number;
}

class OutfitService {
  private baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  // Get today's outfit recommendation
  async getTodayOutfit(userId: string, styleDNA?: StyleDNAProfile): Promise<OutfitRecommendation> {
    try {
      // In production, this would be an API call
      // const response = await fetch(`${this.baseUrl}/api/outfits/today/${userId}`);
      // return await response.json();

      // Mock implementation for development
      return this.generateMockOutfit(userId, styleDNA);
    } catch (error) {
      console.error('Error getting today outfit:', error);
      throw new Error('Bugünün kombini alınamadı');
    }
  }

  // Generate outfit recommendation based on criteria
  async generateOutfit(
    userId: string,
    criteria: {
      occasion?: string;
      weather?: WeatherData;
      styleDNA?: StyleDNAProfile;
      excludeItems?: string[];
    }
  ): Promise<OutfitRecommendation> {
    try {
      // In production, this would be an API call
      // const response = await fetch(`${this.baseUrl}/api/outfits/generate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, ...criteria })
      // });
      // return await response.json();

      // Mock implementation
      return this.generateMockOutfit(userId, criteria.styleDNA, criteria);
    } catch (error) {
      console.error('Error generating outfit:', error);
      throw new Error('Kombin oluşturulamadı');
    }
  }

  // Save outfit as favorite
  async saveOutfit(outfitId: string, userId: string): Promise<void> {
    try {
      // In production, this would be an API call
      // await fetch(`${this.baseUrl}/api/outfits/${outfitId}/save`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // });

      console.log(`Outfit ${outfitId} saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving outfit:', error);
      throw new Error('Kombin kaydedilemedi');
    }
  }

  // Mark outfit as worn
  async markAsWorn(outfitId: string, userId: string): Promise<void> {
    try {
      // In production, this would be an API call
      // await fetch(`${this.baseUrl}/api/outfits/${outfitId}/worn`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, wornAt: new Date().toISOString() })
      // });

      console.log(`Outfit ${outfitId} marked as worn for user ${userId}`);
    } catch (error) {
      console.error('Error marking outfit as worn:', error);
      throw new Error('Kombin giyildi olarak işaretlenemedi');
    }
  }

  // Get user's wardrobe items
  async getWardrobeItems(userId: string): Promise<OutfitItem[]> {
    try {
      // In production, this would be an API call
      // const response = await fetch(`${this.baseUrl}/api/wardrobe/${userId}`);
      // return await response.json();

      // Mock implementation
      return this.getMockWardrobeItems(userId);
    } catch (error) {
      console.error('Error getting wardrobe items:', error);
      throw new Error('Gardırop öğeleri alınamadı');
    }
  }

  // Get weather data
  async getWeatherData(location?: string): Promise<WeatherData> {
    try {
      // In production, this would use a weather API
      // const response = await fetch(`${this.baseUrl}/api/weather?location=${location}`);
      // return await response.json();

      // Mock implementation
      return {
        temperature: 22,
        condition: 'sunny',
        description: '22°C, Güneşli',
        humidity: 65,
        windSpeed: 10
      };
    } catch (error) {
      console.error('Error getting weather data:', error);
      throw new Error('Hava durumu bilgisi alınamadı');
    }
  }

  // Private helper methods for mock data
  private generateMockOutfit(
    userId: string,
    styleDNA?: StyleDNAProfile,
    criteria?: any
  ): OutfitRecommendation {
    const mockItems = this.getMockWardrobeItems(userId);
    
    // Simple outfit generation logic
    const top = mockItems.find(item => item.category === 'top');
    const bottom = mockItems.find(item => item.category === 'bottom');
    const shoes = mockItems.find(item => item.category === 'shoes');
    
    const selectedItems = [top, bottom, shoes].filter(Boolean) as OutfitItem[];
    
    return {
      id: `outfit-${Date.now()}`,
      items: selectedItems,
      occasion: criteria?.occasion || 'İş',
      weather: {
        temperature: 22,
        condition: 'sunny',
        description: '22°C, Güneşli'
      },
      styleMatch: styleDNA ? this.calculateStyleMatch(selectedItems, styleDNA) : 85,
      confidence: 92,
      reasoning: styleDNA 
        ? `Bu kombin ${styleDNA.personality} tarzınıza uygun renk paleti ve kesimler içeriyor.`
        : 'Bu kombin günün hava durumu ve etkinliğiniz için ideal.',
      alternatives: [],
      createdAt: new Date().toISOString()
    };
  }

  private getMockWardrobeItems(userId: string): OutfitItem[] {
    return [
      {
        id: 'top-001',
        name: 'Beyaz Gömlek',
        image: 'https://via.placeholder.com/150x200/FFFFFF/000000?text=Gömlek',
        category: 'top',
        color: 'Beyaz',
        brand: 'Zara',
        season: 'all',
        occasion: 'business',
        style: ['classic', 'minimal'],
        userId,
        createdAt: new Date().toISOString(),
        wornCount: 5,
        isFavorite: true
      },
      {
        id: 'bottom-001',
        name: 'Lacivert Pantolon',
        image: 'https://via.placeholder.com/150x200/000080/FFFFFF?text=Pantolon',
        category: 'bottom',
        color: 'Lacivert',
        brand: 'Mango',
        season: 'all',
        occasion: 'business',
        style: ['classic', 'professional'],
        userId,
        createdAt: new Date().toISOString(),
        wornCount: 8,
        isFavorite: false
      },
      {
        id: 'shoes-001',
        name: 'Kahverengi Ayakkabı',
        image: 'https://via.placeholder.com/150x150/8B4513/FFFFFF?text=Ayakkabı',
        category: 'shoes',
        color: 'Kahverengi',
        brand: 'Aldo',
        season: 'all',
        occasion: 'business',
        style: ['classic', 'leather'],
        userId,
        createdAt: new Date().toISOString(),
        wornCount: 12,
        isFavorite: true
      },
      {
        id: 'top-002',
        name: 'Siyah Bluz',
        image: 'https://via.placeholder.com/150x200/000000/FFFFFF?text=Bluz',
        category: 'top',
        color: 'Siyah',
        brand: 'H&M',
        season: 'all',
        occasion: 'casual',
        style: ['modern', 'chic'],
        userId,
        createdAt: new Date().toISOString(),
        wornCount: 3,
        isFavorite: false
      },
      {
        id: 'bottom-002',
        name: 'Kot Pantolon',
        image: 'https://via.placeholder.com/150x200/4169E1/FFFFFF?text=Kot',
        category: 'bottom',
        color: 'Mavi',
        brand: 'Levi\'s',
        season: 'all',
        occasion: 'casual',
        style: ['casual', 'denim'],
        userId,
        createdAt: new Date().toISOString(),
        wornCount: 15,
        isFavorite: true
      }
    ];
  }

  private calculateStyleMatch(items: OutfitItem[], styleDNA: StyleDNAProfile): number {
    // Simple style matching algorithm
    const styleKeywords = styleDNA.traits.join(' ').toLowerCase();
    let matchScore = 0;
    let totalItems = items.length;

    items.forEach(item => {
      const itemStyles = item.style.join(' ').toLowerCase();
      
      // Check if item styles match Style DNA traits
      if (styleKeywords.includes('classic') && itemStyles.includes('classic')) {
        matchScore += 25;
      }
      if (styleKeywords.includes('modern') && itemStyles.includes('modern')) {
        matchScore += 25;
      }
      if (styleKeywords.includes('minimal') && itemStyles.includes('minimal')) {
        matchScore += 20;
      }
      if (styleKeywords.includes('elegant') && itemStyles.includes('chic')) {
        matchScore += 20;
      }
    });

    // Ensure score is between 70-100 for realistic results
    const finalScore = Math.min(100, Math.max(70, matchScore / totalItems));
    return Math.round(finalScore);
  }
}

export const outfitService = new OutfitService();
export default outfitService;