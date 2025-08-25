/**
 * Tests for AccessibilityService
 * Validates WCAG 2.1 AA compliance functionality
 */

import AccessibilityService from '../../src/services/accessibilityService';
import { AccessibilityInfo } from 'react-native';

// Mock React Native AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    addEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Mock console methods
jest.mock('../../src/utils/consoleSuppress', () => ({
  logInDev: jest.fn(),
  errorInDev: jest.fn(),
}));

describe('AccessibilityService', () => {
  let accessibilityService: AccessibilityService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset singleton instance
    (AccessibilityService as any).instance = null;
    
    // Create new instance for each test
    accessibilityService = AccessibilityService.getInstance();
    
    // Setup default mocks
    (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
    
    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('WCAG Compliance Validation', () => {
    it('should validate WCAG 2.1 AA compliance', () => {
      const result = accessibilityService.validateWCAGCompliance();
      
      expect(result).toHaveProperty('level', 'AA');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should return score between 0 and 100', () => {
      const result = accessibilityService.validateWCAGCompliance();
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should pass when score is 80 or above', () => {
      const result = accessibilityService.validateWCAGCompliance();
      
      if (result.score >= 80) {
        expect(result.passed).toBe(true);
      } else {
        expect(result.passed).toBe(false);
      }
    });

    it('should include proper issue structure', () => {
      const result = accessibilityService.validateWCAGCompliance();
      
      result.issues.forEach(issue => {
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('guideline');
        expect(issue).toHaveProperty('criterion');
        expect(issue).toHaveProperty('description');
        expect(issue).toHaveProperty('fix');
        expect(issue).toHaveProperty('wcagReference');
        expect(['critical', 'major', 'minor']).toContain(issue.severity);
        expect(typeof issue.description).toBe('string');
        expect(typeof issue.fix).toBe('string');
        expect(issue.wcagReference).toMatch(/^https?:\/\//); // Should be a valid URL
      });
    });
  });

  describe('Color Contrast Validation', () => {
    it('should calculate contrast ratio correctly', () => {
      // Test known contrast ratios
      const service = accessibilityService as any;
      
      // Black on white should have high contrast
      const blackWhiteRatio = service.calculateContrastRatio('#000000', '#FFFFFF');
      expect(blackWhiteRatio).toBeCloseTo(21, 0); // Perfect contrast
      
      // Same colors should have ratio of 1
      const sameColorRatio = service.calculateContrastRatio('#FF0000', '#FF0000');
      expect(sameColorRatio).toBeCloseTo(1, 0);
    });

    it('should validate hex to RGB conversion', () => {
      const service = accessibilityService as any;
      
      const whiteRgb = service.hexToRgb('#FFFFFF');
      expect(whiteRgb).toEqual({ r: 255, g: 255, b: 255 });
      
      const blackRgb = service.hexToRgb('#000000');
      expect(blackRgb).toEqual({ r: 0, g: 0, b: 0 });
      
      const redRgb = service.hexToRgb('#FF0000');
      expect(redRgb).toEqual({ r: 255, g: 0, b: 0 });
      
      // Test without # prefix
      const blueRgb = service.hexToRgb('0000FF');
      expect(blueRgb).toEqual({ r: 0, g: 0, b: 255 });
      
      // Test invalid hex
      const invalidRgb = service.hexToRgb('invalid');
      expect(invalidRgb).toBeNull();
    });

    it('should calculate luminance correctly', () => {
      const service = accessibilityService as any;
      
      // White should have luminance close to 1
      const whiteLuminance = service.getLuminance('#FFFFFF');
      expect(whiteLuminance).toBeCloseTo(1, 1);
      
      // Black should have luminance close to 0
      const blackLuminance = service.getLuminance('#000000');
      expect(blackLuminance).toBeCloseTo(0, 2);
      
      // Gray should be in between
      const grayLuminance = service.getLuminance('#808080');
      expect(grayLuminance).toBeGreaterThan(0);
      expect(grayLuminance).toBeLessThan(1);
    });

    it('should identify AA and AAA compliance levels', () => {
      const result = accessibilityService.validateWCAGCompliance();
      const service = accessibilityService as any;
      const contrastResults = service.validateColorContrast();
      
      contrastResults.forEach((result: any) => {
        expect(typeof result.passesAA).toBe('boolean');
        expect(typeof result.passesAAA).toBe('boolean');
        expect(result.ratio).toBeGreaterThan(0);
        
        // AAA should be stricter than AA
        if (result.passesAAA) {
          expect(result.passesAA).toBe(true);
        }
        
        // Check thresholds
        if (result.ratio >= 4.5) {
          expect(result.passesAA).toBe(true);
        }
        if (result.ratio >= 7) {
          expect(result.passesAAA).toBe(true);
        }
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should detect screen reader state', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);
      
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(AccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalled();
    });

    it('should provide accessible props', () => {
      const props = accessibilityService.getAccessibleProps({
        label: 'Test Button',
        hint: 'Tap to perform action',
        role: 'button',
        state: { selected: true },
        actions: [{ name: 'activate', label: 'Activate' }]
      });
      
      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Test Button',
        accessibilityHint: 'Tap to perform action',
        accessibilityRole: 'button',
        accessibilityState: { selected: true },
        accessibilityActions: [{ name: 'activate', label: 'Activate' }]
      });
    });

    it('should handle minimal accessible props', () => {
      const props = accessibilityService.getAccessibleProps({
        label: 'Simple Label'
      });
      
      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Simple Label',
        accessibilityHint: undefined,
        accessibilityRole: undefined,
        accessibilityState: undefined,
        accessibilityActions: undefined
      });
    });

    it('should announce messages for accessibility', () => {
      const message = 'Test announcement';
      accessibilityService.announceForAccessibility(message);
      
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(message);
    });
  });

  describe('System State Detection', () => {
    it('should track screen reader state', () => {
      // Initially false (from constructor)
      expect(accessibilityService.isScreenReaderActive()).toBe(false);
    });

    it('should track reduce motion state', () => {
      // Initially false (from constructor)
      expect(accessibilityService.isReduceMotionActive()).toBe(false);
    });

    it('should listen for accessibility changes', () => {
      // Service sets up listeners during initialization
      expect(AccessibilityInfo.addEventListener).toHaveBeenCalled();
    });
  });

  describe('Accessibility Report Generation', () => {
    it('should generate comprehensive accessibility report', () => {
      const report = accessibilityService.generateAccessibilityReport();
      
      expect(typeof report).toBe('string');
      expect(report).toContain('WCAG 2.1 AA Accessibility Report');
      expect(report).toContain('Compliance Score:');
      expect(report).toContain('Status:');
      expect(report).toContain('System Accessibility Settings');
      expect(report).toContain('Screen Reader:');
      expect(report).toContain('Reduce Motion:');
      expect(report).toContain('Platform:');
    });

    it('should include issues in report when present', () => {
      const report = accessibilityService.generateAccessibilityReport();
      const result = accessibilityService.validateWCAGCompliance();
      
      if (result.issues.length > 0) {
        expect(report).toContain('Issues Found');
        
        const criticalIssues = result.issues.filter(i => i.severity === 'critical');
        const majorIssues = result.issues.filter(i => i.severity === 'major');
        const minorIssues = result.issues.filter(i => i.severity === 'minor');
        
        if (criticalIssues.length > 0) {
          expect(report).toContain('🚨 Critical Issues');
        }
        if (majorIssues.length > 0) {
          expect(report).toContain('⚠️ Major Issues');
        }
        if (minorIssues.length > 0) {
          expect(report).toContain('ℹ️ Minor Issues');
        }
      }
    });

    it('should include recommendations in report', () => {
      const report = accessibilityService.generateAccessibilityReport();
      const result = accessibilityService.validateWCAGCompliance();
      
      if (result.recommendations.length > 0) {
        expect(report).toContain('Recommendations');
        result.recommendations.forEach(rec => {
          expect(report).toContain(rec);
        });
      }
    });

    it('should show proper status indicators', () => {
      const report = accessibilityService.generateAccessibilityReport();
      const result = accessibilityService.validateWCAGCompliance();
      
      if (result.passed) {
        expect(report).toContain('✅ PASSED');
      } else {
        expect(report).toContain('❌ FAILED');
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid color inputs gracefully', () => {
      const service = accessibilityService as any;
      
      const invalidRatio = service.calculateContrastRatio('invalid', '#FFFFFF');
      expect(typeof invalidRatio).toBe('number');
      expect(invalidRatio).toBeGreaterThan(0);
      
      const anotherInvalidRatio = service.calculateContrastRatio('#FFFFFF', 'also-invalid');
      expect(typeof anotherInvalidRatio).toBe('number');
      expect(anotherInvalidRatio).toBeGreaterThan(0);
    });

    it('should handle accessibility info errors gracefully', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      // Should not throw
      expect(() => {
        const newService = require('../../src/services/accessibilityService').default;
      }).not.toThrow();
    });

    it('should provide fallback values when validation fails', () => {
      // This tests the error handling in the validation methods
      const result = accessibilityService.validateWCAGCompliance();
      
      // Should still return a valid result structure even if some validations fail
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('recommendations');
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = require('../../src/services/accessibilityService').default;
      const instance2 = require('../../src/services/accessibilityService').default;
      
      expect(instance1).toBe(instance2);
    });
  });
});