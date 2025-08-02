// Error Reporting Service - Analytics and crash reporting integration
import { AppError, ErrorSeverity, ErrorCategory } from '../utils/ErrorHandler';

/**
 * Error Report Interface
 */
export interface ErrorReport {
  id: string;
  timestamp: number;
  error: AppError;
  deviceInfo: DeviceInfo;
  userInfo: UserInfo;
  appState: AppState;
  breadcrumbs: Breadcrumb[];
  stackTrace?: string;
  screenshot?: string;
  logs: LogEntry[];
}

/**
 * Device Information
 */
export interface DeviceInfo {
  platform: 'ios' | 'android';
  version: string;
  model: string;
  manufacturer?: string;
  screenSize: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  networkType: string;
  batteryLevel?: number;
  memoryUsage?: number;
  storageAvailable?: number;
}

/**
 * User Information (anonymized)
 */
export interface UserInfo {
  userId?: string; // hashed/anonymized
  sessionId: string;
  userAgent?: string;
  locale: string;
  timezone: string;
  isFirstSession: boolean;
  sessionDuration: number;
  previousCrashes: number;
}

/**
 * Application State
 */
export interface AppState {
  currentScreen: string;
  navigationStack: string[];
  isBackground: boolean;
  memoryWarnings: number;
  networkStatus: 'online' | 'offline' | 'poor';
  lastUserAction: string;
  activeFeatures: string[];
}

/**
 * Breadcrumb for error tracking
 */
export interface Breadcrumb {
  timestamp: number;
  category: 'navigation' | 'user_action' | 'network' | 'ui' | 'system';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

/**
 * Log Entry
 */
export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  category: string;
  data?: Record<string, any>;
}

/**
 * Error Reporting Configuration
 */
export interface ErrorReportingConfig {
  enabled: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  maxBreadcrumbs: number;
  maxLogs: number;
  includeScreenshots: boolean;
  includeDeviceInfo: boolean;
  includeUserInfo: boolean;
  samplingRate: number; // 0-1, percentage of errors to report
  blacklistedErrors: string[]; // error types to ignore
  sensitiveDataKeys: string[]; // keys to redact from data
}

/**
 * Default Configuration
 */
const DEFAULT_CONFIG: ErrorReportingConfig = {
  enabled: true,
  maxBreadcrumbs: 50,
  maxLogs: 100,
  includeScreenshots: false, // Privacy-first approach
  includeDeviceInfo: true,
  includeUserInfo: false, // Privacy-first approach
  samplingRate: 1.0,
  blacklistedErrors: [
    'Network request failed',
    'AbortError',
    'TimeoutError'
  ],
  sensitiveDataKeys: [
    'password',
    'token',
    'apiKey',
    'email',
    'phone',
    'address'
  ]
};

/**
 * Error Reporting Service
 */
export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private config: ErrorReportingConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private logs: LogEntry[] = [];
  private sessionId: string;
  private isInitialized = false;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Initialize the error reporting service
   */
  public async initialize(config?: Partial<ErrorReportingConfig>): Promise<void> {
    if (this.isInitialized) return;

    this.config = { ...this.config, ...config };
    
    // Initialize crash reporting SDKs here
    // Example: Crashlytics, Sentry, Bugsnag
    
    this.isInitialized = true;
    this.addBreadcrumb({
      category: 'system',
      message: 'Error reporting initialized',
      level: 'info'
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Report an error
   */
  public async reportError(error: AppError, context?: Record<string, any>): Promise<void> {
    if (!this.config.enabled || !this.shouldReportError(error)) {
      return;
    }

    try {
      const report = await this.createErrorReport(error, context);
      await this.sendReport(report);
      
      this.addBreadcrumb({
        category: 'system',
        message: `Error reported: ${error.code}`,
        level: 'error',
        data: { errorId: report.id }
      });
    } catch (reportingError) {
      console.warn('Failed to report error:', reportingError);
    }
  }

  /**
   * Add breadcrumb
   */
  public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now()
    };

    this.breadcrumbs.push(fullBreadcrumb);
    
    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  /**
   * Add log entry
   */
  public addLog(log: Omit<LogEntry, 'timestamp'>): void {
    const fullLog: LogEntry = {
      ...log,
      timestamp: Date.now()
    };

    this.logs.push(fullLog);
    
    // Keep only the most recent logs
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }
  }

  /**
   * Set user context
   */
  public setUserContext(userId: string, properties?: Record<string, any>): void {
    this.addBreadcrumb({
      category: 'user_action',
      message: 'User context updated',
      level: 'info',
      data: this.sanitizeData({ userId, ...properties })
    });
  }

  /**
   * Track navigation
   */
  public trackNavigation(screenName: string, params?: Record<string, any>): void {
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${screenName}`,
      level: 'info',
      data: this.sanitizeData(params || {})
    });
  }

  /**
   * Track user action
   */
  public trackUserAction(action: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      category: 'user_action',
      message: action,
      level: 'info',
      data: this.sanitizeData(data || {})
    });
  }

  /**
   * Track network request
   */
  public trackNetworkRequest(
    url: string, 
    method: string, 
    statusCode?: number, 
    duration?: number
  ): void {
    this.addBreadcrumb({
      category: 'network',
      message: `${method} ${url}`,
      level: statusCode && statusCode >= 400 ? 'error' : 'info',
      data: {
        method,
        url: this.sanitizeUrl(url),
        statusCode,
        duration
      }
    });
  }

  /**
   * Create error report
   */
  private async createErrorReport(
    error: AppError, 
    context?: Record<string, any>
  ): Promise<ErrorReport> {
    const report: ErrorReport = {
      id: this.generateReportId(),
      timestamp: Date.now(),
      error: this.sanitizeError(error),
      deviceInfo: await this.getDeviceInfo(),
      userInfo: this.getUserInfo(),
      appState: await this.getAppState(),
      breadcrumbs: [...this.breadcrumbs],
      logs: [...this.logs]
    };

    // Add context if provided
    if (context) {
      report.breadcrumbs.push({
        timestamp: Date.now(),
        category: 'system',
        message: 'Error context',
        level: 'info',
        data: this.sanitizeData(context)
      });
    }

    return report;
  }

  /**
   * Send report to analytics service
   */
  private async sendReport(report: ErrorReport): Promise<void> {
    // Implementation would depend on your analytics service
    // Examples: Firebase Crashlytics, Sentry, custom endpoint
    
    if (this.config.apiEndpoint) {
      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify(report)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('Failed to send error report:', error);
        // Store locally for retry
        this.storeReportLocally(report);
      }
    } else {
      // Log to console in development
      console.group('🚨 Error Report');
      console.error('Error:', report.error);
      console.log('Device:', report.deviceInfo);
      console.log('Breadcrumbs:', report.breadcrumbs);
      console.groupEnd();
    }
  }

  /**
   * Store report locally for retry
   */
  private async storeReportLocally(report: ErrorReport): Promise<void> {
    // Implementation would use AsyncStorage or similar
    // to store failed reports for later retry
  }

  /**
   * Check if error should be reported
   */
  private shouldReportError(error: AppError): boolean {
    // Check sampling rate
    if (Math.random() > this.config.samplingRate) {
      return false;
    }

    // Check blacklisted errors
    if (this.config.blacklistedErrors.includes(error.code)) {
      return false;
    }

    // Don't report low severity errors in production
    if (error.severity === ErrorSeverity.LOW && __DEV__ === false) {
      return false;
    }

    return true;
  }

  /**
   * Get device information
   */
  private async getDeviceInfo(): Promise<DeviceInfo> {
    // Implementation would use react-native-device-info or similar
    return {
      platform: 'ios', // Platform.OS
      version: '1.0.0', // DeviceInfo.getVersion()
      model: 'iPhone', // DeviceInfo.getModel()
      screenSize: { width: 375, height: 812 }, // Dimensions.get('screen')
      orientation: 'portrait',
      networkType: 'wifi'
    };
  }

  /**
   * Get user information
   */
  private getUserInfo(): UserInfo {
    return {
      sessionId: this.sessionId,
      locale: 'en-US',
      timezone: 'UTC',
      isFirstSession: false,
      sessionDuration: Date.now() - this.sessionStartTime,
      previousCrashes: 0
    };
  }

  /**
   * Get application state
   */
  private async getAppState(): Promise<AppState> {
    return {
      currentScreen: 'Unknown',
      navigationStack: [],
      isBackground: false,
      memoryWarnings: 0,
      networkStatus: 'online',
      lastUserAction: 'Unknown',
      activeFeatures: []
    };
  }

  /**
   * Sanitize error data
   */
  private sanitizeError(error: AppError): AppError {
    const sanitized = { ...error };
    
    // Remove sensitive data from error context
    if (sanitized.context) {
      sanitized.context = this.sanitizeData(sanitized.context);
    }

    return sanitized;
  }

  /**
   * Sanitize data by removing sensitive keys
   */
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    this.config.sensitiveDataKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitize URL by removing sensitive parameters
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove sensitive query parameters
      this.config.sensitiveDataKeys.forEach(key => {
        urlObj.searchParams.delete(key);
      });
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sessionStartTime = Date.now();
}

/**
 * Convenience functions
 */
export const ErrorReporting = ErrorReportingService.getInstance();

export const reportError = (error: AppError, context?: Record<string, any>) => {
  return ErrorReporting.reportError(error, context);
};

export const addBreadcrumb = (breadcrumb: Omit<Breadcrumb, 'timestamp'>) => {
  return ErrorReporting.addBreadcrumb(breadcrumb);
};

export const trackNavigation = (screenName: string, params?: Record<string, any>) => {
  return ErrorReporting.trackNavigation(screenName, params);
};

export const trackUserAction = (action: string, data?: Record<string, any>) => {
  return ErrorReporting.trackUserAction(action, data);
};

export const trackNetworkRequest = (
  url: string, 
  method: string, 
  statusCode?: number, 
  duration?: number
) => {
  return ErrorReporting.trackNetworkRequest(url, method, statusCode, duration);
};

export default ErrorReportingService;