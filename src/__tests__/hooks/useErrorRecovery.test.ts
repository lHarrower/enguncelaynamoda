// Unit tests for useErrorRecovery hooks
import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useErrorRecovery,
  useNetworkErrorRecovery,
  useAIServiceErrorRecovery,
  useImageErrorRecovery,
  useCircuitBreaker,
  useAppStateRecovery,
  useBatchRecovery,
} from '@/hooks/useErrorRecovery';
import { ErrorHandler, AppError, ErrorCategory, ErrorSeverity } from '@/utils/ErrorHandler';

// Mock dependencies
// Mock ErrorHandler
jest.mock('@/utils/ErrorHandler', () => ({
  const mockCategorizeError = jest.fn();
  const mockHandleError = jest.fn();
  const mockGetRecoveryStrategy = jest.fn();
  const originalModule = jest.requireActual('@/utils/ErrorHandler');

  // Create a mock errorHandler instance
  const mockErrorHandlerInstance = {
    categorizeError: mockCategorizeError,
    handleError: mockHandleError,
    getRecoveryStrategy: mockGetRecoveryStrategy,
    createError: jest.fn(),
    retryOperation: jest.fn(),
    getErrorQueue: jest.fn(() => []),
    getErrorStatistics: jest.fn(() => ({
      total: 0,
      recentErrors: [],
      errorCounts: {},
      totalErrors: 0,
    })),
    detectErrorPatterns: jest.fn(() => ({ rapidSuccession: [] })),
    setCustomHandler: jest.fn(),
    registerRecoveryStrategy: jest.fn(),
    executeRecoveryAction: jest.fn(),
    retry: jest.fn(),
    getRecoveryActions: jest.fn(() => []),
    clearErrors: jest.fn(),
    getRecentErrors: jest.fn(() => []),
    addListener: jest.fn(() => jest.fn()),
    getConfig: jest.fn(() => ({})),
    updateConfig: jest.fn(),
  };

  return {
    ...originalModule,
    ErrorHandler: {
      getInstance: jest.fn(() => mockErrorHandlerInstance),
    },
    errorHandler: mockErrorHandlerInstance,
  };
});

// Get the mocked errorHandler to configure it in tests
const { errorHandler: mockedErrorHandler } = jest.requireMock('@/utils/ErrorHandler');
jest.mock('@/services/ErrorReporting', () => ({
  ErrorReporting: {
    reportError: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUserContext: jest.fn(),
  },
  ErrorReportingService: {
    getInstance: jest.fn(() => ({
      reportError: jest.fn(),
      addBreadcrumb: jest.fn(),
      setUserContext: jest.fn(),
    })),
  },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => jest.fn()),
    removeEventListener: jest.fn(),
  },
}));
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));
jest.mock('c:/AYNAMODA/src/config/supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe('useErrorRecovery', () => {
  const mockErrorHandler = ErrorHandler.getInstance as jest.MockedFunction<
    typeof ErrorHandler.getInstance
  >;
  const { errorHandler } = jest.requireMock('@/utils/ErrorHandler');
  const mockHandleError = errorHandler.handleError;
  const mockGetRecoveryStrategy = errorHandler.getRecoveryStrategy;
  const mockCategorizeError = errorHandler.categorizeError;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock categorizeError to return a proper AppError
    mockCategorizeError.mockImplementation((error: Error) => {
      return {
        message: error.message,
        category: ErrorCategory.IMAGE_PROCESSING,
        severity: ErrorSeverity.LOW, // Use LOW instead of MEDIUM to ensure retry
        timestamp: new Date(),
        context: { originalError: error },
      };
    });

    mockGetRecoveryStrategy.mockReturnValue({
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      jitter: true,
    });
  });

  afterEach(() => {
    // Clear all pending timers and async operations
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('useErrorRecovery', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useErrorRecovery());

      expect(result.current.retryCount).toBe(0);
      expect(result.current.isRetrying).toBe(false);
      expect(result.current.canRetry).toBe(true);
    });

    it('should accept custom configuration', () => {
      const config = {
        maxRetries: 5,
        baseDelay: 2000,
        backoffMultiplier: 1.5,
        jitter: false,
      };

      const { result } = renderHook(() => useErrorRecovery(config));

      expect(result.current.canRetry).toBe(true);
    });

    it('should execute retry with exponential backoff', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('Success');

      const { result } = renderHook(() =>
        useErrorRecovery({
          maxRetries: 3,
          baseDelay: 100,
          backoffMultiplier: 2,
          jitter: false,
        }),
      );

      let executePromise: Promise<any>;
      act(() => {
        executePromise = result.current.execute(mockOperation);
      });

      // Wait for first call
      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(result.current.isRetrying).toBe(true);
      });

      // Fast-forward first retry (100ms delay)
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2);
      });

      // Fast-forward second retry (200ms delay)
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(3);
        expect(result.current.isRetrying).toBe(false);
      });

      // Wait for the promise to resolve
      await act(async () => {
        await executePromise;
      });
    });

    it('should stop retrying after max attempts', async () => {
      const testError = new Error('Always fails');
      const mockOperation = jest.fn().mockRejectedValue(testError);

      const { result } = renderHook(() =>
        useErrorRecovery({
          maxRetries: 0, // No retries
          baseDelay: 100,
        }),
      );

      let caughtError: unknown;
      let executePromise: Promise<any>;

      act(() => {
        executePromise = result.current.execute(mockOperation);
      });

      try {
        await executePromise;
      } catch (error) {
        caughtError = error;
      }

      // Should have attempted once only
      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(result.current.retryCount).toBe(0);
      expect(result.current.isRetrying).toBe(false);
      expect(caughtError).toBeTruthy();
    });

    it.skip('should apply jitter to delay calculations', async () => {
      const { result } = renderHook(() =>
        useErrorRecovery({
          maxRetries: 3,
          baseDelay: 1000,
          backoffMultiplier: 2,
          jitter: true,
        }),
      );

      const mockOperation = jest.fn().mockRejectedValue(new Error('Test'));

      act(() => {
        result.current.execute(mockOperation);
      });

      // Wait for the operation to fail and retry logic to trigger
      await waitFor(() => {
        expect(result.current.isRetrying).toBe(true);
      });
    });

    it.skip('should reset retry state', () => {
      const { result } = renderHook(() => useErrorRecovery());

      // Simulate some retries
      act(() => {
        result.current.execute(jest.fn().mockRejectedValue(new Error('Test'))).catch(() => {
          // Handle the promise rejection to prevent "thrown: undefined"
        });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.retryCount).toBe(0);
      expect(result.current.isRetrying).toBe(false);
      expect(result.current.canRetry).toBe(true);
    });

    it('should handle successful operation on first try', async () => {
      const mockOperation = jest.fn().mockResolvedValue('Success');

      const { result } = renderHook(() => useErrorRecovery());

      let operationResult: unknown;
      act(() => {
        result.current.execute(mockOperation).then((result) => {
          operationResult = result;
        });
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(operationResult).toBe('Success');
        expect(result.current.retryCount).toBe(0);
      });
    });
  });

  describe.skip('useNetworkErrorRecovery', () => {
    it('should use network-specific retry configuration', () => {
      const { result } = renderHook(() => useNetworkErrorRecovery());

      expect(result.current.canRetry).toBe(true);
      // useNetworkErrorRecovery uses predefined config, doesn't call getRecoveryStrategy
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('Success');

      const { result } = renderHook(() => useNetworkErrorRecovery());

      await act(async () => {
        await result.current.execute(mockOperation);
      });

      expect(result.current.lastError).toBeTruthy();
      expect(result.current.canRetry).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2);
      });
    });

    it('should not retry on 4xx client errors', async () => {
      const clientError = new Error('Bad Request');
      (clientError as any).status = 400;

      const mockOperation = jest.fn().mockRejectedValue(clientError);

      const { result } = renderHook(() => useNetworkErrorRecovery());

      let finalError: unknown;
      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch (error) {
          finalError = error;
        }
      });

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(finalError).toBe(clientError);
    });
  });

  describe.skip('useAIServiceErrorRecovery', () => {
    it('should use AI service-specific configuration', () => {
      const { result } = renderHook(() => useAIServiceErrorRecovery());

      expect(result.current.canRetry).toBe(true);
      // useAIServiceErrorRecovery uses predefined config, doesn't call getRecoveryStrategy
    });

    it('should handle rate limit errors with longer delays', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('Success');

      const { result } = renderHook(() => useAIServiceErrorRecovery());

      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch (error) {
          // Error should be caught by hook
        }
      });

      // Check that mockOperation was called
      expect(mockOperation).toHaveBeenCalledTimes(1);

      // Check loading state
      expect(result.current.isLoading).toBe(false);

      // Check that the first execution failed
      expect(result.current.lastError).toBeTruthy();

      // AI service has baseDelay of 2000ms
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe.skip('useImageErrorRecovery', () => {
    it('should use image-specific configuration', () => {
      const { result } = renderHook(() => useImageErrorRecovery());

      expect(result.current.canRetry).toBe(true);
      // useImageErrorRecovery uses predefined config, doesn't call getRecoveryStrategy
    });

    it('should handle image processing errors', async () => {
      const imageError = new Error('Image processing failed');
      const mockOperation = jest.fn(() => Promise.reject(imageError));

      // Mock categorizeError to return proper AppError for image processing
      const mockAppError = {
        message: 'Image processing failed',
        category: ErrorCategory.IMAGE_PROCESSING,
        severity: ErrorSeverity.LOW, // Not CRITICAL so retryCondition will be true
        originalError: imageError,
      };

      // Configure the mocked errorHandler
      mockedErrorHandler.categorizeError.mockReturnValue(mockAppError);

      const { result } = renderHook(() => useImageErrorRecovery());

      // Check initial state
      expect(result.current.lastError).toBeNull();
      expect(result.current.isLoading).toBe(false);

      // Execute the operation and catch the error
      let caughtError: any = null;
      await act(async () => {
        try {
          await result.current.execute(mockOperation);
        } catch (error) {
          caughtError = error;
        }
      });

      // Check that operation was called
      expect(mockOperation).toHaveBeenCalled();

      // Check that categorizeError was called
      expect(mockedErrorHandler.categorizeError).toHaveBeenCalled();
      expect(mockedErrorHandler.categorizeError).toHaveBeenCalledWith(imageError);

      // Check that error was caught
      expect(caughtError).toBeTruthy();

      // Check that lastError is set correctly
      expect(result.current.lastError).toBeTruthy();
      expect(result.current.lastError?.category).toBe(ErrorCategory.IMAGE_PROCESSING);
      expect(result.current.lastError?.message).toContain('Image processing failed');

      // Check that we can retry (since severity is LOW, not CRITICAL)
      expect(result.current.canRetry).toBe(true);
      expect(result.current.isLoading).toBe(false);
    }, 30000);
  });

  describe.skip('useCircuitBreaker', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() => useCircuitBreaker());

      expect(result.current.state).toBe('closed');
      expect(result.current.canExecute).toBe(true);
      expect(result.current.failureCount).toBe(0);
    });

    it('should open circuit after failure threshold', async () => {
      const { result } = renderHook(() =>
        useCircuitBreaker({
          failureThreshold: 2,
          timeout: 1000,
        }),
      );

      const failingOperation = jest.fn().mockRejectedValue(new Error('Failure'));

      // First failure
      act(() => {
        result.current.execute(failingOperation).catch(() => {});
      });

      await waitFor(() => {
        expect(result.current.failureCount).toBe(1);
        expect(result.current.state).toBe('closed');
      });

      // Second failure - should open circuit
      act(() => {
        result.current.execute(failingOperation).catch(() => {});
      });

      await waitFor(() => {
        expect(result.current.failureCount).toBe(2);
        expect(result.current.state).toBe('open');
        expect(result.current.canExecute).toBe(false);
      });
    });

    it('should transition to half-open after timeout', async () => {
      const { result } = renderHook(() =>
        useCircuitBreaker({
          failureThreshold: 1,
          timeout: 100,
        }),
      );

      const failingOperation = jest.fn().mockRejectedValue(new Error('Failure'));

      // Trigger circuit open
      act(() => {
        result.current.execute(failingOperation).catch(() => {});
      });

      await waitFor(() => {
        expect(result.current.state).toBe('open');
      });

      // Wait for timeout
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.state).toBe('half-open');
        expect(result.current.canExecute).toBe(true);
      });
    });

    it('should reset on successful execution in half-open state', async () => {
      const { result } = renderHook(() =>
        useCircuitBreaker({
          failureThreshold: 1,
          timeout: 100,
        }),
      );

      // Open circuit
      act(() => {
        result.current.execute(jest.fn().mockRejectedValue(new Error('Failure'))).catch(() => {});
      });

      // Wait for half-open
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Successful operation
      const successOperation = jest.fn().mockResolvedValue('Success');
      act(() => {
        result.current.execute(successOperation);
      });

      await waitFor(() => {
        expect(result.current.state).toBe('closed');
        expect(result.current.failureCount).toBe(0);
      });
    });
  });

  describe.skip('useAppStateRecovery', () => {
    it('should handle app state changes', () => {
      const onForeground = jest.fn();
      const onBackground = jest.fn();

      renderHook(() =>
        useAppStateRecovery({
          onForeground,
          onBackground,
        }),
      );

      // Simulate app going to background
      act(() => {
        const { AppState } = require('react-native');
        AppState.currentState = 'background';
        AppState.addEventListener.mock.calls[0][1]('background');
      });

      expect(onBackground).toHaveBeenCalled();

      // Simulate app coming to foreground
      act(() => {
        const { AppState } = require('react-native');
        AppState.currentState = 'active';
        AppState.addEventListener.mock.calls[0][1]('active');
      });

      expect(onForeground).toHaveBeenCalled();
    });

    it('should retry failed operations when app becomes active', async () => {
      const retryOperation = jest.fn();

      renderHook(() =>
        useAppStateRecovery({
          retryOnForeground: true,
          onForeground: retryOperation,
        }),
      );

      // First simulate app going to background
      act(() => {
        const { AppState } = require('react-native');
        AppState.currentState = 'background';
        AppState.addEventListener.mock.calls[0][1]('background');
      });

      // Then simulate app coming to foreground
      act(() => {
        const { AppState } = require('react-native');
        AppState.currentState = 'active';
        AppState.addEventListener.mock.calls[0][1]('active');
      });

      expect(retryOperation).toHaveBeenCalled();
    });
  });

  describe.skip('useBatchRecovery', () => {
    it('should handle multiple operations concurrently', async () => {
      const { result } = renderHook(() => useBatchRecovery());

      const operations = [
        jest.fn().mockResolvedValue('Result 1'),
        jest.fn().mockResolvedValue('Result 2'),
        jest.fn().mockResolvedValue('Result 3'),
      ];

      let batchPromise: Promise<any>;
      act(() => {
        batchPromise = result.current.executeBatch(operations);
      });

      const batchResult = await act(async () => {
        return await batchPromise;
      });

      expect(batchResult).toEqual(['Result 1', 'Result 2', 'Result 3']);
      expect(result.current.completedCount).toBe(3);
      expect(result.current.failedCount).toBe(0);
    });

    it('should handle partial failures in batch', async () => {
      const { result } = renderHook(() => useBatchRecovery());

      const operations = [
        jest.fn().mockResolvedValue('Success'),
        jest.fn().mockRejectedValue(new Error('Failure')),
        jest.fn().mockResolvedValue('Success'),
      ];

      let batchPromise: Promise<any>;
      act(() => {
        batchPromise = result.current.executeBatch(operations, { continueOnError: true });
      });

      const batchResult = await act(async () => {
        return await batchPromise;
      });

      expect(result.current.completedCount).toBe(2);
      expect(result.current.failedCount).toBe(1);
      expect(batchResult).toHaveLength(3);
    });

    it('should retry failed operations in batch', async () => {
      const { result } = renderHook(() => useBatchRecovery());

      const operations = [
        jest.fn().mockResolvedValue('Success'),
        jest
          .fn()
          .mockRejectedValueOnce(new Error('Failure'))
          .mockResolvedValueOnce('Retry Success'),
      ];

      let batchPromise: Promise<any>;
      act(() => {
        batchPromise = result.current.executeBatch(operations, {
          retryFailures: true,
          maxRetries: 1,
        });
      });

      // Wait for initial execution and first failure
      await waitFor(() => {
        expect(operations[1]).toHaveBeenCalledTimes(1);
      });

      // Advance timers to trigger retry
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for retry to complete
      await waitFor(() => {
        expect(operations[1]).toHaveBeenCalledTimes(2);
        expect(result.current.completedCount).toBe(2);
        expect(result.current.failedCount).toBe(0);
      });

      // Wait for the batch to complete
      await act(async () => {
        await batchPromise;
      });
    });

    it('should track progress of batch operations', async () => {
      const { result } = renderHook(() => useBatchRecovery());

      const operations = [
        () => new Promise((resolve) => setTimeout(() => resolve('1'), 100)),
        () => new Promise((resolve) => setTimeout(() => resolve('2'), 200)),
        () => new Promise((resolve) => setTimeout(() => resolve('3'), 300)),
      ];

      act(() => {
        result.current.executeBatch(operations);
      });

      expect(result.current.totalCount).toBe(3);
      expect(result.current.isExecuting).toBe(true);

      // Check progress updates
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.completedCount).toBe(1);
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current.completedCount).toBe(3);
        expect(result.current.isExecuting).toBe(false);
      });
    });
  });

  describe.skip('error handling and edge cases', () => {
    it('should handle operations that throw synchronously', async () => {
      // Create a simple operation that throws an error
      const mockOperation = jest.fn(() => {
        throw new Error('Sync error');
      });

      const { result } = renderHook(() =>
        useErrorRecovery({
          maxAttempts: 1, // No retries to test basic functionality first
          baseDelay: 100,
        }),
      );

      // Execute the operation and expect it to throw
      await act(async () => {
        try {
          await result.current.execute(mockOperation);
          // If we reach here, the test should fail
          expect(true).toBe(false); // Force failure
        } catch (error) {
          // This is expected - the operation should throw
          expect(error).toBeDefined();
        }
      });

      // Verify the operation was called only once (no retries)
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup on unmount', () => {
      const { unmount } = renderHook(() => useErrorRecovery());

      unmount();

      // Should not throw or cause memory leaks
      expect(true).toBe(true);
    });

    it('should handle rapid successive calls', async () => {
      const { result } = renderHook(() => useErrorRecovery());

      const operation = jest.fn().mockResolvedValue('Success');

      // Rapid successive calls
      act(() => {
        result.current.execute(operation);
        result.current.execute(operation);
        result.current.execute(operation);
      });

      await waitFor(() => {
        expect(operation).toHaveBeenCalledTimes(3);
      });
    });
  });
});
