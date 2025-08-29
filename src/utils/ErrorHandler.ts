// Error Handler - Comprehensive error management system
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { logInDev } from './consoleSuppress';
import { secureStorage } from './secureStorage';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
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
  SYSTEM = 'system', // legacy tests expect SYSTEM
  UNKNOWN = 'unknown',
}

/**
 * Error context interface
 */
export interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  fieldName?: string; // for validation errors
  password?: string; // for sensitive data redaction
  token?: string; // for sensitive data redaction
  apiKey?: string; // for sensitive data redaction
  email?: string; // for user identification
  timestamp: number;
  platform: string;
  version?: string;
  additionalData?: Record<string, string | number | boolean | null>;
}

/**
 * Structured error interface
 */
export interface AppError {
  id: string;
  code?: string; // legacy alias
  message: string;
  userMessage: string;
  category: ErrorCategory;
  type?: string; // legacy alias (tests may expect .type)
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: Error;
  stack?: string;
  isRecoverable: boolean;
  retryable: boolean;
  reportable: boolean;
  recoveryStrategies?: RecoveryStrategy[]; // legacy
  accessibilityLabel?: string;
  accessibilityHint?: string;
  timestamp?: number; // legacy expectation
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
  NONE = 'none',
  // Legacy / extended strategies expected by tests
  REFRESH_COMPONENT = 'refresh_component',
  CLEAR_CACHE = 'clear_cache',
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
  // Legacy flags used in tests
  wellnessMode?: boolean;
  accessibilityMode?: boolean;
  // Added for legacy test expectations
  maxQueueSize?: number; // default 200
  throttleWindow?: number; // ms window for throttling, default 10000
}

/**
 * Default error messages for different categories
 */
const DEFAULT_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]:
    'Unable to connect. Please check your internet connection and try again.',
  [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
  [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
  [ErrorCategory.PERMISSION]: 'Permission denied. Please check your account permissions.',
  [ErrorCategory.STORAGE]: 'Unable to save data. Please try again.',
  [ErrorCategory.AI_SERVICE]: 'AI service is temporarily unavailable. Please try again later.',
  [ErrorCategory.IMAGE_PROCESSING]: 'Unable to process image. Please try with a different image.',
  [ErrorCategory.DATABASE]: 'Database error occurred. Please try again.',
  [ErrorCategory.UI]: 'Something went wrong. Please refresh and try again.',
  [ErrorCategory.SYSTEM]: 'A system error occurred. Please restart the app.',
  [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Wellness-focused error messages for AYNAMODA
 */
const WELLNESS_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]:
    "Take a moment to breathe. Check your connection and we'll try again together.",
  [ErrorCategory.AUTHENTICATION]:
    "Let's get you back on track. Please sign in again to continue your journey.",
  [ErrorCategory.VALIDATION]: 'Almost there! Please review your information and try once more.',
  [ErrorCategory.PERMISSION]:
    'We need a little more access to help you. Please check your permissions.',
  [ErrorCategory.STORAGE]: "Your data is important to us. Let's try saving again.",
  [ErrorCategory.AI_SERVICE]:
    'Our AI stylist is taking a quick break. Please try again in a moment.',
  [ErrorCategory.IMAGE_PROCESSING]:
    'This image needs a different approach. Try another one that speaks to you.',
  [ErrorCategory.DATABASE]: "We're organizing things behind the scenes. Please give us a moment.",
  [ErrorCategory.UI]:
    "Don't worry, something unexpected happened. We're here to help - let's refresh and start fresh.",
  [ErrorCategory.SYSTEM]: 'The system needs a moment. Please restart or try again shortly.',
  [ErrorCategory.UNKNOWN]:
    "Don't worry, every journey has bumps. We're here to help you try again with a clear mind.",
};

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private static instance: ErrorHandler | null = null; // Singleton instance (legacy)
  private config: ErrorHandlerConfig;
  private errorQueue: AppError[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private listeners: Set<(error: AppError) => void> = new Set();
  private lastLogged: Map<string, number> = new Map();
  private recoveryRegistry: Map<
    RecoveryStrategy | string,
    (error: AppError) => Promise<void> | void
  > = new Map();
  private customHandlers: Map<ErrorCategory, (error: AppError) => AppError> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: true,
      enableUserFeedback: true,
      maxRetries: 3,
      retryDelay: 1000,
      maxQueueSize: 200,
      throttleWindow: 10000,
      ...config,
    };

    // Register default recovery strategies
    this.registerDefaultRecoveryStrategies();
  }

  /** Legacy singleton accessor expected by tests */
  public static getInstance(): ErrorHandler {
    if (!this.instance) {
      this.instance = new ErrorHandler();
    }
    return this.instance;
  }

  /** Expose config (legacy tests) */
  public getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }

  /** Update config with additional flags */
  public updateConfig(partial: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  /**
   * Create a structured error from various input types
   */
  /**
   * Legacy-compatible createError signature (tests pass: code, message, severity, category, context)
   * For backward compat we allow both (error, category, severity, context) new style & legacy order.
   */
  // Unified signature to satisfy ESLint no-dupe-class-members while retaining overload behavior
  public createError(
    arg1: unknown,
    arg2?: unknown,
    arg3?: unknown,
    arg4?: unknown,
    arg5?: unknown,
  ): AppError & { code: string; recoveryStrategies: RecoveryStrategy[] } {
    const parsedArgs = this.parseCreateErrorArgs(arg1, arg2, arg3, arg4, arg5);
    const errorId = this.generateErrorId();
    const timestamp = Date.now();
    const orig = new Error(parsedArgs.message || 'Unknown error');

    const safeContext = this.createSafeContext(parsedArgs.context, timestamp);
    const cat = parsedArgs.category || ErrorCategory.UNKNOWN;
    const sev = parsedArgs.severity || ErrorSeverity.MEDIUM;
    const userMessage = WELLNESS_ERROR_MESSAGES[cat] || DEFAULT_ERROR_MESSAGES[cat];
    const sanitizedMessage = this.sanitizeMessage(parsedArgs.message || 'Unknown error');
    const recoveryStrategies = this.getRecoveryStrategiesForCategory(cat);

    const appError: AppError & { code: string; recoveryStrategies: RecoveryStrategy[] } = {
      id: errorId,
      code: parsedArgs.code || errorId,
      message: sanitizedMessage,
      userMessage,
      category: cat,
      severity: sev,
      context: safeContext,
      originalError: orig,
      stack: orig.stack,
      isRecoverable: true,
      retryable: cat === ErrorCategory.NETWORK,
      reportable: sev !== ErrorSeverity.LOW,
      recoveryStrategies,
      timestamp,
    };

    this.addAccessibilityInfo(appError, safeContext);
    return appError;
  }

  /**
   * Parse createError arguments to handle both legacy and new signatures
   */
  private parseCreateErrorArgs(
    arg1: unknown,
    arg2?: unknown,
    arg3?: unknown,
    arg4?: unknown,
    arg5?: unknown,
  ): {
    code?: string;
    message?: string;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    context?: Partial<ErrorContext>;
  } {
    // Detect legacy signature by primitive ordering
    if (
      typeof arg1 === 'string' &&
      typeof arg2 === 'string' &&
      Object.values(ErrorSeverity).includes(arg3 as ErrorSeverity)
    ) {
      return {
        code: arg1,
        message: arg2,
        severity: arg3 as ErrorSeverity,
        category: arg4 as ErrorCategory | undefined,
        context: arg5 as Partial<ErrorContext> | undefined,
      };
    }

    // New style: (error, category, severity, context)
    const error = arg1;
    let message: string;
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    return {
      message,
      category: arg2 as ErrorCategory | undefined,
      severity: arg3 as ErrorSeverity | undefined,
      context: arg4 as Partial<ErrorContext> | undefined,
    };
  }

  /**
   * Create safe context with redacted sensitive information
   */
  private createSafeContext(
    context: Partial<ErrorContext> | undefined,
    timestamp: number,
  ): ErrorContext {
    const baseContext: ErrorContext = {
      timestamp,
      platform: Platform.OS,
      version: '1.0.0',
      ...(context || {}),
    };

    // Redact sensitive keys in context directly
    if (baseContext.password) {
      baseContext.password = '[REDACTED]';
    }
    if (baseContext.token) {
      baseContext.token = '[REDACTED]';
    }
    if (baseContext.apiKey) {
      baseContext.apiKey = '[REDACTED]';
    }

    // Redact sensitive keys in additionalData if present
    if (baseContext.additionalData) {
      ['password', 'token', 'apiKey'].forEach((k) => {
        if (k in baseContext.additionalData!) {
          baseContext.additionalData![k] = '[REDACTED]';
        }
      });
    }

    return baseContext;
  }

  /**
   * Get recovery strategies for a specific category
   */
  private getRecoveryStrategiesForCategory(category: ErrorCategory): RecoveryStrategy[] {
    const recoveryStrategies: RecoveryStrategy[] = [];
    if (category === ErrorCategory.NETWORK) {
      recoveryStrategies.push(RecoveryStrategy.RETRY);
    }
    if (category === ErrorCategory.UI) {
      recoveryStrategies.push(RecoveryStrategy.REFRESH_COMPONENT);
    }
    return recoveryStrategies;
  }

  /**
   * Add accessibility information to error if accessibility mode is enabled
   */
  private addAccessibilityInfo(appError: AppError, safeContext: ErrorContext): void {
    if (this.config.accessibilityMode) {
      let accessibilityLabel = appError.message;
      if (safeContext.fieldName) {
        accessibilityLabel += ` for ${safeContext.fieldName}`;
      }
      appError.accessibilityLabel = accessibilityLabel;
      appError.accessibilityHint = `Error category ${appError.category}`;
    }
  }

  /**
   * Handle an error with full processing
   */
  public async handleError(
    error: Error | string | AppError,
    category?: ErrorCategory,
    severity?: ErrorSeverity,
    context?: Partial<ErrorContext>,
  ): Promise<AppError> {
    let appError = this.isAppError(error)
      ? error
      : this.createError(error, category, severity, context);

    // Apply custom handler if available
    const customHandler = this.customHandlers.get(appError.category);
    if (customHandler) {
      const handledError = customHandler(appError);
      if (handledError) {
        appError = handledError;
      }
    }

    // Ensure appError is valid before proceeding
    if (!appError) {
      throw new Error('Failed to create or process error');
    }

    // Throttle duplicate codes (1s window)
    const now = Date.now();
    const code = appError.code || appError.id || 'unknown';
    const last = this.lastLogged.get(code) || 0;
    if (now - last > 1000) {
      if (this.config.enableLogging) {
        this.logError(appError);
      }
      this.lastLogged.set(code, now);
    }

    this.errorQueue.push(appError);
    // Enforce max queue size
    if (this.config.maxQueueSize && this.errorQueue.length > this.config.maxQueueSize) {
      this.errorQueue.splice(0, this.errorQueue.length - this.config.maxQueueSize);
    }
    this.notifyListeners(appError);
    try {
      await secureStorage.initialize();
      await secureStorage.setItem(
        'error_logs',
        JSON.stringify(this.errorQueue.map((e) => e.code ?? e.id)),
      );
    } catch {
      // Silently fail if storage is not available
    }
    if (this.config.enableReporting && appError.reportable) {
      this.reportError(appError);
    }
    return appError;
  }

  /** Retry mechanism (exponential backoff with optional jitter) */
  public async retryOperation<T>(
    operation: () => Promise<T>,
    options: { maxAttempts?: number; baseDelay?: number; jitter?: boolean } = {},
  ): Promise<T> {
    const { maxAttempts = 3, baseDelay = 100, jitter = true } = options;
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        return await operation();
      } catch (e) {
        attempt += 1;
        if (attempt >= maxAttempts) {
          throw e;
        }
        let delay = baseDelay * Math.pow(2, attempt - 1);
        if (jitter) {
          delay *= 0.5 + Math.random() * 0.5;
        }
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  /** Legacy methods expected in tests */
  public getErrorQueue(): AppError[] {
    return [...this.errorQueue];
  }
  public getErrorStatistics(): {
    total: number;
    recentErrors: string[];
    errorCounts: Record<string, number>;
    totalErrors: number;
  } {
    const errorCounts: Record<string, number> = {};
    this.errorQueue.forEach((error) => {
      const key = error.code || error.id;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return {
      total: this.errorQueue.length,
      totalErrors: this.errorQueue.length,
      recentErrors: this.errorQueue.slice(-10).map((e) => e.code ?? e.id),
      errorCounts,
    };
  }
  public detectErrorPatterns(): { rapidSuccession: string[] } {
    const rapidSuccession: string[] = [];
    const errorCounts: Record<string, number> = {};

    this.errorQueue.forEach((error) => {
      const key = error.code || error.id;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    // Consider errors with 3+ occurrences as rapid succession
    Object.entries(errorCounts).forEach(([code, count]) => {
      if (count >= 3) {
        rapidSuccession.push(code);
      }
    });

    return { rapidSuccession };
  }
  public setCustomHandler(category: ErrorCategory, handler: (error: AppError) => AppError) {
    this.customHandlers.set(category, handler);
  }
  public categorizeError(error: unknown): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error as any;

    const { category, severity } = this.determineErrorCategoryAndSeverity(errorMessage, errorObj);
    return this.createError(error, category, severity, {}) as AppError;
  }

  /**
   * Determine error category and severity based on error message and properties
   */
  private determineErrorCategoryAndSeverity(
    errorMessage: string,
    errorObj: any,
  ): { category: ErrorCategory; severity: ErrorSeverity } {
    if (this.isDatabaseError(errorMessage)) {
      return { category: ErrorCategory.DATABASE, severity: ErrorSeverity.CRITICAL };
    }

    if (this.isNetworkError(errorMessage, errorObj)) {
      return { category: ErrorCategory.NETWORK, severity: ErrorSeverity.MEDIUM };
    }

    if (this.isAuthenticationError(errorMessage, errorObj)) {
      return { category: ErrorCategory.AUTHENTICATION, severity: ErrorSeverity.HIGH };
    }

    if (this.isValidationError(errorMessage, errorObj)) {
      return { category: ErrorCategory.VALIDATION, severity: ErrorSeverity.LOW };
    }

    if (this.isCacheError(errorMessage)) {
      return { category: ErrorCategory.STORAGE, severity: ErrorSeverity.LOW };
    }

    if (this.isAIServiceError(errorMessage)) {
      return { category: ErrorCategory.AI_SERVICE, severity: ErrorSeverity.MEDIUM };
    }

    if (this.isImageProcessingError(errorMessage)) {
      return { category: ErrorCategory.IMAGE_PROCESSING, severity: ErrorSeverity.MEDIUM };
    }

    return { category: ErrorCategory.UNKNOWN, severity: ErrorSeverity.MEDIUM };
  }

  /**
   * Check if error is a database error
   */
  private isDatabaseError(errorMessage: string): boolean {
    return (
      errorMessage.includes('Database connection lost') ||
      errorMessage.includes('Database connection failed') ||
      errorMessage.includes('Connection lost') ||
      errorMessage.includes('database') ||
      errorMessage.includes('Database')
    );
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(errorMessage: string, errorObj: any): boolean {
    return (
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('Connection timeout') ||
      errorMessage.includes('Network timeout') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('DNS resolution failed') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('fetch') ||
      errorObj?.name === 'TimeoutError' ||
      (errorObj?.status >= 400 && errorObj?.status < 600) ||
      (errorObj?.code && ['NETWORK_ERROR', 'ECONNREFUSED', 'ETIMEDOUT'].includes(errorObj.code))
    );
  }

  /**
   * Check if error is an authentication error
   */
  private isAuthenticationError(errorMessage: string, errorObj: any): boolean {
    return (
      errorMessage.includes('Invalid credentials') ||
      errorMessage.includes('Token expired') ||
      errorMessage.includes('Unauthorized access') ||
      errorMessage.includes('Authentication failed') ||
      errorObj?.status === 401 ||
      errorObj?.status === 403
    );
  }

  /**
   * Check if error is a validation error
   */
  private isValidationError(errorMessage: string, errorObj: any): boolean {
    return (
      errorMessage.includes('Required field missing') ||
      errorMessage.includes('Invalid email format') ||
      errorMessage.includes('Password too short') ||
      errorMessage.includes('Validation failed') ||
      errorObj?.status === 400
    );
  }

  /**
   * Check if error is a cache error
   */
  private isCacheError(errorMessage: string): boolean {
    return (
      errorMessage.includes('Cache miss') ||
      errorMessage.includes('cache') ||
      errorMessage.includes('Cache')
    );
  }

  /**
   * Check if error is an AI service error
   */
  private isAIServiceError(errorMessage: string): boolean {
    return (
      errorMessage.includes('AI service') ||
      errorMessage.includes('OpenAI') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('quota exceeded')
    );
  }

  /**
   * Check if error is an image processing error
   */
  private isImageProcessingError(errorMessage: string): boolean {
    return (
      errorMessage.includes('Image upload failed') ||
      errorMessage.includes('image') ||
      errorMessage.includes('Image processing') ||
      errorMessage.includes('Invalid image format')
    );
  }
  public registerRecoveryStrategy(
    strategy: RecoveryStrategy | string,
    handler: (context: any) => Promise<void> | void,
  ) {
    this.recoveryRegistry.set(strategy, handler);
  }

  private registerDefaultRecoveryStrategies() {
    // REFRESH_COMPONENT strategy
    this.registerRecoveryStrategy(RecoveryStrategy.REFRESH_COMPONENT, async (context: any) => {
      if (context?.component?.forceUpdate) {
        context.component.forceUpdate();
      }
    });

    // CLEAR_CACHE strategy
    this.registerRecoveryStrategy(RecoveryStrategy.CLEAR_CACHE, async (context: any) => {
      if (context?.cacheKeys && Array.isArray(context.cacheKeys)) {
        for (const key of context.cacheKeys) {
          await AsyncStorage.removeItem(key);
        }
      }
    });

    // LOGOUT strategy
    this.registerRecoveryStrategy(RecoveryStrategy.LOGOUT, async (context: any) => {
      if (context?.authService?.logout) {
        await context.authService.logout();
      }
    });
  }
  public async executeRecoveryAction(strategy: RecoveryStrategy | string, context: any) {
    const handler = this.recoveryRegistry.get(strategy);
    if (handler) {
      await handler(context);
    }
  }

  /**
   * Retry a failed operation
   */
  public async retry<T>(
    operation: () => Promise<T>,
    errorId: string,
    maxRetries?: number,
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
      await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * (attempts + 1)));

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
        primary: true,
      });
    }

    // Category-specific actions
    switch (error.category) {
      case ErrorCategory.NETWORK:
        actions.push({
          strategy: RecoveryStrategy.REFRESH,
          label: 'Refresh',
          action: () => {},
        });
        break;

      case ErrorCategory.AUTHENTICATION:
        actions.push({
          strategy: RecoveryStrategy.LOGOUT,
          label: 'Sign In Again',
          action: () => {},
        });
        break;

      case ErrorCategory.PERMISSION:
        actions.push({
          strategy: RecoveryStrategy.NAVIGATE,
          label: 'Check Settings',
          action: () => {},
        });
        break;
    }

    // Always provide a fallback action
    if (actions.length === 0) {
      actions.push({
        strategy: RecoveryStrategy.FALLBACK,
        label: 'Continue',
        action: () => {},
      });
    }

    return actions;
  }

  /**
   * Clear error queue
   */
  public clearErrors(): void {
    this.errorQueue = [];
    this.lastLogged.clear(); // Clear throttling map for tests
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

  // (duplicate updateConfig removed - legacy method defined earlier)

  // Private methods

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isAppError(error: unknown): error is AppError {
    return (
      !!error &&
      typeof error === 'object' &&
      'id' in error &&
      'category' in error &&
      // basic shape check
      typeof (error as { id: unknown }).id === 'string'
    );
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
    const severityLabel = error.severity.toUpperCase();
    const logMessage = `[${severityLabel} ERROR]`;

    console[logLevel](logMessage, {
      id: error.id,
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      stack: error.stack,
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

  private sanitizeMessage(message: string): string {
    let sanitized = message;

    // Remove common sensitive patterns
    const sensitivePatterns = [
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, // emails
      /\bsecret\w*\b/gi, // words starting with 'secret'
      /\btoken\w*\b/gi, // words starting with 'token'
      /\bbearer[\s-]\w+/gi, // bearer tokens
      /\bapi[\s-]?key\w*/gi, // api keys
      /\bpassword\w*/gi, // passwords
    ];

    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  private notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (listenerError) {
        // Error in error listener
      }
    });
  }

  private reportError(error: AppError): void {
    if (!this.config.reportingEndpoint) {
      return;
    }
    try {
      // Error reporting implementation - currently logs for development
      // Production implementation would send to monitoring service
      logInDev('Reporting error:', error.id);
    } catch {
      // Swallow reporting errors
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
    errorHandler.handleError(error, ErrorCategory.UNKNOWN, ErrorSeverity.CRITICAL, context),
};

export { errorHandler };
export default errorHandler;
