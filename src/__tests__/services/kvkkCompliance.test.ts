/**
 * KVKK Compliance Service Tests
 * 
 * Bu test dosyası KVKK compliance checker'ın doğru çalıştığını doğrular:
 * - Veri işleme aktivitelerinin loglanması
 * - Compliance raporu oluşturma
 * - Risk değerlendirmesi
 * - Veri saklama süresi kontrolü
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ComplianceLevel,
  DataProcessingActivity,
  kvkkComplianceChecker,
  KVKKComplianceReport,
  KVKKRiskAssessment,
} from '../../utils/kvkkCompliance';
import { ConsentType, DataProcessingPurpose, LegalBasis } from '../../services/kvkkConsentService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('KVKK Compliance Checker', () => {
  const testUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('Data Processing Activity Logging', () => {
    it('should log data processing activity correctly', async () => {
      const activity: Omit<DataProcessingActivity, 'id' | 'timestamp'> = {
        userId: testUserId,
        activity: 'AI outfit recommendation',
        purpose: DataProcessingPurpose.AI_PROCESSING,
        legalBasis: LegalBasis.CONSENT,
        dataTypes: ['clothing_preferences', 'style_data'],
        consentRequired: true,
        consentGiven: true,
        retentionPeriod: 365,
        thirdPartySharing: false,
        location: 'Turkey'
      };

      await kvkkComplianceChecker.logDataProcessingActivity(activity);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'kvkk_activity_log',
        expect.stringContaining('AI outfit recommendation')
      );
    });

    it('should retrieve activity logs for specific user', async () => {
      const mockLogs: DataProcessingActivity[] = [
        {
          id: '1',
          userId: testUserId,
          activity: 'Profile update',
          purpose: DataProcessingPurpose.ACCOUNT_MANAGEMENT,
          legalBasis: LegalBasis.CONTRACT,
          dataTypes: ['profile_data'],
          timestamp: new Date().toISOString(),
          consentRequired: false,
          consentGiven: false
        },
        {
          id: '2',
          userId: 'other-user',
          activity: 'Other activity',
          purpose: DataProcessingPurpose.AI_PROCESSING,
          legalBasis: LegalBasis.CONSENT,
          dataTypes: ['other_data'],
          timestamp: new Date().toISOString(),
          consentRequired: true,
          consentGiven: true
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLogs));

      const userLogs = await kvkkComplianceChecker.getActivityLogs(testUserId);

      expect(userLogs).toHaveLength(1);
      expect(userLogs[0].userId).toBe(testUserId);
    });
  });

  describe('Compliance Report Generation', () => {
    it('should generate comprehensive compliance report', async () => {
      const mockConsents = [
        {
          consentType: ConsentType.AI_PROCESSING,
          granted: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          consentType: ConsentType.ANALYTICS,
          granted: false,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockActivities: DataProcessingActivity[] = [
        {
          id: '1',
          userId: testUserId,
          activity: 'AI recommendation',
          purpose: DataProcessingPurpose.AI_PROCESSING,
          legalBasis: LegalBasis.CONSENT,
          dataTypes: ['style_preferences'],
          timestamp: new Date().toISOString(),
          consentRequired: true,
          consentGiven: true
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockActivities));

      const report = await kvkkComplianceChecker.generateComplianceReport(testUserId, mockConsents);

      expect(report).toBeDefined();
      expect(report.userId).toBe(testUserId);
      expect(report.overallScore).toBeGreaterThan(0);
      expect(report.level).toBeDefined();
      expect(report.consentCompliance).toBeDefined();
      expect(report.dataProcessingCompliance).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should calculate correct compliance score', async () => {
      const mockConsents = [
        {
          consentType: ConsentType.AI_PROCESSING,
          granted: true,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue('[]'); // No activities

      const report = await kvkkComplianceChecker.generateComplianceReport(testUserId, mockConsents);

      expect(report.overallScore).toBe(100); // Perfect score with required consent and no activities
      expect(report.level).toBe(ComplianceLevel.COMPLIANT);
    });

    it('should identify missing required consents', async () => {
      const mockConsents: any[] = []; // No consents given

      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const report = await kvkkComplianceChecker.generateComplianceReport(testUserId, mockConsents);

      expect(report.consentCompliance.missing).toContain(ConsentType.AI_PROCESSING);
      expect(report.overallScore).toBeLessThanOrEqual(50);
      expect(report.level).not.toBe(ComplianceLevel.COMPLIANT);
    });
  });

  describe('Risk Assessment', () => {
    it('should assess low risk for compliant activities', async () => {
      const mockActivities: DataProcessingActivity[] = [
        {
          id: '1',
          userId: testUserId,
          activity: 'Basic profile update',
          purpose: DataProcessingPurpose.ACCOUNT_MANAGEMENT,
          legalBasis: LegalBasis.CONTRACT,
          dataTypes: ['basic_profile'],
          timestamp: new Date().toISOString(),
          consentRequired: false,
          consentGiven: false,
          thirdPartySharing: false
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockActivities));

      const riskAssessment = await kvkkComplianceChecker.assessKVKKRisk(testUserId);

      expect(riskAssessment.riskLevel).toBe('low');
      expect(riskAssessment.riskFactors).toHaveLength(0);
      expect(riskAssessment.mitigationActions).toHaveLength(0);
    });

    it('should assess high risk for sensitive data without consent', async () => {
      const mockActivities: DataProcessingActivity[] = [
        {
          id: '1',
          userId: testUserId,
          activity: 'Biometric analysis',
          purpose: DataProcessingPurpose.AI_PROCESSING,
          legalBasis: LegalBasis.CONSENT,
          dataTypes: ['biometric', 'health'],
          timestamp: new Date().toISOString(),
          consentRequired: true,
          consentGiven: false, // Missing consent
          thirdPartySharing: true
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockActivities));

      const riskAssessment = await kvkkComplianceChecker.assessKVKKRisk(testUserId);

      expect(riskAssessment.riskLevel).toBe('high');
      expect(riskAssessment.riskFactors.length).toBeGreaterThan(0);
      expect(riskAssessment.mitigationActions.length).toBeGreaterThan(0);
    });
  });

  describe('Data Retention Compliance', () => {
    it('should identify expired data for deletion', async () => {
      const expiredDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000); // 400 days ago
      
      const mockActivities: DataProcessingActivity[] = [
        {
          id: '1',
          userId: testUserId,
          activity: 'Old recommendation',
          purpose: DataProcessingPurpose.AI_PROCESSING,
          legalBasis: LegalBasis.CONSENT,
          dataTypes: ['style_data'],
          timestamp: expiredDate.toISOString(),
          consentRequired: true,
          consentGiven: true,
          retentionPeriod: 365 // 365 days retention
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockActivities));

      const retentionCheck = await kvkkComplianceChecker.checkDataRetentionCompliance(testUserId);

      expect(retentionCheck.compliant).toBe(false);
      expect(retentionCheck.expiredData).toHaveLength(1);
      expect(retentionCheck.expiredData[0].id).toBe('1');
    });

    it('should warn about data expiring soon', async () => {
      const soonToExpireDate = new Date(Date.now() - 340 * 24 * 60 * 60 * 1000); // 340 days ago
      
      const mockActivities: DataProcessingActivity[] = [
        {
          id: '1',
          userId: testUserId,
          activity: 'Recent recommendation',
          purpose: DataProcessingPurpose.AI_PROCESSING,
          legalBasis: LegalBasis.CONSENT,
          dataTypes: ['style_data'],
          timestamp: soonToExpireDate.toISOString(),
          consentRequired: true,
          consentGiven: true,
          retentionPeriod: 365 // Will expire in 25 days
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockActivities));

      const retentionCheck = await kvkkComplianceChecker.checkDataRetentionCompliance(testUserId);

      expect(retentionCheck.compliant).toBe(true);
      expect(retentionCheck.expiredData).toHaveLength(0);
      expect(retentionCheck.warnings.length).toBeGreaterThan(0);
      expect(retentionCheck.warnings[0]).toContain('25');
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const logs = await kvkkComplianceChecker.getActivityLogs(testUserId);

      expect(logs).toEqual([]);
    });

    it('should handle malformed data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const logs = await kvkkComplianceChecker.getActivityLogs(testUserId);

      expect(logs).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should limit activity log size to prevent memory issues', async () => {
      // Create 1500 activities (more than the 1000 limit)
      const manyActivities = Array.from({ length: 1500 }, (_, i) => ({
        id: `activity-${i}`,
        userId: testUserId,
        activity: `Activity ${i}`,
        purpose: DataProcessingPurpose.AI_PROCESSING,
        legalBasis: LegalBasis.CONSENT,
        dataTypes: ['test_data'],
        timestamp: new Date().toISOString(),
        consentRequired: true,
        consentGiven: true
      }));

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(manyActivities));

      const newActivity: Omit<DataProcessingActivity, 'id' | 'timestamp'> = {
        userId: testUserId,
        activity: 'New activity',
        purpose: DataProcessingPurpose.AI_PROCESSING,
        legalBasis: LegalBasis.CONSENT,
        dataTypes: ['new_data'],
        consentRequired: true,
        consentGiven: true
      };

      await kvkkComplianceChecker.logDataProcessingActivity(newActivity);

      // Verify that setItem was called with trimmed data (max 1000 items)
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'kvkk_activity_log',
        expect.stringMatching(/^\[.*\]$/)
      );

      const savedData = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData.length).toBeLessThanOrEqual(1000);
    });
  });
});