import { useCallback } from 'react';
import { useGlobalStore, useGlobalActions } from '@/store/globalStore';
import { styleDNAService } from '@/services/styleDNAService';

export interface StyleDNAProfile {
  id?: string;
  userId?: string;
  personality: string;
  answers: any[];
  completedAt: string;
  traits?: string[];
  colors?: string[];
  styleKeywords?: string[];
}

export interface StyleDNAData {
  userId?: string;
  personality: string;
  answers: any[];
  completedAt: string;
}

export function useStyleDNA() {
  const styleDNA = useGlobalStore(state => state.styleDNA);
  const { setStyleDNA, setStyleDNAComplete } = useGlobalActions();

  const saveStyleDNA = useCallback(async (data: StyleDNAData): Promise<StyleDNAProfile | null> => {
    try {
      // Save to backend
      const savedProfile = await styleDNAService.saveStyleDNA(data);
      
      // Update global state
      setStyleDNA(savedProfile);
      setStyleDNAComplete(true);
      
      return savedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stil DNA kaydedilemedi';
      console.error('Error saving Style DNA:', err);
      
      // Even if backend fails, save to local state
      const localProfile: StyleDNAProfile = {
        id: `local_${Date.now()}`,
        ...data,
      };
      setStyleDNA(localProfile);
      
      return localProfile;
    }
  }, [setStyleDNA, setStyleDNAComplete]);

  const getStyleDNA = useCallback(async (userId: string): Promise<StyleDNAProfile | null> => {
    try {
      const profile = await styleDNAService.getStyleDNA(userId);
      if (profile) {
        setStyleDNA(profile);
      }
      return profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stil DNA alınamadı';
      console.error('Error getting Style DNA:', err);
      return null;
    }
  }, [setStyleDNA]);

  const updateStyleDNA = useCallback(async (updates: Partial<StyleDNAProfile>): Promise<StyleDNAProfile | null> => {
    if (!styleDNA?.id) {
      throw new Error('Güncellenecek Stil DNA profili bulunamadı');
    }

    try {
      const updatedProfile = await styleDNAService.updateStyleDNA(styleDNA.id, updates);
      setStyleDNA(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stil DNA güncellenemedi';
      console.error('Error updating Style DNA:', err);
      return null;
    }
  }, [styleDNA, setStyleDNA]);

  const clearStyleDNA = useCallback(() => {
    setStyleDNA(null);
    setStyleDNAComplete(false);
  }, [setStyleDNA, setStyleDNAComplete]);

  const hasStyleDNA = (): boolean => {
    return styleDNA !== null && styleDNA !== undefined;
  };

  const getPersonalityName = (personality: string): string => {
    const personalityNames: Record<string, string> = {
      calm_strength: 'Sakin Güç',
      creative_spark: 'Yaratıcı Kıvılcım',
      warm_approachable: 'Sıcak Yaklaşım',
      bold_magnetic: 'Cesur Manyetizma',
    };
    return personalityNames[personality] || personality;
  };

  const getPersonalityTraits = (personality: string): string[] => {
    const personalityTraits: Record<string, string[]> = {
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
    return personalityTraits[personality] || [];
  };

  const getPersonalityColors = (personality: string): string[] => {
    const personalityColors: Record<string, string[]> = {
      calm_strength: ['Nötr tonlar', 'Toprak renkleri', 'Derin maviler', 'Klasik beyaz'],
      creative_spark: ['Canlı renkler', 'Sanatsal desenler', 'Beklenmedik kombinasyonlar', 'Vintage tonları'],
      warm_approachable: ['Sıcak tonlar', 'Pastel renkler', 'Doğal nüanslar', 'Yumuşak kontrastlar'],
      bold_magnetic: ['Güçlü kontrastlar', 'Canlı renkler', 'Metalik detaylar', 'Dramatik tonlar']
    };
    return personalityColors[personality] || [];
  };

  const getStyleKeywords = (personality: string): string[] => {
    const styleKeywords: Record<string, string[]> = {
      calm_strength: ['Minimalist', 'Klasik', 'Sofistike', 'Zamansız'],
      creative_spark: ['Artistik', 'Özgün', 'Cesur', 'Yaratıcı'],
      warm_approachable: ['Sıcak', 'Rahat', 'Doğal', 'Uyumlu'],
      bold_magnetic: ['Cesur', 'Güçlü', 'Dramatik', 'Etkileyici']
    };
    return styleKeywords[personality] || [];
  };

  return {
    styleDNA,
    saveStyleDNA,
    getStyleDNA,
    updateStyleDNA,
    clearStyleDNA,
    hasStyleDNA,
    getPersonalityName,
    getPersonalityTraits,
    getPersonalityColors,
    getStyleKeywords,
  };
}