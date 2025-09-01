// Error Provider - Wrapper for backward compatibility
// Note: This provider now uses the global Zustand store for state management
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';

import { ErrorReporting } from '@/services/ErrorReporting';
import { errorInDev } from '@/utils/consoleSuppress';
import {
  useGlobalError,
  useErrors,
  useErrorReportingEnabled,
  useErrorActions
} from '@/store/globalStore';

import {
  AppError,
  ErrorCategory,
  ErrorHandler,
  errorHandler,
  ErrorSeverity,
  RecoveryAction,
} from '@/utils/ErrorHandler';

/**
 * Error State Interface
 */
export interface ErrorState {
  globalError: AppError | null;
  errors: Record<string, AppError>; // keyed by error ID or context
  isInitialized: boolean;
  config: ErrorConfig;
  statistics: ErrorStatistics;
}

/**
 * Error Configuration
 */
export interface ErrorConfig {
  enableReporting: boolean;
  enableRecovery: boolean;
  enableToasts: boolean;
  enableBoundaries: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxErrorsInMemory: number;
  autoRetryEnabled: boolean;
  hapticFeedbackEnabled: boolean;
}

/**
 * Error Statistics
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recoveredErrors: number;
  sessionStartTime: number;
}

/**
 * Error Actions
 */
type ErrorAction =
  | { type: 'INITIALIZE'; payload: { config: Partial<ErrorConfig> } }
  | { type: 'ADD_ERROR'; payload: { id: string; error: AppError } }
  | { type: 'REMOVE_ERROR'; payload: { id: string } }
  | { type: 'SET_GLOBAL_ERROR'; payload: { error: AppError | null } }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'UPDATE_CONFIG'; payload: { config: Partial<ErrorConfig> } }
  | { type: 'INCREMENT_RECOVERED' }
  | { type: 'UPDATE_STATISTICS'; payload: { error: AppError } };

/**
 * Default Configuration
 */
const DEFAULT_CONFIG: ErrorConfig = {
  enableReporting: true,
  enableRecovery: true,
  enableToasts: true,
  enableBoundaries: true,
  logLevel: __DEV__ ? 'debug' : 'error',
  maxErrorsInMemory: 50,
  autoRetryEnabled: true,
  hapticFeedbackEnabled: true,
};

/**
 * Initial State
 */
// Initial statistics for local state
const initialStatistics: ErrorStatistics = {
  totalErrors: 0,
  errorsByCategory: {
    [ErrorCategory.NETWORK]: 0,
    [ErrorCategory.AUTHENTICATION]: 0,
    [ErrorCategory.PERMISSION]: 0,
    [ErrorCategory.VALIDATION]: 0,
    [ErrorCategory.UI]: 0,
    [ErrorCategory.SYSTEM]: 0,
    [ErrorCategory.AI_SERVICE]: 0,
    [ErrorCategory.IMAGE_PROCESSING]: 0,
    [ErrorCategory.STORAGE]: 0,
    [ErrorCategory.DATABASE]: 0,
    [ErrorCategory.UNKNOWN]: 0,
  },
  errorsBySeverity: {
    [ErrorSeverity.LOW]: 0,
    [ErrorSeverity.MEDIUM]: 0,
    [ErrorSeverity.HIGH]: 0,
    [ErrorSeverity.CRITICAL]: 0,
  },
  recoveredErrors: 0,
  sessionStartTime: Date.now(),
};

/**
 * Error Context
 */
export interface ErrorContextValue {
  // State
  errors: Record<string, AppError>;
  globalError: AppError | null;
  config: ErrorConfig;
  statistics: ErrorStatistics;
  isInitialized: boolean;
  errorHistory: AppError[];
  currentError: AppError | null;

  // Error Management
  reportError: (
    error: AppError | Error,
    context?: string | { component?: string; action?: string },
  ) => void;
  clearError: (id?: string) => void;
  clearAllErrors: () => void;
  setGlobalError: (error: AppError | null) => void;

  // Recovery
  recoverFromError: (id: string, action: RecoveryAction) => Promise<void>;
  markAsRecovered: (id: string) => void;

  // Configuration
  updateConfig: (config: Partial<ErrorConfig>) => void;

  // Utilities
  hasErrors: () => boolean;
  getErrorById: (id: string) => AppError | undefined;
  getErrorsByCategory: (category: ErrorCategory) => AppError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => AppError[];
  getStatistics: () => ErrorStatistics;
  getErrorRate: () => number;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

/**
 * Error Provider Props
 */
export interface ErrorProviderProps {
  children: ReactNode;
  config?: Partial<ErrorConfig>;
  onError?: (error: AppError) => void;
  onRecovery?: (error: AppError, action: RecoveryAction) => void;
}

/**
 * Error Provider Component
 */
export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  config = {},
  onError,
  onRecovery,
}) => {
  // Use global store instead of useReducer
  const globalError = useGlobalError();
  const errors = useErrors();
  const errorReportingEnabled = useErrorReportingEnabled();
  const { setGlobalError: setGlobalErrorAction, addError, removeError, clearAllErrors: clearAllErrorsAction, setErrorReporting } = useErrorActions();
  
  // Local state for configuration and statistics (not in global store yet)
  const [localConfig, setLocalConfig] = useState<ErrorConfig>({ ...DEFAULT_CONFIG, ...config });
  const [statistics, setStatistics] = useState<ErrorStatistics>(initialStatistics);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const errorHandlerRef = React.useRef<ErrorHandler | null>(null);

  /**
   * Initialize error handling
   */
  useEffect(() => {
    const initializeErrorHandling = async () => {
      // Initialize ErrorHandler
      errorHandlerRef.current = errorHandler;
      // ErrorHandler is already initialized as singleton

      // Initialize ErrorReporting
      await ErrorReporting.initialize({
        enabled: localConfig.enableReporting,
      });

      // Update local config and mark as initialized
      setLocalConfig(prev => ({ ...prev, ...config }));
      setIsInitialized(true);
      setErrorReporting(localConfig.enableReporting);
    };

    initializeErrorHandling();
  }, [config, localConfig.enableReporting, setErrorReporting]);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      ErrorReporting.addBreadcrumb({
        category: 'system',
        message: `App state changed to ${nextAppState}`,
        level: 'info',
      });
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  /**
   * Report error
   */
  const reportError = useCallback(
    (err: AppError | Error, context?: string | { component?: string; action?: string }) => {
      // Normalize incoming generic Error to AppError minimal shape
      const base: AppError = (err as AppError).id
        ? (err as AppError)
        : {
            id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            message: err.message || 'Unknown error',
            userMessage: err.message || 'Something went wrong',
            category: ErrorCategory.UNKNOWN,
            severity: ErrorSeverity.MEDIUM,
            context: {
              timestamp: Date.now(),
              platform: Platform.OS,
            },
            isRecoverable: true,
            retryable: false,
            reportable: true,
          };

      // Ensure code always a string (legacy tests may assert .code contains substring)
      if (!base.code) {
        base.code = String(base.category) || 'unknown';
      }

      let derivedId: string;
      if (typeof context === 'string') {
        derivedId = context;
      } else if (context && typeof context === 'object') {
        derivedId = `${context.component || 'cmp'}_${Date.now()}`;
        // merge context into additionalData
        base.context = {
          ...base.context,
          action: context.action,
          screen: context.component,
        };
      } else {
        derivedId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Use ErrorHandler to categorize the error
      let categorizedError = base;
      if (errorHandlerRef.current) {
        try {
          categorizedError = errorHandlerRef.current.categorizeError(error);
        } catch (categorizationError) {
          console.warn('Error categorization failed:', categorizationError);
        }
      }

      // Add error to global store
      addError(derivedId, {
        id: derivedId,
        message: categorizedError.message,
        category: categorizedError.category,
        severity: categorizedError.severity,
        timestamp: new Date(),
      });
      
      // Update statistics
      setStatistics(prev => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
        errorsByCategory: {
          ...prev.errorsByCategory,
          [categorizedError.category]: (prev.errorsByCategory[categorizedError.category] || 0) + 1,
        },
        errorsBySeverity: {
          ...prev.errorsBySeverity,
          [categorizedError.severity]: (prev.errorsBySeverity[categorizedError.severity] || 0) + 1,
        },
      }));

      if (localConfig.enableReporting) {
        ErrorReporting.reportError(base, {
          context: typeof context === 'string' ? context : null,
          errorId: derivedId,
        });
      }
      if (categorizedError.severity === ErrorSeverity.CRITICAL) {
        setGlobalErrorAction({
          id: derivedId,
          message: categorizedError.message,
          category: categorizedError.category,
          severity: categorizedError.severity,
          timestamp: new Date(),
        });
      }
      onError?.(categorizedError);
      if (
        localConfig.logLevel === 'debug' ||
        (localConfig.logLevel === 'info' && categorizedError.severity !== ErrorSeverity.LOW) ||
        (localConfig.logLevel === 'warn' && categorizedError.severity >= ErrorSeverity.MEDIUM) ||
        (localConfig.logLevel === 'error' && categorizedError.severity >= ErrorSeverity.HIGH)
      ) {
          errorInDev('Error reported:', categorizedError);
      }
    },
    [localConfig, onError, addError, setStatistics, setGlobalErrorAction],
  );

  /**
   * Clear specific error
   */
  const clearError = useCallback(
    (id?: string) => {
      if (!id) {
        // if no id supplied clear most recent (legacy expectation in tests calling clearError())
        const keys = Object.keys(errors);
        const last = keys[keys.length - 1];
        if (last) {
          removeError(last);
        }
        return;
      }
      removeError(id);
    },
    [errors, removeError],
  );

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    clearAllErrorsAction();
  }, [clearAllErrorsAction]);

  /**
   * Set global error
   */
  const setGlobalError = useCallback((error: AppError | null) => {
    if (error) {
      setGlobalErrorAction({
        id: error.id,
        message: error.message,
        category: error.category,
        severity: error.severity,
        timestamp: new Date(),
      });
    } else {
      setGlobalErrorAction(null);
    }
  }, [setGlobalErrorAction]);

  /**
   * Recover from error
   */
  const recoverFromError = useCallback(
    async (id: string, action: RecoveryAction) => {
      const error = errors[id];
      if (!error) {
        return;
      }

      try {
        if (errorHandlerRef.current) {
          // Execute recovery action manually since executeRecoveryAction doesn't exist
          // The recovery logic should be handled by the calling code
        }

        // Mark as recovered
        setStatistics(prev => ({
          ...prev,
          recoveredErrors: prev.recoveredErrors + 1,
        }));
        clearError(id);

        // Call external handler
        onRecovery?.(error, action);

        ErrorReporting.addBreadcrumb({
          category: 'system',
          message: `Recovered from error: ${error.id}`,
          level: 'info',
          data: { errorId: id, action: action.strategy },
        });
      } catch (recoveryError) {
        const appError = recoveryError as AppError;
        reportError(appError, `recovery_failed_${id}`);
      }
    },
    [errors, clearError, onRecovery, reportError, setStatistics],
   );

  /**
   * Mark error as recovered
   */
  const markAsRecovered = useCallback(
    (id: string) => {
      setStatistics(prev => ({
        ...prev,
        recoveredErrors: prev.recoveredErrors + 1,
      }));
      clearError(id);
    },
    [clearError, setStatistics],
  );

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<ErrorConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...newConfig }));

    // Update ErrorHandler configuration
    if (errorHandlerRef.current) {
      errorHandlerRef.current.updateConfig({
        enableReporting: newConfig.enableReporting,
      });
    }

    // Update ErrorReporting configuration
    if (newConfig.enableReporting !== undefined) {
      ErrorReporting.updateConfig({ enabled: newConfig.enableReporting });
      setErrorReporting(newConfig.enableReporting);
    }
  }, [setErrorReporting]);

  /**
   * Check if there are any errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0 || globalError !== null;
  }, [errors, globalError]);

  /**
   * Get error by ID
   */
  const getErrorById = useCallback(
    (id: string) => {
      return errors[id];
    },
    [errors],
  );

  /**
   * Get errors by category
   */
  const getErrorsByCategory = useCallback(
    (category: ErrorCategory) => {
      return Object.values(errors).filter((error) => error.category === category);
    },
    [errors],
  );

  /**
   * Get errors by severity
   */
  const getErrorsBySeverity = useCallback(
    (severity: ErrorSeverity) => {
      return Object.values(errors).filter((error) => error.severity === severity);
    },
    [errors],
  );

  /**
   * Get error statistics
   */
  const getStatistics = useCallback(() => {
    return statistics;
  }, [statistics]);

  /**
   * Get error rate
   */
  const getErrorRate = useCallback(() => {
    const { totalErrors, recoveredErrors } = statistics;
    return totalErrors > 0 ? recoveredErrors / totalErrors : 0;
  }, [statistics]);

  const errorHistory = React.useMemo(() => Object.values(errors), [errors]);
  const currentError = globalError || errorHistory[errorHistory.length - 1] || null;

  const contextValue: ErrorContextValue = {
    // State
    errors,
    globalError,
    config: localConfig,
    statistics,
    isInitialized,
    errorHistory,
    currentError,

    // Actions
    reportError,
    clearError,
    clearAllErrors,
    setGlobalError,
    recoverFromError,
    markAsRecovered,
    updateConfig,

    // Utilities
    hasErrors,
    getErrorById,
    getErrorsByCategory,
    getErrorsBySeverity,
    getStatistics,
    getErrorRate,
  };

  return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
};

/**
 * Use Error Context Hook
 */
export function useErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

/**
 * Use Error Reporting Hook
 */
export function useErrorReporting() {
  const { reportError, clearError } = useErrorContext();

  const reportAndClear = useCallback(
    (error: AppError, context?: string, autoClearDelay?: number) => {
      const errorId = context || `temp_${Date.now()}`;
      reportError(error, errorId);

      if (autoClearDelay) {
        setTimeout(() => clearError(errorId), autoClearDelay);
      }

      return errorId;
    },
    [reportError, clearError],
  );

  return {
    reportError,
    reportAndClear,
    clearError,
  };
}

/**
 * Use Error Statistics Hook
 */
export function useErrorStatistics() {
  const { getStatistics, getErrorRate } = useErrorContext();

  return {
    statistics: getStatistics(),
    errorRate: getErrorRate(),
  };
}

/**
 * Use Error Recovery Hook
 */
export function useErrorRecoveryActions() {
  const { recoverFromError, markAsRecovered } = useErrorContext();

  return {
    recoverFromError,
    markAsRecovered,
  };
}

export default ErrorProvider;
