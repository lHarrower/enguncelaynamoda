/**
 * KVKK Consent Service - Türkiye Kişisel Verilerin Korunması Kanunu uyumluluğu
 *
 * Bu servis KVKK kapsamında:
 * - Kullanıcı rızalarının yönetimi
 * - Veri işleme amaçlarının takibi
 * - Rıza geçmişinin kayıt altında tutulması
 * - Kullanıcı haklarının uygulanması
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supa';
import { errorInDev } from '@/utils/consoleSuppress';
('../config/supabaseClient');

export interface KVKKConsent {
  id: string;
  userId: string;
  consentType: ConsentType;
  purpose: DataProcessingPurpose;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string; // KVKK politika versiyonu
  expiryDate?: Date;
  withdrawnAt?: Date;
  legalBasis: LegalBasis;
}

export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  PERSONALIZATION = 'personalization',
  LOCATION = 'location',
  NOTIFICATIONS = 'notifications',
  AI_PROCESSING = 'ai_processing',
  DATA_SHARING = 'data_sharing',
  CRASH_REPORTING = 'crash_reporting',
}

export enum DataProcessingPurpose {
  SERVICE_PROVISION = 'service_provision',
  PERSONALIZED_RECOMMENDATIONS = 'personalized_recommendations',
  MARKETING_COMMUNICATION = 'marketing_communication',
  ANALYTICS_IMPROVEMENT = 'analytics_improvement',
  SECURITY_FRAUD_PREVENTION = 'security_fraud_prevention',
  CUSTOMER_SUPPORT = 'customer_support',
  LEGAL_COMPLIANCE = 'legal_compliance',
  AI_PROCESSING = 'ai_processing',
  ACCOUNT_MANAGEMENT = 'account_management',
}

export enum LegalBasis {
  CONSENT = 'consent', // Açık rıza
  CONTRACT = 'contract', // Sözleşmenin ifası
  LEGITIMATE_INTEREST = 'legitimate_interest', // Meşru menfaat
  LEGAL_OBLIGATION = 'legal_obligation', // Hukuki yükümlülük
  VITAL_INTERESTS = 'vital_interests', // Yaşamsal çıkarlar
  PUBLIC_TASK = 'public_task', // Kamu görevi
}

export interface UserDataRights {
  accessRequested: boolean;
  rectificationRequested: boolean;
  erasureRequested: boolean;
  restrictionRequested: boolean;
  portabilityRequested: boolean;
  objectionRequested: boolean;
  lastRequestDate?: Date;
  requestStatus: 'pending' | 'processing' | 'completed' | 'rejected';
}

export interface KVKKSettings {
  consentVersion: string;
  lastConsentUpdate: Date;
  dataRetentionPeriod: number; // gün cinsinden
  automaticDeletion: boolean;
  consentReminders: boolean;
  dataProcessingLog: boolean;
}

class KVKKConsentService {
  private static instance: KVKKConsentService;
  private readonly STORAGE_KEY = 'kvkk_consent_data';
  private readonly CURRENT_VERSION = '1.0';
  private consents: Map<string, KVKKConsent> = new Map();
  private settings: KVKKSettings;

  private constructor() {
    this.settings = {
      consentVersion: this.CURRENT_VERSION,
      lastConsentUpdate: new Date(),
      dataRetentionPeriod: 730, // 2 yıl
      automaticDeletion: true,
      consentReminders: true,
      dataProcessingLog: true,
    };
    this.loadConsents();
  }

  public static getInstance(): KVKKConsentService {
    if (!KVKKConsentService.instance) {
      KVKKConsentService.instance = new KVKKConsentService();
    }
    return KVKKConsentService.instance;
  }

  /**
   * Kullanıcı rızasını kaydet
   */
  async grantConsent(
    userId: string,
    consentType: ConsentType,
    purpose: DataProcessingPurpose,
    legalBasis: LegalBasis = LegalBasis.CONSENT,
    expiryDays?: number,
  ): Promise<void> {
    const consentId = `${userId}_${consentType}_${Date.now()}`;
    const now = new Date();

    const consent: KVKKConsent = {
      id: consentId,
      userId,
      consentType,
      purpose,
      granted: true,
      timestamp: now,
      version: this.CURRENT_VERSION,
      legalBasis,
      expiryDate: expiryDays
        ? new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000)
        : undefined,
    };

    this.consents.set(consentId, consent);
    await this.saveConsents();
    await this.syncToDatabase(consent);
  }

  /**
   * Kullanıcı rızasını geri çek
   */
  async withdrawConsent(userId: string, consentType: ConsentType): Promise<void> {
    const userConsents = Array.from(this.consents.values()).filter(
      (c) => c.userId === userId && c.consentType === consentType && c.granted,
    );

    for (const consent of userConsents) {
      consent.granted = false;
      consent.withdrawnAt = new Date();
      this.consents.set(consent.id, consent);
    }

    await this.saveConsents();
    await this.syncWithdrawalToDatabase(userId, consentType);
  }

  /**
   * Belirli bir rıza türü için onay durumunu kontrol et
   */
  hasValidConsent(userId: string, consentType: ConsentType): boolean {
    const userConsents = Array.from(this.consents.values()).filter(
      (c) =>
        c.userId === userId &&
        c.consentType === consentType &&
        c.granted &&
        !c.withdrawnAt &&
        (!c.expiryDate || c.expiryDate > new Date()),
    );

    return userConsents.length > 0;
  }

  /**
   * Kullanıcının tüm rızalarını getir
   */
  getUserConsents(userId: string): KVKKConsent[] {
    return Array.from(this.consents.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Rıza geçmişini getir (denetim için)
   */
  getConsentHistory(userId: string, consentType?: ConsentType): KVKKConsent[] {
    let history = Array.from(this.consents.values()).filter((c) => c.userId === userId);

    if (consentType) {
      history = history.filter((c) => c.consentType === consentType);
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * KVKK ayarlarını getir
   */
  async getKVKKSettings(userId: string): Promise<KVKKSettings> {
    return { ...this.settings };
  }

  /**
   * KVKK ayarlarını güncelle
   */
  async updateKVKKSettings(userId: string, newSettings: Partial<KVKKSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Kullanıcı verilerini dışa aktar (KVKK hakkı)
   */
  async exportUserData(userId: string): Promise<{
    userData: unknown;
    consents: KVKKConsent[];
    exportDate: string;
    version: string;
    rights: {
      access: string;
      rectification: string;
      erasure: string;
      restriction: string;
      portability: string;
      objection: string;
    };
  }> {
    try {
      const { data: userData, error } = await supabase
        .from('user_data_export')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const consents = this.getUserConsents(userId);

      return {
        userData,
        consents,
        exportDate: new Date().toISOString(),
        version: this.CURRENT_VERSION,
        rights: {
          access: 'Kişisel verilerinize erişim hakkınız vardır',
          rectification: 'Yanlış verilerin düzeltilmesini talep edebilirsiniz',
          erasure: 'Verilerinizin silinmesini talep edebilirsiniz',
          restriction: 'Veri işlemenin kısıtlanmasını talep edebilirsiniz',
          portability: 'Verilerinizi başka platforma taşıyabilirsiniz',
          objection: 'Veri işlemeye itiraz edebilirsiniz',
        },
      };
    } catch (error) {
      errorInDev('KVKK: Veri dışa aktarma hatası:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı verilerini sil (KVKK hakkı)
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      // Veritabanından kullanıcı verilerini sil
      const { error } = await supabase.rpc('delete_user_data_kvkk', {
        user_id: userId,
      });

      if (error) throw error;

      // Yerel rızaları temizle
      const userConsentIds = Array.from(this.consents.entries())
        .filter(([_, consent]) => consent.userId === userId)
        .map(([id, _]) => id);

      userConsentIds.forEach((id) => this.consents.delete(id));
      await this.saveConsents();
    } catch (error) {
      errorInDev('KVKK: Veri silme hatası:', error);
      throw error;
    }
  }

  /**
   * Veri işleme faaliyetlerini logla
   */
  async logDataProcessing(
    userId: string,
    activity: string,
    purpose: DataProcessingPurpose,
    legalBasis: LegalBasis,
    dataTypes: string[],
  ): Promise<void> {
    if (!this.settings.dataProcessingLog) return;

    try {
      const { error } = await supabase.from('kvkk_processing_log').insert({
        user_id: userId,
        activity,
        purpose,
        legal_basis: legalBasis,
        data_types: dataTypes,
        timestamp: new Date().toISOString(),
        version: this.CURRENT_VERSION,
      });

      if (error) throw error;
    } catch (error) {
      errorInDev('KVKK: Veri işleme loglama hatası:', error);
    }
  }

  /**
   * Süresi dolan rızaları temizle
   */
  async cleanupExpiredConsents(): Promise<void> {
    const now = new Date();
    let cleanupCount = 0;

    for (const [id, consent] of this.consents.entries()) {
      if (consent.expiryDate && consent.expiryDate < now) {
        consent.granted = false;
        consent.withdrawnAt = now;
        this.consents.set(id, consent);
        cleanupCount++;
      }
    }

    if (cleanupCount > 0) {
      await this.saveConsents();
      // Cleanup completed silently
    }
  }

  /**
   * KVKK uyumluluk durumunu kontrol et
   */
  async checkCompliance(userId: string): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const userConsents = this.getUserConsents(userId);

    // Gerekli rızaların kontrolü
    const requiredConsents = [ConsentType.NOTIFICATIONS, ConsentType.AI_PROCESSING];
    for (const required of requiredConsents) {
      if (!this.hasValidConsent(userId, required)) {
        issues.push(`Eksik rıza: ${required}`);
      }
    }

    // Rıza yaşı kontrolü
    const oldConsents = userConsents.filter((c) => {
      const ageInDays = (Date.now() - c.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return ageInDays > 365; // 1 yıldan eski
    });

    if (oldConsents.length > 0) {
      recommendations.push('1 yıldan eski rızalar yenilenmelidir');
    }

    // Veri saklama süresi kontrolü
    if (this.settings.dataRetentionPeriod > 730) {
      // 2 yıldan fazla
      recommendations.push('Veri saklama süresi KVKK önerilerine uygun şekilde azaltılmalıdır');
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Yerel depolamaya kaydet
   */
  private async saveConsents(): Promise<void> {
    try {
      const data = {
        consents: Array.from(this.consents.entries()),
        settings: this.settings,
        lastUpdate: new Date().toISOString(),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      errorInDev('KVKK: Yerel kaydetme hatası:', error);
    }
  }

  /**
   * Yerel depolamadan yükle
   */
  private async loadConsents(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.consents = new Map(parsed.consents || []);
        this.settings = { ...this.settings, ...parsed.settings };
      }
    } catch (error) {
      errorInDev('KVKK: Yerel yükleme hatası:', error);
    }
  }

  /**
   * Veritabanına senkronize et
   */
  private async syncToDatabase(consent: KVKKConsent): Promise<void> {
    try {
      const { error } = await supabase.from('kvkk_consents').upsert({
        id: consent.id,
        user_id: consent.userId,
        consent_type: consent.consentType,
        purpose: consent.purpose,
        granted: consent.granted,
        timestamp: consent.timestamp.toISOString(),
        version: consent.version,
        legal_basis: consent.legalBasis,
        expiry_date: consent.expiryDate?.toISOString(),
        withdrawn_at: consent.withdrawnAt?.toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      errorInDev('KVKK: Veritabanı senkronizasyon hatası:', error);
    }
  }

  /**
   * Rıza geri çekme işlemini veritabanına senkronize et
   */
  private async syncWithdrawalToDatabase(userId: string, consentType: ConsentType): Promise<void> {
    try {
      const { error } = await supabase
        .from('kvkk_consents')
        .update({
          granted: false,
          withdrawn_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('consent_type', consentType)
        .eq('granted', true);

      if (error) throw error;
    } catch (error) {
      errorInDev('KVKK: Rıza geri çekme senkronizasyon hatası:', error);
    }
  }
}

export const kvkkConsentService = KVKKConsentService.getInstance();
export default kvkkConsentService;
