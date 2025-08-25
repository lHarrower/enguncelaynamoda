// Error Provider - Global error state management and integration
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { AppState, Platform } from 'react-native';

import { errorInDev } from '@/utils/consoleSuppress';

import { ErrorReporting } from '../services/ErrorReporting';
import {
  AppError,
  ErrorCategory,
  ErrorHandler,
  errorHandler,
  ErrorSeverity,
  RecoveryAction,
} from '../utils/ErrorHandler';

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
const initialState: ErrorState = {
  globalError: null,
  errors: {},
  isInitialized: false,
  config: DEFAULT_CONFIG,
  statistics: {
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
  },
};

/**
 * Error Reducer
 */
function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        config: { ...state.config, ...action.payload.config },
      };

    case 'ADD_ERROR': {
      const { id, error } = action.payload;
      const errors = { ...state.errors, [id]: error };

      // Limit errors in memory
      const errorIds = Object.keys(errors);
      if (errorIds.length > state.config.maxErrorsInMemory) {
        const oldestId = errorIds[0];
        if (oldestId) {
          delete (errors as Record<string, AppError>)[oldestId];
        }
      }

      return {
        ...state,
        errors,
        statistics: {
          ...state.statistics,
          totalErrors: state.statistics.totalErrors + 1,
          errorsByCategory: {
            ...state.statistics.errorsByCategory,
            [error.category]: state.statistics.errorsByCategory[error.category] + 1,
          },
          errorsBySeverity: {
            ...state.statistics.errorsBySeverity,
            [error.severity]: state.statistics.errorsBySeverity[error.severity] + 1,
          },
        },
      };
    }

    case 'REMOVE_ERROR': {
      const { [action.payload.id]: removed, ...errors } = state.errors;
      return { ...state, errors };
    }

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload.error,
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        globalError: null,
        errors: {},
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload.config },
      };

    case 'INCREMENT_RECOVERED':
      return {
        ...state,
        statistics: {
          ...state.statistics,
          recoveredErrors: state.statistics.recoveredErrors + 1,
        },
      };

    case 'UPDATE_STATISTICS':
      return {
        ...state,
        statistics: {
          ...state.statistics,
          totalErrors: state.statistics.totalErrors + 1,
          errorsByCategory: {
            ...state.statistics.errorsByCategory,
            [action.payload.error.category]:
              state.statistics.errorsByCategory[action.payload.error.category] + 1,
          },
          errorsBySeverity: {
            ...state.statistics.errorsBySeverity,
            [action.payload.error.severity]:
              state.statistics.errorsBySeverity[action.payload.error.severity] + 1,
          },
        },
      };

    default:
      return state;
  }
}

/**
 * Error Context
 */
export interface ErrorContextValue {
  state: ErrorState;

  // Error Management
  reportError: (
    error: AppError | Error,
    context?: string | { component?: string; action?: string },
  ) => void;
  clearError: (id?: string) => void; // id opsiyonel: testlerde clearError() çağrılıyor
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

  // Statistics
  getStatistics: () => ErrorStatistics;
  getErrorRate: () => number; // errors per minute

  // Legacy compatibility aliases expected by tests
  currentError: AppError | null;
  errorHistory: AppError[]; // simple chronological list
  statistics: ErrorStatistics; // direct alias for state.statistics
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
  const [state, dispatch] = useReducer(errorReducer, initialState);
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
        enabled: state.config.enableReporting,
      });

      dispatch({ type: 'INITIALIZE', payload: { config } });
    };

    initializeErrorHandling();
  }, []);

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

      dispatch({ type: 'ADD_ERROR', payload: { id: derivedId, error: base } });

      if (state.config.enableReporting) {
        ErrorReporting.reportError(base, {
          context: typeof context === 'string' ? context : null,
          errorId: derivedId,
        });
      }
      if (base.severity === ErrorSeverity.CRITICAL) {
        dispatch({ type: 'SET_GLOBAL_ERROR', payload: { error: base } });
      }
      onError?.(base);
      if (
        state.config.logLevel === 'debug' ||
        (state.config.logLevel === 'info' && base.severity !== ErrorSeverity.LOW) ||
        (state.config.logLevel === 'warn' && base.severity >= ErrorSeverity.MEDIUM) ||
        (state.config.logLevel === 'error' && base.severity >= ErrorSeverity.HIGH)
      ) {
        errorInDev('Error reported:', base);
      }
    },
    [state.config, onError],
  );

  /**
   * Clear specific error
   */
  const clearError = useCallback(
    (id?: string) => {
      if (!id) {
        // if no id supplied clear most recent (legacy expectation in tests calling clearError())
        const keys = Object.keys(state.errors);
        const last = keys[keys.length - 1];
        if (last) {
          dispatch({ type: 'REMOVE_ERROR', payload: { id: last } });
        }
        return;
      }
      dispatch({ type: 'REMOVE_ERROR', payload: { id } });
    },
    [state.errors],
  );

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  /**
   * Set global error
   */
  const setGlobalError = useCallback((error: AppError | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: { error } });
  }, []);

  /**
   * Recover from error
   */
  const recoverFromError = useCallback(
    async (id: string, action: RecoveryAction) => {
      const error = state.errors[id];
      if (!error) {
        return;
      }

      try {
        if (errorHandlerRef.current) {
          // Execute recovery action manually since executeRecoveryAction doesn't exist
          // The recovery logic should be handled by the calling code
        }

        // Mark as recovered
        dispatch({ type: 'INCREMENT_RECOVERED' });
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
    [state.errors, clearError, onRecovery, reportError],
  );

  /**
   * Mark error as recovered
   */
  const markAsRecovered = useCallback(
    (id: string) => {
      dispatch({ type: 'INCREMENT_RECOVERED' });
      clearError(id);
    },
    [clearError],
  );

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<ErrorConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { config: newConfig } });

    // Update ErrorHandler configuration
    if (errorHandlerRef.current) {
      errorHandlerRef.current.updateConfig({
        enableReporting: newConfig.enableReporting,
      });
    }

    // Update ErrorReporting configuration
    if (newConfig.enableReporting !== undefined) {
      ErrorReporting.updateConfig({ enabled: newConfig.enableReporting });
    }
  }, []);

  /**
   * Check if there are any errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(state.errors).length > 0 || state.globalError !== null;
  }, [state.errors, state.globalError]);

  /**
   * Get error by ID
   */
  const getErrorById = useCallback(
    (id: string) => {
      return state.errors[id];
    },
    [state.errors],
  );

  /**
   * Get errors by category
   */
  const getErrorsByCategory = useCallback(
    (category: ErrorCategory) => {
      return Object.values(state.errors).filter((error) => error.category === category);
    },
    [state.errors],
  );

  /**
   * Get errors by severity
   */
  const getErrorsBySeverity = useCallback(
    (severity: ErrorSeverity) => {
      return Object.values(state.errors).filter((error) => error.severity === severity);
    },
    [state.errors],
  );

  /**
   * Get statistics
   */
  const getStatistics = useCallback(() => {
    return state.statistics;
  }, [state.statistics]);

  /**
   * Get error rate (errors per minute)
   */
  const getErrorRate = useCallback(() => {
    const sessionDuration = (Date.now() - state.statistics.sessionStartTime) / 1000 / 60; // minutes
    return sessionDuration > 0 ? state.statistics.totalErrors / sessionDuration : 0;
  }, [state.statistics]);

  const errorHistory = React.useMemo(() => Object.values(state.errors), [state.errors]);
  const currentError = state.globalError || errorHistory[errorHistory.length - 1] || null;

  const contextValue: ErrorContextValue = {
    state,
    reportError,
    clearError,
    clearAllErrors,
    setGlobalError,
    recoverFromError,
    markAsRecovered,
    updateConfig,
    hasErrors,
    getErrorById,
    getErrorsByCategory,
    getErrorsBySeverity,
    getStatistics,
    getErrorRate,
    // legacy aliases
    currentError,
    errorHistory,
    statistics: state.statistics,
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
