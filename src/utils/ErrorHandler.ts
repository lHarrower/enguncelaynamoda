// Error Handler - Comprehensive error management system
import { Platform } from 'react-native';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  AI_SERVICE = 'ai_service',
  IMAGE_PROCESSING = 'image_processing',
  DATABASE = 'database',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

/**
 * Error context interface
 */
export interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  timestamp: number;
  platform: string;
  version?: string;
  additionalData?: Record<string, any>;
}

/**
 * Structured error interface
 */
export interface AppError {
  id: string;
  message: string;
  userMessage: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: Error;
  stack?: string;
  isRecoverable: boolean;
  retryable: boolean;
  reportable: boolean;
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  REFRESH = 'refresh',
  NAVIGATE = 'navigate',
  LOGOUT = 'logout',
  NONE = 'none'
}

/**
 * Recovery action interface
 */
export interface RecoveryAction {
  strategy: RecoveryStrategy;
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  enableUserFeedback: boolean;
  maxRetries: number;
  retryDelay: number;
  reportingEndpoint?: string;
}

/**
 * Default error messages for different categories
 */
const DEFAULT_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Unable to connect. Please check your internet connection and try again.',
  [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
  [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
  [ErrorCategory.PERMISSION]: 'Permission denied. Please check your account permissions.',
  [ErrorCategory.STORAGE]: 'Unable to save data. Please try again.',
  [ErrorCategory.AI_SERVICE]: 'AI service is temporarily unavailable. Please try again later.',
  [ErrorCategory.IMAGE_PROCESSING]: 'Unable to process image. Please try with a different image.',
  [ErrorCategory.DATABASE]: 'Database error occurred. Please try again.',
  [ErrorCategory.UI]: 'Something went wrong. Please refresh and try again.',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Wellness-focused error messages for AYNAMODA
 */
const WELLNESS_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]: 'Take a moment to breathe. Check your connection and we\'ll try again together.',
  [ErrorCategory.AUTHENTICATION]: 'Let\'s get you back on track. Please sign in again to continue your journey.',
  [ErrorCategory.VALIDATION]: 'Almost there! Please review your information and try once more.',
  [ErrorCategory.PERMISSION]: 'We need a little more access to help you. Please check your permissions.',
  [ErrorCategory.STORAGE]: 'Your data is important to us. Let\'s try saving again.',
  [ErrorCategory.AI_SERVICE]: 'Our AI stylist is taking a quick break. Please try again in a moment.',
  [ErrorCategory.IMAGE_PROCESSING]: 'This image needs a different approach. Try another one that speaks to you.',
  [ErrorCategory.DATABASE]: 'We\'re organizing things behind the scenes. Please give us a moment.',
  [ErrorCategory.UI]: 'Something unexpected happened. Let\'s refresh and start fresh.',
  [ErrorCategory.UNKNOWN]: 'Every journey has bumps. Let\'s try again with a clear mind.'
};

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorQueue: AppError[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private listeners: Set<(error: AppError) => void> = new Set();
  
  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: true,
      enableUserFeedback: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }
  
  /**
   * Create a structured error from various input types
   */
  public createError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    options: {
      userMessage?: string;
      isRecoverable?: boolean;
      retryable?: boolean;
      reportable?: boolean;
    } = {}
  ): AppError {
    const errorId = this.generateErrorId();
    const timestamp = Date.now();
    
    const originalError = error instanceof Error ? error : new Error(error);
    const message = originalError.message || 'Unknown error';
    
    const userMessage = options.userMessage || 
      WELLNESS_ERROR_MESSAGES[category] || 
      DEFAULT_ERROR_MESSAGES[category];
    
    const fullContext: ErrorContext = {
      timestamp,
      platform: Platform.OS,
      version: '1.0.0', // Should come from app config
      ...context
    };
    
    return {
      id: errorId,
      message,
      userMessage,
      category,
      severity,
      context: fullContext,
      originalError,
      stack: originalError.stack,
      isRecoverable: options.isRecoverable ?? this.isRecoverableByDefault(category),
      retryable: options.retryable ?? this.isRetryableByDefault(category),
      reportable: options.reportable ?? this.isReportableByDefault(severity)
    };
  }
  
  /**
   * Handle an error with full processing
   */
  public async handleError(
    error: Error | string | AppError,
    category?: ErrorCategory,
    severity?: ErrorSeverity,
    context?: Partial<ErrorContext>
  ): Promise<AppError> {
    let appError: AppError;
    
    if (this.isAppError(error)) {
      appError = error;
    } else {
      appError = this.createError(
        error,
        category || ErrorCategory.UNKNOWN,
        severity || ErrorSeverity.MEDIUM,
        context
      );
    }
    
    // Log the error
    if (this.config.enableLogging) {
      this.logError(appError);
    }
    
    // Add to error queue
    this.errorQueue.push(appError);
    
    // Notify listeners
    this.notifyListeners(appError);
    
    // Report if needed
    if (this.config.enableReporting && appError.reportable) {
      await this.reportError(appError);
    }
    
    return appError;
  }
  
  /**
   * Retry a failed operation
   */
  public async retry<T>(
    operation: () => Promise<T>,
    errorId: string,
    maxRetries?: number
  ): Promise<T> {
    const attempts = this.retryAttempts.get(errorId) || 0;
    const maxAttempts = maxRetries || this.config.maxRetries;
    
    if (attempts >= maxAttempts) {
      throw new Error(`Max retry attempts (${maxAttempts}) exceeded for operation ${errorId}`);
    }
    
    try {
      const result = await operation();
      this.retryAttempts.delete(errorId); // Clear on success
      return result;
    } catch (error) {
      this.retryAttempts.set(errorId, attempts + 1);
      
      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, this.config.retryDelay * (attempts + 1))
      );
      
      return this.retry(operation, errorId, maxRetries);
    }
  }
  
  /**
   * Get recovery actions for an error
   */
  public getRecoveryActions(error: AppError): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    
    // Retry action for retryable errors
    if (error.retryable) {
      actions.push({
        strategy: RecoveryStrategy.RETRY,
        label: 'Try Again',
        action: () => this.retry(() => Promise.resolve(), error.id),
        primary: true
      });
    }
    
    // Category-specific actions
    switch (error.category) {
      case ErrorCategory.NETWORK:
        actions.push({
          strategy: RecoveryStrategy.REFRESH,
          label: 'Refresh',
          action: () => {}
        });
        break;
        
      case ErrorCategory.AUTHENTICATION:
        actions.push({
          strategy: RecoveryStrategy.LOGOUT,
          label: 'Sign In Again',
          action: () => {}
        });
        break;
        
      case ErrorCategory.PERMISSION:
        actions.push({
          strategy: RecoveryStrategy.NAVIGATE,
          label: 'Check Settings',
          action: () => {}
        });
        break;
    }
    
    // Always provide a fallback action
    if (actions.length === 0) {
      actions.push({
        strategy: RecoveryStrategy.FALLBACK,
        label: 'Continue',
        action: () => {}
      });
    }
    
    return actions;
  }
  
  /**
   * Clear error queue
   */
  public clearErrors(): void {
    this.errorQueue = [];
  }
  
  /**
   * Get recent errors
   */
  public getRecentErrors(limit: number = 10): AppError[] {
    return this.errorQueue.slice(-limit);
  }
  
  /**
   * Add error listener
   */
  public addListener(listener: (error: AppError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Private methods
  
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'id' in error && 'category' in error;
  }
  
  private isRecoverableByDefault(category: ErrorCategory): boolean {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.AI_SERVICE:
      case ErrorCategory.IMAGE_PROCESSING:
        return true;
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.PERMISSION:
        return false;
      default:
        return true;
    }
  }
  
  private isRetryableByDefault(category: ErrorCategory): boolean {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.AI_SERVICE:
      case ErrorCategory.DATABASE:
        return true;
      case ErrorCategory.VALIDATION:
      case ErrorCategory.PERMISSION:
        return false;
      default:
        return true;
    }
  }
  
  private isReportableByDefault(severity: ErrorSeverity): boolean {
    return severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL;
  }
  
  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.category.toUpperCase()}] ${error.message}`;
    
    console[logLevel](logMessage, {
      id: error.id,
      severity: error.severity,
      context: error.context,
      stack: error.stack
    });
  }
  
  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'warn';
    }
  }
  
  private notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        // Error in error listener
      }
    });
  }
  
  private async reportError(error: AppError): Promise<void> {
    if (!this.config.reportingEndpoint) {
      return;
    }
    
    try {
      // In a real implementation, you would send this to your error reporting service
      // e.g., Sentry, Bugsnag, or custom endpoint
      // Reporting error to endpoint
      
      // Example implementation:
      // await fetch(this.config.reportingEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     error: {
      //       id: error.id,
      //       message: error.message,
      //       category: error.category,
      //       severity: error.severity,
      //       context: error.context,
      //       stack: error.stack
      //     }
      //   })
      // });
    } catch (reportingError) {
      // Failed to report error
    }
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

/**
 * Convenience functions for common error scenarios
 */
export const ErrorUtils = {
  // Network errors
  networkError: (error: Error, context?: Partial<ErrorContext>) => 
    errorHandler.handleError(error, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, context),
  
  // Authentication errors
  authError: (message: string, context?: Partial<ErrorContext>) => 
    errorHandler.handleError(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, context),
  
  // Validation errors
  validationError: (message: string, context?: Partial<ErrorContext>) => 
    errorHandler.handleError(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, context),
  
  // AI service errors
  aiServiceError: (error: Error, context?: Partial<ErrorContext>) => 
    errorHandler.handleError(error, ErrorCategory.AI_SERVICE, ErrorSeverity.MEDIUM, context),
  
  // Image processing errors
  imageError: (error: Error, context?: Partial<ErrorContext>) => 
    errorHandler.handleError(error, ErrorCategory.IMAGE_PROCESSING, ErrorSeverity.MEDIUM, context),
  
  // Critical errors
  criticalError: (error: Error, context?: Partial<ErrorContext>) => 
    errorHandler.handleError(error, ErrorCategory.UNKNOWN, ErrorSeverity.CRITICAL, context)
};

export { errorHandler };
export default errorHandler;