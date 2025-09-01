/**
 * useKVKK Hook - KVKK compliance ve rıza yönetimi için React hook
 *
 * Bu hook:
 * - KVKK rızalarını yönetir
 * - Compliance durumunu kontrol eder
 * - Veri haklarını sağlar
 * - Real-time güncellemeler sunar
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { errorInDev } from '@/utils/consoleSuppress';

import {
  ConsentType,
  DataProcessingPurpose,
  KVKKConsent,
  kvkkConsentService,
  KVKKSettings,
  LegalBasis,
} from '@/services/kvkkConsentService';
import { useAuth } from './useAuth';

interface UseKVKKReturn {
  // Consent Management
  consents: KVKKConsent[];
  hasConsent: (type: ConsentType) => boolean;
  grantConsent: (
    type: ConsentType,
    purpose: DataProcessingPurpose,
    legalBasis: LegalBasis,
    validityDays?: number,
  ) => Promise<void>;
  withdrawConsent: (type: ConsentType) => Promise<void>;

  // Compliance Status
  isCompliant: boolean;
  complianceScore: number;
  missingConsents: ConsentType[];

  // Data Rights
  exportData: () => Promise<void>;
  deleteData: () => Promise<void>;

  // Settings
  settings: KVKKSettings | null;
  updateSettings: (newSettings: Partial<KVKKSettings>) => Promise<void>;

  // State
  loading: boolean;
  error: string | null;
  refreshConsents: () => Promise<void>;
}

interface KVKKComplianceCheck {
  isCompliant: boolean;
  score: number;
  missingConsents: ConsentType[];
  recommendations: string[];
}

// Gerekli rızalar ve ağırlıkları
const REQUIRED_CONSENTS: Record<ConsentType, { weight: number; required: boolean }> = {
  [ConsentType.AI_PROCESSING]: { weight: 30, required: true },
  [ConsentType.ANALYTICS]: { weight: 20, required: false },
  [ConsentType.CRASH_REPORTING]: { weight: 15, required: false },
  [ConsentType.NOTIFICATIONS]: { weight: 10, required: false },
  [ConsentType.LOCATION]: { weight: 15, required: false },
  [ConsentType.MARKETING]: { weight: 10, required: false },
  [ConsentType.PERSONALIZATION]: { weight: 15, required: false },
  [ConsentType.DATA_SHARING]: { weight: 5, required: false },
};

export const useKVKK = (): UseKVKKReturn => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<KVKKConsent[]>([]);
  const [settings, setSettings] = useState<KVKKSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rızaları yükle
  const loadConsents = useCallback(async () => {
    if (!user) {
      setConsents([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [userConsents, userSettings] = await Promise.all([
        kvkkConsentService.getConsentHistory(user.id),
        kvkkConsentService.getKVKKSettings(user.id),
      ]);

      setConsents(userConsents);
      setSettings(userSettings);
    } catch (err) {
      errorInDev('KVKK verileri yüklenirken hata:', err);
      setError('KVKK verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // İlk yükleme
  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  // Rıza kontrolü
  const hasConsent = useCallback(
    (type: ConsentType): boolean => {
      if (!user) return false;
      return kvkkConsentService.hasValidConsent(user.id, type);
    },
    [user, consents],
  );

  // Rıza verme
  const grantConsent = useCallback(
    async (
      type: ConsentType,
      purpose: DataProcessingPurpose,
      legalBasis: LegalBasis,
      validityDays: number = 365,
    ) => {
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      try {
        setError(null);
        await kvkkConsentService.grantConsent(user.id, type, purpose, legalBasis, validityDays);
        await loadConsents(); // Güncel verileri yükle
      } catch (err) {
        errorInDev('Rıza verme hatası:', err);
        setError('Rıza verilirken bir hata oluştu.');
        throw err;
      }
    },
    [user, loadConsents],
  );

  // Rıza geri çekme
  const withdrawConsent = useCallback(
    async (type: ConsentType) => {
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      try {
        setError(null);
        await kvkkConsentService.withdrawConsent(user.id, type);
        await loadConsents(); // Güncel verileri yükle
      } catch (err) {
        errorInDev('Rıza geri çekme hatası:', err);
        setError('Rıza geri çekilirken bir hata oluştu.');
        throw err;
      }
    },
    [user, loadConsents],
  );

  // Compliance durumu hesaplama
  const calculateCompliance = useCallback((): KVKKComplianceCheck => {
    if (!user) {
      return {
        isCompliant: false,
        score: 0,
        missingConsents: Object.keys(REQUIRED_CONSENTS) as ConsentType[],
        recommendations: ['Lütfen giriş yapın'],
      };
    }

    let totalScore = 0;
    let maxScore = 0;
    const missingConsents: ConsentType[] = [];
    const recommendations: string[] = [];

    for (const [consentType, config] of Object.entries(REQUIRED_CONSENTS)) {
      const type = consentType as ConsentType;
      maxScore += config.weight;

      if (hasConsent(type)) {
        totalScore += config.weight;
      } else {
        if (config.required) {
          missingConsents.push(type);
          recommendations.push(`${type} rızası gereklidir`);
        }
      }
    }

    const score = Math.round((totalScore / maxScore) * 100);
    const isCompliant = missingConsents.length === 0 && score >= 70;

    if (!isCompliant) {
      if (missingConsents.length > 0) {
        recommendations.push('Eksik zorunlu rızaları tamamlayın');
      }
      if (score < 70) {
        recommendations.push('Daha iyi deneyim için ek rızaları değerlendirin');
      }
    }

    return {
      isCompliant,
      score,
      missingConsents,
      recommendations,
    };
  }, [user, hasConsent]);

  const complianceCheck = calculateCompliance();

  // Veri dışa aktarma
  const exportData = useCallback(async () => {
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    try {
      setError(null);
      await kvkkConsentService.exportUserData(user.id);

      Alert.alert(
        'Veri Dışa Aktarma',
        'Verileriniz işleniyor. E-posta adresinize gönderilecektir.',
        [{ text: 'Tamam' }],
      );
    } catch (err) {
      errorInDev('Veri dışa aktarma hatası:', err);
      setError('Veri dışa aktarılırken bir hata oluştu.');
      throw err;
    }
  }, [user]);

  // Veri silme
  const deleteData = useCallback(async () => {
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        'Veri Silme Onayı',
        'Bu işlem geri alınamaz! Tüm verileriniz kalıcı olarak silinecektir.',
        [
          {
            text: 'İptal',
            style: 'cancel',
            onPress: () => reject(new Error('Kullanıcı iptal etti')),
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                setError(null);
                await kvkkConsentService.deleteUserData(user.id);
                resolve();
              } catch (err) {
                errorInDev('Veri silme hatası:', err);
                setError('Veri silinirken bir hata oluştu.');
                reject(err);
              }
            },
          },
        ],
      );
    });
  }, [user]);

  // Ayarları güncelleme
  const updateSettings = useCallback(
    async (newSettings: Partial<KVKKSettings>) => {
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      try {
        setError(null);
        const updatedSettings = { ...settings, ...newSettings } as KVKKSettings;
        await kvkkConsentService.updateKVKKSettings(user.id, updatedSettings);
        setSettings(updatedSettings);
      } catch (err) {
        errorInDev('KVKK ayarları güncelleme hatası:', err);
        setError('Ayarlar güncellenirken bir hata oluştu.');
        throw err;
      }
    },
    [user, settings],
  );

  // Rızaları yenileme
  const refreshConsents = useCallback(async () => {
    await loadConsents();
  }, [loadConsents]);

  return {
    // Consent Management
    consents,
    hasConsent,
    grantConsent,
    withdrawConsent,

    // Compliance Status
    isCompliant: complianceCheck.isCompliant,
    complianceScore: complianceCheck.score,
    missingConsents: complianceCheck.missingConsents,

    // Data Rights
    exportData,
    deleteData,

    // Settings
    settings,
    updateSettings,

    // State
    loading,
    error,
    refreshConsents,
  };
};

export default useKVKK;
