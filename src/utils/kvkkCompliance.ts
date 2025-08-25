/**
 * KVKK Compliance Utilities - KVKK uyumluluk kontrolleri ve yardımcı fonksiyonlar
 *
 * Bu dosya:
 * - KVKK compliance kontrollerini yapar
 * - Veri işleme aktivitelerini loglar
 * - Rıza geçerlilik kontrollerini sağlar
 * - Audit trail oluşturur
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ConsentType, DataProcessingPurpose, LegalBasis } from '../services/kvkkConsentService';

// KVKK Compliance Levels
export enum ComplianceLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  COMPLIANT = 'compliant',
}

// Data Processing Activity Log
export interface DataProcessingActivity {
  id: string;
  userId: string;
  activity: string;
  purpose: DataProcessingPurpose;
  legalBasis: LegalBasis;
  dataTypes: string[];
  timestamp: string;
  consentRequired: boolean;
  consentGiven: boolean;
  retentionPeriod?: number; // days
  thirdPartySharing?: boolean;
  location?: string; // processing location
}

// KVKK Compliance Report
export interface KVKKComplianceReport {
  userId: string;
  timestamp: string;
  overallScore: number;
  level: ComplianceLevel;
  consentCompliance: {
    required: ConsentType[];
    granted: ConsentType[];
    missing: ConsentType[];
    expired: ConsentType[];
  };
  dataProcessingCompliance: {
    totalActivities: number;
    compliantActivities: number;
    nonCompliantActivities: number;
    issues: string[];
  };
  recommendations: string[];
  nextReviewDate: string;
}

// KVKK Risk Assessment
export interface KVKKRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  mitigationActions: string[];
  dueDate: string;
}

class KVKKComplianceChecker {
  private static instance: KVKKComplianceChecker;
  private readonly STORAGE_KEY = 'kvkk_compliance_data';
  private readonly ACTIVITY_LOG_KEY = 'kvkk_activity_log';
  private readonly AUDIT_TRAIL_KEY = 'kvkk_audit_trail';

  public static getInstance(): KVKKComplianceChecker {
    if (!KVKKComplianceChecker.instance) {
      KVKKComplianceChecker.instance = new KVKKComplianceChecker();
    }
    return KVKKComplianceChecker.instance;
  }

  // Veri işleme aktivitesini logla
  async logDataProcessingActivity(
    activity: Omit<DataProcessingActivity, 'id' | 'timestamp'>,
  ): Promise<void> {
    try {
      const activityWithMetadata: DataProcessingActivity = {
        ...activity,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
      };

      const existingLogs = await this.getActivityLogs();
      const updatedLogs = [...existingLogs, activityWithMetadata];

      // Son 1000 aktiviteyi sakla
      const trimmedLogs = updatedLogs.slice(-1000);

      await AsyncStorage.setItem(this.ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));

      // Audit trail'e de ekle
      await this.addToAuditTrail({
        action: 'data_processing_logged',
        details: {
          activity: activity.activity,
          purpose: activity.purpose,
          userId: activity.userId,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Veri işleme aktivitesi loglanamadı:', error);
    }
  }

  // Aktivite loglarını getir
  async getActivityLogs(userId?: string): Promise<DataProcessingActivity[]> {
    try {
      const logsJson = await AsyncStorage.getItem(this.ACTIVITY_LOG_KEY);
      const logs: DataProcessingActivity[] = logsJson ? JSON.parse(logsJson) : [];

      if (userId) {
        return logs.filter((log) => log.userId === userId);
      }

      return logs;
    } catch (error) {
      console.error('Aktivite logları alınamadı:', error);
      return [];
    }
  }

  // KVKK compliance raporu oluştur
  async generateComplianceReport(userId: string, consents: any[]): Promise<KVKKComplianceReport> {
    try {
      const activities = await this.getActivityLogs(userId);
      const consentCompliance = this.analyzeConsentCompliance(consents);
      const dataProcessingCompliance = this.analyzeDataProcessingCompliance(activities);

      const overallScore = this.calculateOverallScore(consentCompliance, dataProcessingCompliance);
      const level = this.determineComplianceLevel(overallScore);
      const recommendations = this.generateRecommendations(
        consentCompliance,
        dataProcessingCompliance,
      );

      const report: KVKKComplianceReport = {
        userId,
        timestamp: new Date().toISOString(),
        overallScore,
        level,
        consentCompliance,
        dataProcessingCompliance,
        recommendations,
        nextReviewDate: this.calculateNextReviewDate(level),
      };

      // Raporu sakla
      await this.saveComplianceReport(report);

      return report;
    } catch (error) {
      console.error('Compliance raporu oluşturulamadı:', error);
      throw error;
    }
  }

  // Risk değerlendirmesi yap
  async assessKVKKRisk(userId: string): Promise<KVKKRiskAssessment> {
    const activities = await this.getActivityLogs(userId);
    const riskFactors: string[] = [];
    const mitigationActions: string[] = [];

    // Risk faktörlerini analiz et
    const sensitiveDataProcessing = activities.filter((a) =>
      a.dataTypes.some((type) => ['biometric', 'health', 'financial', 'location'].includes(type)),
    );

    if (sensitiveDataProcessing.length > 0) {
      riskFactors.push('Hassas veri işleme tespit edildi');
      mitigationActions.push('Hassas veri işleme için ek güvenlik önlemleri alın');
    }

    const thirdPartySharing = activities.filter((a) => a.thirdPartySharing);
    if (thirdPartySharing.length > 0) {
      riskFactors.push('Üçüncü taraf veri paylaşımı mevcut');
      mitigationActions.push('Üçüncü taraf anlaşmalarını KVKK uyumlu hale getirin');
    }

    const missingConsents = activities.filter((a) => a.consentRequired && !a.consentGiven);
    if (missingConsents.length > 0) {
      riskFactors.push('Rıza gerektiren işlemler için eksik rızalar');
      mitigationActions.push('Eksik rızaları derhal alın');
    }

    // Risk seviyesini belirle
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (riskFactors.length === 0) {
      riskLevel = 'low';
    } else if (riskFactors.length <= 2) {
      riskLevel = 'medium';
    } else if (riskFactors.length <= 4) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }

    return {
      riskLevel,
      riskFactors,
      mitigationActions,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün sonra
    };
  }

  // Veri saklama süresi kontrolü
  async checkDataRetentionCompliance(userId: string): Promise<{
    compliant: boolean;
    expiredData: DataProcessingActivity[];
    warnings: string[];
  }> {
    const activities = await this.getActivityLogs(userId);
    const now = new Date();
    const expiredData: DataProcessingActivity[] = [];
    const warnings: string[] = [];

    for (const activity of activities) {
      if (activity.retentionPeriod) {
        const activityDate = new Date(activity.timestamp);
        const expiryDate = new Date(
          activityDate.getTime() + activity.retentionPeriod * 24 * 60 * 60 * 1000,
        );

        if (now > expiryDate) {
          expiredData.push(activity);
        } else {
          // 30 gün içinde süresi dolacaklar için uyarı
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
          );
          if (daysUntilExpiry <= 30) {
            warnings.push(`${activity.activity} verisi ${daysUntilExpiry} gün içinde silinmelidir`);
          }
        }
      }
    }

    return {
      compliant: expiredData.length === 0,
      expiredData,
      warnings,
    };
  }

  // Audit trail'e kayıt ekle
  private async addToAuditTrail(entry: {
    action: string;
    details: any;
    timestamp: string;
  }): Promise<void> {
    try {
      const existingTrail = await AsyncStorage.getItem(this.AUDIT_TRAIL_KEY);
      const trail = existingTrail ? JSON.parse(existingTrail) : [];

      trail.push({
        id: this.generateId(),
        ...entry,
      });

      // Son 500 kaydı sakla
      const trimmedTrail = trail.slice(-500);

      await AsyncStorage.setItem(this.AUDIT_TRAIL_KEY, JSON.stringify(trimmedTrail));
    } catch (error) {
      console.error('Audit trail güncellenemedi:', error);
    }
  }

  // Rıza compliance analizi
  private analyzeConsentCompliance(consents: any[]) {
    const requiredConsents = [ConsentType.AI_PROCESSING]; // Zorunlu rızalar
    const allConsentTypes = Object.values(ConsentType);

    const granted = consents
      .filter((c) => c.granted && new Date(c.expiresAt) > new Date())
      .map((c) => c.consentType);

    const expired = consents
      .filter((c) => c.granted && new Date(c.expiresAt) <= new Date())
      .map((c) => c.consentType);

    const missing = requiredConsents.filter((required) => !granted.includes(required));

    return {
      required: requiredConsents,
      granted,
      missing,
      expired,
    };
  }

  // Veri işleme compliance analizi
  private analyzeDataProcessingCompliance(activities: DataProcessingActivity[]) {
    const totalActivities = activities.length;
    const compliantActivities = activities.filter(
      (a) => !a.consentRequired || a.consentGiven,
    ).length;
    const nonCompliantActivities = totalActivities - compliantActivities;

    const issues: string[] = [];

    activities.forEach((activity) => {
      if (activity.consentRequired && !activity.consentGiven) {
        issues.push(`${activity.activity}: Rıza gerekli ancak verilmemiş`);
      }
    });

    return {
      totalActivities,
      compliantActivities,
      nonCompliantActivities,
      issues,
    };
  }

  // Genel skor hesaplama
  private calculateOverallScore(consentCompliance: any, dataProcessingCompliance: any): number {
    // Consent score: 0 if any required consent is missing, otherwise 50
    const consentScore = consentCompliance.missing.length === 0 ? 50 : 0;

    // Processing score: 50 if no activities (neutral) or all activities are compliant
    const processingScore =
      dataProcessingCompliance.totalActivities === 0
        ? 50
        : (dataProcessingCompliance.compliantActivities /
            dataProcessingCompliance.totalActivities) *
          50;

    return Math.round(consentScore + processingScore);
  }

  // Compliance seviyesi belirleme
  private determineComplianceLevel(score: number): ComplianceLevel {
    if (score >= 90) return ComplianceLevel.COMPLIANT;
    if (score >= 70) return ComplianceLevel.LOW;
    if (score >= 50) return ComplianceLevel.MEDIUM;
    if (score >= 30) return ComplianceLevel.HIGH;
    return ComplianceLevel.CRITICAL;
  }

  // Öneriler oluşturma
  private generateRecommendations(consentCompliance: any, dataProcessingCompliance: any): string[] {
    const recommendations: string[] = [];

    if (consentCompliance.missing.length > 0) {
      recommendations.push('Eksik zorunlu rızaları derhal alın');
    }

    if (consentCompliance.expired.length > 0) {
      recommendations.push('Süresi dolan rızaları yenileyin');
    }

    if (dataProcessingCompliance.nonCompliantActivities > 0) {
      recommendations.push('Rıza gerektiren veri işleme aktiviteleri için rıza alın');
    }

    if (recommendations.length === 0) {
      recommendations.push('KVKK uyumluluğunuz iyi durumda, düzenli kontroller yapmaya devam edin');
    }

    return recommendations;
  }

  // Sonraki inceleme tarihi hesaplama
  private calculateNextReviewDate(level: ComplianceLevel): string {
    const now = new Date();
    let daysToAdd = 90; // Varsayılan 3 ay

    switch (level) {
      case ComplianceLevel.CRITICAL:
        daysToAdd = 7; // 1 hafta
        break;
      case ComplianceLevel.HIGH:
        daysToAdd = 30; // 1 ay
        break;
      case ComplianceLevel.MEDIUM:
        daysToAdd = 60; // 2 ay
        break;
      case ComplianceLevel.LOW:
        daysToAdd = 90; // 3 ay
        break;
      case ComplianceLevel.COMPLIANT:
        daysToAdd = 180; // 6 ay
        break;
    }

    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
  }

  // Compliance raporu kaydetme
  private async saveComplianceReport(report: KVKKComplianceReport): Promise<void> {
    try {
      const key = `${this.STORAGE_KEY}_${report.userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(report));
    } catch (error) {
      console.error('Compliance raporu kaydedilemedi:', error);
    }
  }

  // ID oluşturma
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const kvkkComplianceChecker = KVKKComplianceChecker.getInstance();

// Utility functions
export const logDataProcessing = (activity: Omit<DataProcessingActivity, 'id' | 'timestamp'>) => {
  return kvkkComplianceChecker.logDataProcessingActivity(activity);
};

export const generateComplianceReport = (userId: string, consents: any[]) => {
  return kvkkComplianceChecker.generateComplianceReport(userId, consents);
};

export const assessKVKKRisk = (userId: string) => {
  return kvkkComplianceChecker.assessKVKKRisk(userId);
};

export const checkDataRetention = (userId: string) => {
  return kvkkComplianceChecker.checkDataRetentionCompliance(userId);
};

export default kvkkComplianceChecker;
