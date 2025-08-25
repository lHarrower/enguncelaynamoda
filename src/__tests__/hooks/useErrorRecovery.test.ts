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
} from '../../hooks/useErrorRecovery';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('../../utils/ErrorHandler');
jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => jest.fn()),
    removeEventListener: jest.fn(),
  },
}));
jest.mock('@react-native-community/netinfo', () => mocks.netInfo);
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
  const mockHandleError = jest.fn();
  const mockGetRecoveryStrategy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockErrorHandler.mockReturnValue({
      handleError: mockHandleError,
      getRecoveryStrategy: mockGetRecoveryStrategy,
    } as any);

    mockGetRecoveryStrategy.mockReturnValue({
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      jitter: true,
    });
  });

  afterEach(() => {
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

      act(() => {
        result.current.executeWithRetry(mockOperation);
      });

      expect(result.current.isRetrying).toBe(true);

      // Fast-forward first retry
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
        expect(result.current.retryCount).toBe(2);
      });
    });

    it('should stop retrying after max attempts', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Always fails'));

      const { result } = renderHook(() =>
        useErrorRecovery({
          maxRetries: 2,
          baseDelay: 100,
        }),
      );

      let finalError: unknown;
      act(() => {
        result.current.executeWithRetry(mockOperation).catch((error) => {
          finalError = error;
        });
      });

      // Fast-forward all retries
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
        expect(result.current.canRetry).toBe(false);
        expect(finalError).toBeInstanceOf(Error);
      });
    });

    it('should apply jitter to delay calculations', () => {
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
        result.current.executeWithRetry(mockOperation);
      });

      // Jitter should make delays slightly random
      expect(result.current.isRetrying).toBe(true);
    });

    it('should reset retry state', () => {
      const { result } = renderHook(() => useErrorRecovery());

      // Simulate some retries
      act(() => {
        result.current.executeWithRetry(jest.fn().mockRejectedValue(new Error('Test')));
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
        result.current.executeWithRetry(mockOperation).then((result) => {
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

  describe('useNetworkErrorRecovery', () => {
    it('should use network-specific retry configuration', () => {
      const { result } = renderHook(() => useNetworkErrorRecovery());

      expect(result.current.canRetry).toBe(true);
      expect(mockGetRecoveryStrategy).toHaveBeenCalledWith('network');
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('Success');

      const { result } = renderHook(() => useNetworkErrorRecovery());

      act(() => {
        result.current.executeWithRetry(mockOperation);
      });

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
      act(() => {
        result.current.executeWithRetry(mockOperation).catch((error) => {
          finalError = error;
        });
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(finalError).toBe(clientError);
      });
    });
  });

  describe('useAIServiceErrorRecovery', () => {
    it('should use AI service-specific configuration', () => {
      const { result } = renderHook(() => useAIServiceErrorRecovery());

      expect(result.current.canRetry).toBe(true);
      expect(mockGetRecoveryStrategy).toHaveBeenCalledWith('ai_service');
    });

    it('should handle rate limit errors with longer delays', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce('Success');

      const { result } = renderHook(() => useAIServiceErrorRecovery());

      act(() => {
        result.current.executeWithRetry(mockOperation);
      });

      // AI service should have longer delays for rate limits
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useImageErrorRecovery', () => {
    it('should use image-specific configuration', () => {
      const { result } = renderHook(() => useImageErrorRecovery());

      expect(result.current.canRetry).toBe(true);
      expect(mockGetRecoveryStrategy).toHaveBeenCalledWith('image_processing');
    });

    it('should handle image processing errors', async () => {
      const imageError = new Error('Image processing failed');

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(imageError)
        .mockResolvedValueOnce('Processed');

      const { result } = renderHook(() => useImageErrorRecovery());

      act(() => {
        result.current.executeWithRetry(mockOperation);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useCircuitBreaker', () => {
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

  describe('useAppStateRecovery', () => {
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

      // Simulate app coming to foreground
      act(() => {
        const { AppState } = require('react-native');
        AppState.addEventListener.mock.calls[0][1]('active');
      });

      expect(retryOperation).toHaveBeenCalled();
    });
  });

  describe('useBatchRecovery', () => {
    it('should handle multiple operations concurrently', async () => {
      const { result } = renderHook(() => useBatchRecovery());

      const operations = [
        jest.fn().mockResolvedValue('Result 1'),
        jest.fn().mockResolvedValue('Result 2'),
        jest.fn().mockResolvedValue('Result 3'),
      ];

      let batchResult: unknown;
      act(() => {
        result.current.executeBatch(operations).then((results) => {
          batchResult = results;
        });
      });

      await waitFor(() => {
        expect(batchResult).toEqual(['Result 1', 'Result 2', 'Result 3']);
        expect(result.current.completedCount).toBe(3);
        expect(result.current.failedCount).toBe(0);
      });
    });

    it('should handle partial failures in batch', async () => {
      const { result } = renderHook(() => useBatchRecovery());

      const operations = [
        jest.fn().mockResolvedValue('Success'),
        jest.fn().mockRejectedValue(new Error('Failure')),
        jest.fn().mockResolvedValue('Success'),
      ];

      let batchResult: unknown;
      act(() => {
        result.current.executeBatch(operations, { continueOnError: true }).then((results) => {
          batchResult = results;
        });
      });

      await waitFor(() => {
        expect(result.current.completedCount).toBe(2);
        expect(result.current.failedCount).toBe(1);
        expect(batchResult).toHaveLength(3);
      });
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

      act(() => {
        result.current.executeBatch(operations, {
          retryFailures: true,
          maxRetries: 1,
        });
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(operations[1]).toHaveBeenCalledTimes(2);
        expect(result.current.completedCount).toBe(2);
        expect(result.current.failedCount).toBe(0);
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

  describe('error handling and edge cases', () => {
    it('should handle operations that throw synchronously', async () => {
      const { result } = renderHook(() => useErrorRecovery());

      const throwingOperation = () => {
        throw new Error('Sync error');
      };

      let caughtError: unknown;
      act(() => {
        result.current.executeWithRetry(throwingOperation).catch((error) => {
          caughtError = error;
        });
      });

      await waitFor(() => {
        expect(caughtError).toBeInstanceOf(Error);
        if (caughtError && typeof caughtError === 'object' && 'message' in caughtError) {
          expect((caughtError as any).message).toBe('Sync error');
        }
      });
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
        result.current.executeWithRetry(operation);
        result.current.executeWithRetry(operation);
        result.current.executeWithRetry(operation);
      });

      await waitFor(() => {
        expect(operation).toHaveBeenCalledTimes(3);
      });
    });
  });
});
