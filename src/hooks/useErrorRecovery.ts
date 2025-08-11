// Error Recovery Hooks - Automatic retry and recovery strategies
import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState } from 'react-native';
import { AppError, ErrorSeverity, ErrorCategory, RecoveryStrategy } from '../utils/ErrorHandler';
import { ErrorReporting } from '../services/ErrorReporting';

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: AppError, attempt: number) => boolean;
}

/**
 * Default Retry Configurations
 */
export const RETRY_CONFIGS = {
  network: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: AppError) => 
      error.category === ErrorCategory.NETWORK && 
      error.severity !== ErrorSeverity.CRITICAL
  },
  aiService: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: AppError) => 
      error.category === ErrorCategory.AI_SERVICE &&
  !(error as any)?.message?.includes?.('QUOTA_EXCEEDED')
  },
  imageProcessing: {
    maxAttempts: 2,
    baseDelay: 1500,
    maxDelay: 6000,
    backoffMultiplier: 2,
    jitter: false,
    retryCondition: (error: AppError) => 
      error.category === ErrorCategory.IMAGE_PROCESSING &&
      error.severity !== ErrorSeverity.CRITICAL
  },
  default: {
    maxAttempts: 1,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    jitter: true
  }
};

/**
 * Recovery State
 */
export interface RecoveryState {
  isRetrying: boolean;
  attempt: number;
  lastError: AppError | null;
  nextRetryIn: number;
  canRetry: boolean;
}

/**
 * Use Error Recovery Hook
 */
export function useErrorRecovery<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
) {
  const [state, setState] = useState<RecoveryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    nextRetryIn: 0,
    canRetry: false
  });

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const retryConfig: RetryConfig = {
    ...RETRY_CONFIGS.default,
    ...config
  };

  /**
   * Calculate delay with exponential backoff and jitter
   */
  const calculateDelay = useCallback((attempt: number): number => {
    let delay = Math.min(
      retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
      retryConfig.maxDelay
    );

    if (retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }, [retryConfig]);

  /**
   * Start countdown timer
   */
  const startCountdown = useCallback((delay: number) => {
    setState(prev => ({ ...prev, nextRetryIn: delay }));
    
    const startTime = Date.now();
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, delay - elapsed);
      
      setState(prev => ({ ...prev, nextRetryIn: remaining }));
      
      if (remaining > 0) {
        countdownRef.current = setTimeout(updateCountdown, 100);
      }
    };
    
    updateCountdown();
  }, []);

  /**
   * Execute operation with retry logic
   */
  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    
    try {
      const result = await operation();
      setData(result);
      
      // Reset state on success
      setState({
        isRetrying: false,
        attempt: 0,
        lastError: null,
        nextRetryIn: 0,
        canRetry: false
      });
      
      return result;
    } catch (error) {
      const appError = error as AppError;
      const newAttempt = state.attempt + 1;
      const canRetry = newAttempt < retryConfig.maxAttempts &&
        (!retryConfig.retryCondition || retryConfig.retryCondition(appError, newAttempt));
      
      setState(prev => ({
        ...prev,
        attempt: newAttempt,
        lastError: appError,
        canRetry
      }));
      
      // Report error
      ErrorReporting.reportError(appError, {
        operation: 'useErrorRecovery',
        attempt: newAttempt,
        canRetry
      });
      
      if (canRetry) {
        const delay = calculateDelay(newAttempt - 1);
        setState(prev => ({ ...prev, isRetrying: true }));
        startCountdown(delay);
        
        retryTimeoutRef.current = setTimeout(() => {
          execute();
        }, delay);
      } else {
        setIsLoading(false);
        throw appError;
      }
      
      return null;
    }
  }, [operation, state.attempt, retryConfig, calculateDelay, startCountdown]);

  /**
   * Manual retry
   */
  const retry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isRetrying: false,
      nextRetryIn: 0
    }));
    
    execute();
  }, [execute]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    
    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      nextRetryIn: 0,
      canRetry: false
    });
    
    setData(null);
    setIsLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, []);

  return {
    execute,
    retry,
    reset,
    data,
    isLoading,
    ...state
  };
}

/**
 * Network Recovery Hook
 */
export function useNetworkRecovery<T>(operation: () => Promise<T>) {
  return useErrorRecovery(operation, RETRY_CONFIGS.network);
}

/**
 * AI Service Recovery Hook
 */
export function useAIServiceRecovery<T>(operation: () => Promise<T>) {
  return useErrorRecovery(operation, RETRY_CONFIGS.aiService);
}

/**
 * Image Processing Recovery Hook
 */
export function useImageProcessingRecovery<T>(operation: () => Promise<T>) {
  return useErrorRecovery(operation, RETRY_CONFIGS.imageProcessing);
}

/**
 * Circuit Breaker Hook
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export function useCircuitBreaker<T>(
  operation: () => Promise<T>,
  config: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 300000
  }
) {
  const [state, setState] = useState<CircuitState>('CLOSED');
  const [failures, setFailures] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    const now = Date.now();
    
    // Reset failures if monitoring period has passed
    if (now - lastFailureTime > config.monitoringPeriod) {
      setFailures(0);
    }
    
    // Check circuit state
    if (state === 'OPEN') {
      if (now - lastFailureTime < config.resetTimeout) {
        throw {
          id: 'CIRCUIT_BREAKER_OPEN',
          message: 'Service temporarily unavailable',
          userMessage: 'The service is currently unavailable. Please try again later.',
          category: ErrorCategory.UNKNOWN,
          severity: ErrorSeverity.HIGH,
          context: { timestamp: Date.now(), platform: 'unknown' },
          isRecoverable: true,
          retryable: false,
          reportable: true,
        } as AppError;
      } else {
        setState('HALF_OPEN');
      }
    }
    
    try {
      const result = await operation();
      
      // Success - reset circuit
      if (state === 'HALF_OPEN') {
        setState('CLOSED');
        setFailures(0);
      }
      
      return result;
    } catch (error) {
      const newFailures = failures + 1;
      setFailures(newFailures);
      setLastFailureTime(now);
      
      // Open circuit if threshold reached
      if (newFailures >= config.failureThreshold) {
        setState('OPEN');
        
        // Set reset timeout
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
        
        resetTimeoutRef.current = setTimeout(() => {
          setState('HALF_OPEN');
        }, config.resetTimeout);
      }
      
      throw error;
    }
  }, [operation, state, failures, lastFailureTime, config]);

  const reset = useCallback(() => {
    setState('CLOSED');
    setFailures(0);
    setLastFailureTime(0);
    
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return {
    execute,
    reset,
    state,
    failures,
    isOpen: state === 'OPEN',
    isHalfOpen: state === 'HALF_OPEN'
  };
}

/**
 * App State Recovery Hook - handles app backgrounding/foregrounding
 */
export function useAppStateRecovery<T>(
  operation: () => Promise<T>,
  options: {
    retryOnForeground?: boolean;
    resetOnBackground?: boolean;
  } = {}
) {
  const { retryOnForeground = true, resetOnBackground = false } = options;
  const recovery = useErrorRecovery(operation);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
  const handleAppStateChange = (nextAppState: any) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        if (retryOnForeground && recovery.lastError && recovery.canRetry) {
          recovery.retry();
        }
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background
        if (resetOnBackground) {
          recovery.reset();
        }
      }
      
  appStateRef.current = nextAppState as any;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [recovery, retryOnForeground, resetOnBackground]);

  return recovery;
}

/**
 * Batch Recovery Hook - for handling multiple operations
 */
export function useBatchRecovery<T>(
  operations: (() => Promise<T>)[],
  config?: {
    failFast?: boolean;
    maxConcurrent?: number;
    retryConfig?: Partial<RetryConfig>;
  }
) {
  const { failFast = false, maxConcurrent = 3, retryConfig } = config || {};
  const [results, setResults] = useState<(T | null)[]>([]);
  const [errors, setErrors] = useState<(AppError | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(async (): Promise<(T | null)[]> => {
    setIsLoading(true);
    setResults(new Array(operations.length).fill(null));
    setErrors(new Array(operations.length).fill(null));
    setProgress(0);

    const executeOperation = async (index: number): Promise<void> => {
      const recovery = useErrorRecovery(operations[index], retryConfig);
      
      try {
        const result = await recovery.execute();
        setResults(prev => {
          const newResults = [...prev];
          newResults[index] = result;
          return newResults;
        });
      } catch (error) {
        const appError = error as AppError;
        setErrors(prev => {
          const newErrors = [...prev];
          newErrors[index] = appError;
          return newErrors;
        });
        
        if (failFast) {
          throw appError;
        }
      } finally {
        setProgress(prev => prev + 1);
      }
    };

    try {
      // Execute operations with concurrency limit
  const chunks: Array<typeof operations> = [] as any;
      for (let i = 0; i < operations.length; i += maxConcurrent) {
        chunks.push(operations.slice(i, i + maxConcurrent));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((_, chunkIndex) => {
            const globalIndex = chunks.indexOf(chunk) * maxConcurrent + chunkIndex;
            return executeOperation(globalIndex);
          })
        );
      }
    } finally {
      setIsLoading(false);
    }

    return results;
  }, [operations, failFast, maxConcurrent, retryConfig]);

  return {
    execute,
    results,
    errors,
    isLoading,
    progress,
    total: operations.length,
    completed: progress,
    hasErrors: errors.some(error => error !== null)
  };
}

export default {
  useErrorRecovery,
  useNetworkRecovery,
  useAIServiceRecovery,
  useImageProcessingRecovery,
  useCircuitBreaker,
  useAppStateRecovery,
  useBatchRecovery
};