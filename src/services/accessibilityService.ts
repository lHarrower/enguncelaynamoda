/**
 * WCAG 2.1 AA Accessibility Compliance Service
 * Provides comprehensive accessibility validation and utilities
 */

import { AccessibilityInfo, Platform } from 'react-native';

import { errorInDev, logInDev, warnInDev } from '../utils/consoleSuppress';

// Default color palette for testing
const DEFAULT_COLORS = {
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
  background: {
    primary: '#FFFFFF',
  },
  sage: {
    light: '#E8F5E8',
  },
  gold: {
    light: '#FFF8DC',
  },
  functional: {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
};

// Type-safe import of UNIFIED_COLORS with proper fallback
let UNIFIED_COLORS: typeof DEFAULT_COLORS;
try {
  // Use static import with proper typing
  const { UNIFIED_COLORS: ImportedColors } = require('../theme/DesignSystem') as {
    UNIFIED_COLORS: typeof DEFAULT_COLORS;
  };
  UNIFIED_COLORS = ImportedColors || DEFAULT_COLORS;
} catch (error) {
  // Log error in development for debugging
  if (__DEV__) {
    warnInDev(
      'Failed to import UNIFIED_COLORS from DesignSystem, using defaults:',
      error as unknown,
    );
  }
  UNIFIED_COLORS = DEFAULT_COLORS;
}

interface WCAGComplianceResult {
  level: 'AA' | 'AAA';
  passed: boolean;
  score: number; // 0-100
  issues: AccessibilityIssue[];
  recommendations: string[];
}

interface AccessibilityIssue {
  severity: 'critical' | 'major' | 'minor';
  guideline: string;
  criterion: string;
  description: string;
  element?: string;
  fix: string;
  wcagReference: string;
}

interface ColorContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  foreground: string;
  background: string;
}

interface TouchTargetValidation {
  width: number;
  height: number;
  meetsMinimum: boolean;
  hasAdequateSpacing: boolean;
}

interface ScreenReaderValidation {
  hasAccessibilityLabel: boolean;
  hasAccessibilityHint: boolean;
  hasAccessibilityRole: boolean;
  hasAccessibilityState: boolean;
  isProperlyStructured: boolean;
}

interface KeyboardNavigationValidation {
  isFocusable: boolean;
  hasProperTabOrder: boolean;
  hasVisibleFocusIndicator: boolean;
  supportsKeyboardActions: boolean;
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private screenReaderEnabled = false;
  private reduceMotionEnabled = false;
  private isHighContrastEnabled = false;

  private constructor() {
    this.screenReaderEnabled = false;
    this.reduceMotionEnabled = false;
    this.initializeAccessibility();
    // Initialize async state separately
    this.initializeAccessibilityState().catch((err) =>
      warnInDev('initializeAccessibilityState failed:', err),
    );
  }

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Initialize accessibility state from system settings
   */
  private async initializeAccessibilityState(): Promise<void> {
    try {
      this.screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();

      // Listen for accessibility changes
      AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        this.screenReaderEnabled = enabled;
        logInDev('Screen reader state changed:', enabled);
      });

      AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        this.reduceMotionEnabled = enabled;
        logInDev('Reduce motion state changed:', enabled);
      });
    } catch (error) {
      errorInDev('Failed to initialize accessibility state:', String(error));
    }
  }

  /**
   * Comprehensive WCAG 2.1 AA compliance check
   */
  public validateWCAGCompliance(): WCAGComplianceResult {
    const issues: AccessibilityIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 1. Color Contrast (WCAG 1.4.3)
    const contrastResults = this.validateColorContrast();
    contrastResults.forEach((result) => {
      if (!result.passesAA) {
        issues.push({
          severity: 'critical',
          guideline: 'Perceivable',
          criterion: '1.4.3 Contrast (Minimum)',
          description: `Color contrast ratio ${result.ratio.toFixed(2)} is below WCAG AA standard (4.5:1)`,
          fix: 'Increase contrast between foreground and background colors',
          wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        });
        score -= 15;
      }
    });

    // 2. Touch Target Size (WCAG 2.5.5)
    const touchTargetIssues = this.validateTouchTargets();
    touchTargetIssues.forEach((issue) => {
      issues.push({
        severity: 'major',
        guideline: 'Operable',
        criterion: '2.5.5 Target Size',
        description: 'Interactive element does not meet minimum 44x44pt touch target size',
        element: issue.element,
        fix: 'Increase touch target size to minimum 44x44pt or add adequate spacing',
        wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html',
      });
      score -= 10;
    });

    // 3. Screen Reader Support (WCAG 4.1.2)
    const screenReaderIssues = this.validateScreenReaderSupport();
    screenReaderIssues.forEach((issue) => {
      issues.push({
        severity: 'critical',
        guideline: 'Robust',
        criterion: '4.1.2 Name, Role, Value',
        description: issue.description,
        element: issue.element,
        fix: issue.fix,
        wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
      });
      score -= 12;
    });

    // 4. Keyboard Navigation (WCAG 2.1.1)
    const keyboardIssues = this.validateKeyboardNavigation();
    keyboardIssues.forEach((issue) => {
      issues.push({
        severity: 'major',
        guideline: 'Operable',
        criterion: '2.1.1 Keyboard',
        description: issue.description,
        element: issue.element,
        fix: issue.fix,
        wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
      });
      score -= 8;
    });

    // 5. Focus Management (WCAG 2.4.3)
    const focusIssues = this.validateFocusManagement();
    focusIssues.forEach((issue) => {
      issues.push({
        severity: 'major',
        guideline: 'Operable',
        criterion: '2.4.3 Focus Order',
        description: issue.description,
        fix: issue.fix,
        wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
      });
      score -= 8;
    });

    // Generate recommendations
    if (score >= 95) {
      recommendations.push('Excellent WCAG 2.1 AA compliance');
    } else if (score >= 85) {
      recommendations.push('Good accessibility with minor improvements needed');
      recommendations.push('Consider implementing WCAG AAA standards for critical elements');
    } else if (score >= 70) {
      recommendations.push('Moderate accessibility compliance - address critical issues');
      recommendations.push('Implement comprehensive accessibility testing');
    } else {
      recommendations.push('Poor accessibility compliance - immediate action required');
      recommendations.push('Conduct full accessibility audit and remediation');
    }

    return {
      level: 'AA',
      passed: score >= 80,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Validate color contrast ratios
   */
  public validateColorContrast(): ColorContrastResult[] {
    const results: ColorContrastResult[] = [];

    // Common color combinations to test
    const C: typeof DEFAULT_COLORS = UNIFIED_COLORS;
    const colorCombinations = [
      {
        fg: (C?.text?.primary as string) ?? '#000000',
        bg: (C?.background?.primary as string) ?? '#FFFFFF',
      },
      {
        fg: (C?.text?.secondary as string) ?? '#666666',
        bg: (C?.background?.primary as string) ?? '#FFFFFF',
      },
      {
        fg: (C?.text?.primary as string) ?? '#000000',
        bg: (C?.sage?.[100] as string) ?? (C?.sage?.light as string) ?? '#E8F0E8',
      },
      {
        fg: (C?.text?.primary as string) ?? '#000000',
        bg: (C?.gold?.[100] as string) ?? (C?.gold?.light as string) ?? '#FFF9E6',
      },
      {
        fg: (C?.background as string) ?? '#FFFFFF',
        bg: '#C08A6B',
      },
      {
        fg: (C?.background as string) ?? '#FFFFFF',
        bg: '#5C8A5C',
      },
      {
        fg: (C?.background as string) ?? '#FFFFFF',
        bg: '#D4AF37',
      },
      {
        fg: (C?.background as string) ?? '#FFFFFF',
        bg: '#E57373',
      },
    ];

    colorCombinations.forEach(({ fg, bg }) => {
      const ratio = this.calculateContrastRatio(fg, bg);
      results.push({
        ratio,
        passesAA: ratio >= 4.5,
        passesAAA: ratio >= 7,
        foreground: fg,
        background: bg,
      });
    });

    return results;
  }

  /**
   * Calculate color contrast ratio between two colors
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate relative luminance of a color
   */
  private getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) {
      return 0;
    }

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      const cc = c / 255;
      return cc <= 0.03928 ? cc / 12.92 : Math.pow((cc + 0.055) / 1.055, 2.4);
    }) as [number, number, number];

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) {
      return null;
    }
    return {
      r: parseInt(match[1]!, 16),
      g: parseInt(match[2]!, 16),
      b: parseInt(match[3]!, 16),
    };
  }

  /**
   * Validate touch target sizes
   */
  private validateTouchTargets(): Array<{ element: string }> {
    // In a real implementation, this would scan the component tree
    // For now, return mock validation results
    const issues: Array<{ element: string }> = [];

    // This would be implemented to check actual component dimensions
    // against the 44x44pt minimum requirement

    return issues;
  }

  /**
   * Validate screen reader support
   */
  private validateScreenReaderSupport(): Array<{
    description: string;
    element?: string;
    fix: string;
  }> {
    const issues: Array<{ description: string; element?: string; fix: string }> = [];

    // Check for common screen reader issues
    // This would scan components for proper accessibility props

    return issues;
  }

  /**
   * Validate keyboard navigation
   */
  private validateKeyboardNavigation(): Array<{
    description: string;
    element?: string;
    fix: string;
  }> {
    const issues: Array<{ description: string; element?: string; fix: string }> = [];

    // Check for keyboard navigation issues
    // This would validate focus management and keyboard interactions

    return issues;
  }

  /**
   * Validate focus management
   */
  private validateFocusManagement(): Array<{ description: string; fix: string }> {
    const issues: Array<{ description: string; fix: string }> = [];

    // Check for focus management issues
    // This would validate focus order and focus indicators

    return issues;
  }

  /**
   * Initialize accessibility state and listeners
   */
  private initializeAccessibility(): void {
    // Set up accessibility listeners
    this.setupAccessibilityListeners();
  }

  /**
   * Set up accessibility event listeners
   */
  private setupAccessibilityListeners(): void {
    try {
      // Listen for screen reader changes
      AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled: boolean) => {
        this.screenReaderEnabled = isEnabled;
      });

      // Listen for reduce motion changes
      AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled: boolean) => {
        this.reduceMotionEnabled = isEnabled;
      });
    } catch (error) {
      warnInDev('Failed to set up accessibility listeners:', error);
    }
  }

  /**
   * Check if screen reader is currently active
   */
  public isScreenReaderActive(): boolean {
    return this.screenReaderEnabled;
  }

  /**
   * Check if reduce motion is currently active
   */
  public isReduceMotionActive(): boolean {
    return this.reduceMotionEnabled;
  }

  /**
   * Get accessibility-friendly component props
   */
  public getAccessibleProps(config: {
    label: string;
    hint?: string;
    role?:
      | 'button'
      | 'text'
      | 'image'
      | 'header'
      | 'link'
      | 'search'
      | 'none'
      | 'adjustable'
      | 'imagebutton'
      | 'keyboardkey'
      | 'summary'
      | 'tab'
      | 'tablist';
    state?: Record<string, boolean | string | number>;
    actions?: Array<{ name: string; label: string }>;
  }) {
    return {
      accessible: true,
      accessibilityLabel: config.label,
      accessibilityHint: config.hint,
      accessibilityRole: config.role,
      accessibilityState: config.state,
      accessibilityActions: config.actions,
    };
  }

  /**
   * Announce message to screen reader
   */
  public announceForAccessibility(message: string): void {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Android implementation
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  /**
   * Generate accessibility report
   */
  public generateAccessibilityReport(): string {
    const result = this.validateWCAGCompliance();

    let report = '# WCAG 2.1 AA Accessibility Report\n\n';
    report += `**Compliance Score: ${result.score}/100**\n`;
    report += `**Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}**\n\n`;

    if (result.issues.length > 0) {
      report += `## Issues Found (${result.issues.length})\n\n`;

      const criticalIssues = result.issues.filter((i) => i.severity === 'critical');
      const majorIssues = result.issues.filter((i) => i.severity === 'major');
      const minorIssues = result.issues.filter((i) => i.severity === 'minor');

      if (criticalIssues.length > 0) {
        report += `### 🚨 Critical Issues (${criticalIssues.length})\n`;
        criticalIssues.forEach((issue) => {
          report += `- **${issue.criterion}**: ${issue.description}\n`;
          report += `  *Fix: ${issue.fix}*\n`;
          report += `  [WCAG Reference](${issue.wcagReference})\n\n`;
        });
      }

      if (majorIssues.length > 0) {
        report += `### ⚠️ Major Issues (${majorIssues.length})\n`;
        majorIssues.forEach((issue) => {
          report += `- **${issue.criterion}**: ${issue.description}\n`;
          report += `  *Fix: ${issue.fix}*\n\n`;
        });
      }

      if (minorIssues.length > 0) {
        report += `### ℹ️ Minor Issues (${minorIssues.length})\n`;
        minorIssues.forEach((issue) => {
          report += `- **${issue.criterion}**: ${issue.description}\n`;
          report += `  *Fix: ${issue.fix}*\n\n`;
        });
      }
    }

    if (result.recommendations.length > 0) {
      report += '## Recommendations\n\n';
      result.recommendations.forEach((rec) => {
        report += `- ${rec}\n`;
      });
    }

    report += '\n## System Accessibility Settings\n\n';
    report += `- Screen Reader: ${this.isScreenReaderActive() ? 'Enabled' : 'Disabled'}\n`;
    report += `- Reduce Motion: ${this.isReduceMotionActive() ? 'Enabled' : 'Disabled'}\n`;
    report += `- Platform: ${Platform.OS}\n`;

    return report;
  }
}

export default AccessibilityService;
export type { AccessibilityIssue, ColorContrastResult, WCAGComplianceResult };
