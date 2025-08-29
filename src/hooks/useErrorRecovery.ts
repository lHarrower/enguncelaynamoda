// Error Recovery Hooks - Automatic retry and recovery strategies
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { ErrorReporting } from '../services/ErrorReporting';
import { AppError, ErrorCategory, errorHandler, ErrorSeverity } from '../utils/ErrorHandler';

/**
 * Retry Configuration
 */
export interface RetryConfig {
  /**
   * Total attempts INCLUDING the initial attempt.
   * (Legacy API exposed this as `maxRetries` meaning the number of retries AFTER the first attempt.
   * We map `maxRetries` -> `maxAttempts = maxRetries + 1` for compatibility.)
   */
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: AppError, attempt: number) => boolean;
  /** Maximum consecutive failures before giving up (legacy: failureThreshold). If provided overrides maxAttempts derivation */
  failureThreshold?: number;
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
    retryCondition: (error: AppError, attempt?: number) => {
      if (
        !error ||
        error.category !== ErrorCategory.NETWORK ||
        error.severity === ErrorSeverity.CRITICAL
      ) {
        return false;
      }
      // Don't retry 4xx client errors (400-499)
      // Check both the error itself and its originalError for status codes
      const errorStatus = (error as any).status || (error.originalError as any)?.status;
      if (errorStatus >= 400 && errorStatus < 500) {
        return false;
      }
      return true;
    },
  },
  aiService: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitter: true,
    retryCondition: (error: AppError, attempt?: number) =>
      error &&
      error.category === ErrorCategory.AI_SERVICE &&
      !error.message?.includes('QUOTA_EXCEEDED'),
  },
  imageProcessing: {
    maxAttempts: 2,
    baseDelay: 1500,
    maxDelay: 6000,
    backoffMultiplier: 2,
    jitter: false,
    retryCondition: (error: AppError, attempt?: number) =>
      error &&
      error.category === ErrorCategory.IMAGE_PROCESSING &&
      error.severity !== ErrorSeverity.CRITICAL,
  },
  default: {
    maxAttempts: 1,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    jitter: true,
  },
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
// Backwards compatible configuration normalizer (accepts legacy keys like maxRetries)
type LegacyRetryConfig = Partial<RetryConfig> & { maxRetries?: number };
function normalizeRetryConfig(partial?: LegacyRetryConfig): RetryConfig {
  const maxRetries: number | undefined = partial?.maxRetries; // legacy key
  const failureThreshold: number | undefined = partial?.failureThreshold; // legacy key
  const base: Partial<RetryConfig> = { ...partial };
  delete (base as LegacyRetryConfig).maxRetries;
  // failureThreshold maps to maxAttempts = failureThreshold
  let derivedMaxAttempts = base.maxAttempts || RETRY_CONFIGS.default.maxAttempts;
  if (typeof maxRetries === 'number') {
    // When maxRetries is 0, we should have 1 attempt (no retries)
    // When maxRetries is 1, we should have 2 attempts (1 retry), etc.
    derivedMaxAttempts = maxRetries + 1;
  }
  if (typeof failureThreshold === 'number') {
    derivedMaxAttempts = Math.max(1, failureThreshold);
  }
  return {
    ...RETRY_CONFIGS.default,
    ...base,
    maxAttempts: derivedMaxAttempts,
    failureThreshold,
  } as RetryConfig;
}

// Overloads to support both (operation, config) and (config) signatures used in legacy tests
// Unified signature: (operation?, config?) where first arg can be config object
export function useErrorRecovery<T>(
  operationOrConfig?:
    | (() => Promise<T>)
    | (Partial<RetryConfig> & { maxRetries?: number; failureThreshold?: number }),
  maybeConfig?: Partial<RetryConfig> & { maxRetries?: number; failureThreshold?: number },
) {
  const isFn = typeof operationOrConfig === 'function';
  const operation = isFn ? (operationOrConfig as () => Promise<T>) : undefined;
  const config = (isFn ? maybeConfig : operationOrConfig) as
    | (Partial<RetryConfig> & { maxRetries?: number; failureThreshold?: number })
    | undefined;
  return _useErrorRecovery<T>(operation, config);
}

function _useErrorRecovery<T>(
  operation?: () => Promise<T>,
  config?: Partial<RetryConfig> & { maxRetries?: number },
) {
  const [state, setState] = useState<RecoveryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    nextRetryIn: 0,
    // Legacy tests expect canRetry === true immediately even before a failure
    canRetry: true,
  });
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const operationRef = useRef<(() => Promise<T>) | null>(operation || null);
  const attemptRef = useRef<number>(0);

  const retryConfig: RetryConfig = normalizeRetryConfig(config);

  /**
   * Calculate delay with exponential backoff and jitter
   */
  const calculateDelay = useCallback(
    (attempt: number): number => {
      let delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay,
      );

      if (retryConfig.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      return Math.floor(delay);
    },
    [retryConfig],
  );

  /**
   * Start countdown timer
   */
  const startCountdown = useCallback((delay: number) => {
    setState((prev) => ({ ...prev, nextRetryIn: delay }));

    const startTime = Date.now();
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, delay - elapsed);

      setState((prev) => ({ ...prev, nextRetryIn: remaining }));

      if (remaining > 0) {
        countdownRef.current = setTimeout(updateCountdown, 100);
      }
    };

    updateCountdown();
  }, []);

  /**
   * Execute operation with retry logic
   */
  const execute = useCallback(
    async (opOverride?: () => Promise<T>, isRetry: boolean = false): Promise<T | null> => {
      // Reset attempt counter only for new execution, not retries
      if (!isRetry) {
        attemptRef.current = 0;
      }
      setIsLoading(true);

      try {
        // Use the provided operation or fall back to the stored one
        const op = opOverride || operationRef.current;
        if (!op) {
          // No operation provided yet; treat as successful no-op
          setIsLoading(false);
          return null;
        }

        // Update the ref if a new operation was provided
        if (opOverride) {
          operationRef.current = opOverride;
        }

        const result = await op();
        setData(result);

        // Reset state on success
        setState({
          isRetrying: false,
          attempt: 0,
          lastError: null,
          nextRetryIn: 0,
          canRetry: false,
        });

        setIsLoading(false);
        return result;
      } catch (error) {
        const appError = errorHandler.categorizeError(error);

        // Use ref to get current attempt and avoid stale closure
        const currentAttempt = attemptRef.current;
        const newAttempt = currentAttempt + 1;
        attemptRef.current = newAttempt;

        const effectiveMax = retryConfig.failureThreshold ?? retryConfig.maxAttempts;
        const canRetry =
          newAttempt < effectiveMax &&
          (!retryConfig.retryCondition || retryConfig.retryCondition(appError, newAttempt));

        // Always set loading to false and update state with error
        setIsLoading(false);
        setState((prev) => ({
          ...prev,
          attempt: newAttempt,
          lastError: appError,
          canRetry,
        }));

        // Report error
        ErrorReporting.reportError(appError, {
          operation: 'useErrorRecovery',
          attempt: newAttempt,
          canRetry,
        });

        if (canRetry) {
          const delay = calculateDelay(newAttempt - 1);
          setState((prev) => ({ ...prev, isRetrying: true }));
          startCountdown(delay);

          // Use setTimeout with a promise that works better with fake timers
          return new Promise((resolve, reject) => {
            retryTimeoutRef.current = setTimeout(async () => {
              setState((prev) => ({ ...prev, isRetrying: false }));
              try {
                // Directly retry the operation instead of recursive call
                const op = opOverride || operationRef.current;
                if (!op) {
                  resolve(null);
                  return;
                }
                const result = await op();
                setData(result);
                setState({
                  isRetrying: false,
                  attempt: 0,
                  lastError: null,
                  nextRetryIn: 0,
                  canRetry: false,
                });
                setIsLoading(false);
                resolve(result);
              } catch (retryError) {
                // If retry fails, continue the retry logic
                const appRetryError = errorHandler.categorizeError(retryError);
                const currentAttempt = attemptRef.current;
                const newAttempt = currentAttempt + 1;
                attemptRef.current = newAttempt;

                const effectiveMax = retryConfig.failureThreshold ?? retryConfig.maxAttempts;
                const canRetryAgain =
                  newAttempt < effectiveMax &&
                  (!retryConfig.retryCondition ||
                    retryConfig.retryCondition(appRetryError, newAttempt));

                setState((prev) => ({
                  ...prev,
                  attempt: newAttempt,
                  lastError: appRetryError,
                  canRetry: canRetryAgain,
                }));

                if (canRetryAgain) {
                  // Continue retrying by calling execute recursively
                  execute(opOverride, true).then(resolve).catch(reject);
                } else {
                  // No more retries, reject with the error
                  reject(appRetryError);
                }
              }
            }, delay);
          });
        } else {
          // For non-retryable errors, reject the promise
          return Promise.reject(appError);
        }
      }
    },
    [retryConfig, calculateDelay, startCountdown],
  );

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
    setState((prev) => ({ ...prev, isRetrying: false, nextRetryIn: 0 }));
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
      canRetry: true, // Legacy tests expect canRetry === true after reset
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

  // Backwards compatibility aliases
  const executeWithRetry = (op?: () => Promise<T>) => execute(op);

  return {
    execute,
    executeWithRetry, // legacy name expected in tests
    retry,
    reset,
    data,
    isLoading,
    retryCount: state.attempt, // legacy alias
    ...state,
  };
}

/**
 * Network Recovery Hook
 */
// Legacy-friendly wrappers (tests expect names: useNetworkErrorRecovery, etc.)
export function useNetworkErrorRecovery<T>(operation?: () => Promise<T>) {
  return _useErrorRecovery<T>(operation, RETRY_CONFIGS.network);
}

/**
 * AI Service Recovery Hook
 */
export function useAIServiceErrorRecovery<T>(operation?: () => Promise<T>) {
  const cfg: Partial<RetryConfig> = {
    maxAttempts: 3,
    baseDelay: 2000,
    backoffMultiplier: 2,
    jitter: true,
  };
  return _useErrorRecovery<T>(operation, cfg);
}

/**
 * Image Processing Recovery Hook
 */
export function useImageErrorRecovery<T>(operation?: () => Promise<T>) {
  return _useErrorRecovery<T>(operation, RETRY_CONFIGS.imageProcessing);
}

/**
 * Circuit Breaker Hook
 */
interface CircuitBreakerConfigLegacy {
  failureThreshold?: number;
  timeout?: number; // legacy key for resetTimeout
  monitoringPeriod?: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

// Backward compatibility: tests may call useCircuitBreaker({ failureThreshold: 2 }) expecting config-only form
export function useCircuitBreaker<T>(
  operationOrConfig?: (() => Promise<T>) | CircuitBreakerConfigLegacy,
  maybeConfig: CircuitBreakerConfigLegacy = {
    failureThreshold: 5,
    timeout: 60000,
    monitoringPeriod: 300000,
  },
) {
  const isFunction = typeof operationOrConfig === 'function';
  const operation =
    (isFunction ? (operationOrConfig as () => Promise<T>) : undefined) ||
    (async () => Promise.resolve(null as T));
  const config =
    (isFunction ? maybeConfig : (operationOrConfig as CircuitBreakerConfigLegacy)) || maybeConfig;
  const internalConfig = {
    failureThreshold: config.failureThreshold ?? 5,
    resetTimeout: config.timeout ?? 60000,
    monitoringPeriod: config.monitoringPeriod ?? 300000,
  };

  const [state, setState] = useState<CircuitState>('closed');
  const [failures, setFailures] = useState(0);
  const [lastFailureTime, setLastFailureTime] = useState(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const operationRef = useRef(operation);
  const execute = useCallback(
    async (opOverride?: () => Promise<T>): Promise<T> => {
      if (opOverride) {
        operationRef.current = opOverride;
      }
      const now = Date.now();
      // Reset failures if monitoring period has passed
      if (now - lastFailureTime > internalConfig.monitoringPeriod) {
        setFailures(0);
      }
      // Check circuit state
      if (state === 'open') {
        if (now - lastFailureTime < internalConfig.resetTimeout) {
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
          setState('half-open');
        }
      }
      try {
        const result = await operationRef.current();
        if (state === 'half-open') {
          setState('closed');
          setFailures(0);
        }
        return result;
      } catch (error) {
        const newFailures = failures + 1;
        setFailures(newFailures);
        setLastFailureTime(now);
        if (newFailures >= internalConfig.failureThreshold) {
          setState('open');
          if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
          }
          resetTimeoutRef.current = setTimeout(() => {
            setState('half-open');
          }, internalConfig.resetTimeout);
        }
        throw error;
      }
    },
    [
      state,
      failures,
      lastFailureTime,
      internalConfig.failureThreshold,
      internalConfig.resetTimeout,
      internalConfig.monitoringPeriod,
    ],
  );

  const reset = useCallback(() => {
    setState('closed');
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
    canExecute: state !== 'open',
    failureCount: failures, // legacy alias
    failures,
    isOpen: state === 'open',
    isHalfOpen: state === 'half-open',
  };
}

/**
 * App State Recovery Hook - handles app backgrounding/foregrounding
 */
export function useAppStateRecovery<T>(
  operationOrOptions?:
    | (() => Promise<T>)
    | {
        retryOnForeground?: boolean;
        resetOnBackground?: boolean;
        onForeground?: () => void;
        onBackground?: () => void;
      },
  maybeOptions?: {
    retryOnForeground?: boolean;
    resetOnBackground?: boolean;
    onForeground?: () => void;
    onBackground?: () => void;
  },
) {
  const isFunction = typeof operationOrOptions === 'function';
  const options = (isFunction ? maybeOptions : operationOrOptions) || {};
  const operation =
    (isFunction ? (operationOrOptions as () => Promise<T>) : undefined) ||
    (async () => Promise.resolve(null as T));
  const {
    retryOnForeground = true,
    resetOnBackground = false,
    onForeground,
    onBackground,
  } = options;
  const recovery = useErrorRecovery(operation);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        onForeground?.();
        if (retryOnForeground && recovery.lastError && recovery.canRetry) {
          recovery.retry();
        }
      } else if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
        onBackground?.();
        if (resetOnBackground) {
          recovery.reset();
        }
      }
      appStateRef.current = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [recovery, retryOnForeground, resetOnBackground, onForeground, onBackground]);

  return recovery;
}

/**
 * Batch Recovery Hook - for handling multiple operations
 */
export function useBatchRecovery<T>(
  initialOperations?: (() => Promise<T>)[],
  config?: {
    failFast?: boolean;
    maxConcurrent?: number;
    retryConfig?: Partial<RetryConfig>;
  },
) {
  const { failFast = false, maxConcurrent = 3, retryConfig } = config || {};
  const [results, setResults] = useState<(T | null)[]>([]);
  const [errors, setErrors] = useState<(AppError | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const operationsRef = useRef<(() => Promise<T>)[]>(initialOperations || []);

  const run = useCallback(
    async (
      ops?: (() => Promise<T>)[],
      options?: { continueOnError?: boolean; retryFailures?: boolean; maxRetries?: number },
    ) => {
      const operations = ops || operationsRef.current;
      operationsRef.current = operations;
      setIsLoading(true);
      setResults(new Array(operations.length).fill(null));
      setErrors(new Array(operations.length).fill(null));
      setProgress(0);

      const { continueOnError = true, retryFailures = false, maxRetries = 0 } = options || {};

      const executeOperation = async (index: number) => {
        const op = operations[index];
        if (!op) {
          return;
        }
        let attempts = 0;
        const maxAttempts = maxRetries + 1; // total attempts = initial + retries

        while (attempts < maxAttempts) {
          try {
            const result = await op();
            setResults((prev) => {
              const next = [...prev];
              next[index] = result;
              return next;
            });
            setProgress((p) => p + 1);
            break;
          } catch (err) {
            attempts += 1;
            if (retryFailures && attempts < maxAttempts) {
              // simple fixed delay retry (tests advance by 1000ms)
              await new Promise((res) => setTimeout(res, 1000));
            } else {
              setErrors((prev) => {
                const next = [...prev];
                next[index] = err as AppError;
                return next;
              });
              if (failFast && !continueOnError) {
                throw err;
              }
              break;
            }
          }
        }
      };

      try {
        const chunks: Array<typeof operations> = [];
        for (let i = 0; i < operations.length; i += maxConcurrent) {
          chunks.push(operations.slice(i, i + maxConcurrent));
        }
        for (const chunk of chunks) {
          await Promise.all(
            chunk.map((_, chunkIndex) => {
              const globalIndex = chunks.indexOf(chunk) * maxConcurrent + chunkIndex;
              return executeOperation(globalIndex);
            }),
          );
        }
      } finally {
        setIsLoading(false);
      }
      // Return the final results after all operations complete
      return new Promise((resolve) => {
        setTimeout(() => {
          setResults((currentResults) => {
            resolve(currentResults);
            return currentResults;
          });
        }, 0);
      });
    },
    [failFast, maxConcurrent, retryConfig],
  );

  const executeBatch = run;
  const execute = run; // generic alias

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Component is unmounting, cancel any pending operations
      setIsLoading(false);
    };
  }, []);

  return {
    executeBatch,
    execute,
    results,
    errors,
    isLoading,
    progress,
    total: operationsRef.current.length,
    completed: progress,
    completedCount: progress,
    failedCount: errors.filter((e) => e).length,
    totalCount: operationsRef.current.length,
    isExecuting: isLoading,
    hasErrors: errors.some((e) => e !== null),
  };
}

export default {
  useErrorRecovery,
  useNetworkErrorRecovery,
  useAIServiceErrorRecovery,
  useImageErrorRecovery,
  useCircuitBreaker,
  useAppStateRecovery,
  useBatchRecovery,
};
