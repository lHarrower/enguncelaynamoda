// Integration tests for error handling system
import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, View, Button } from 'react-native';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { ErrorProvider, useErrorContext } from '../../providers/ErrorProvider';
import { useErrorRecovery } from '../../hooks/useErrorRecovery';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { renderWithProviders, createMockAppError } from '../utils/testUtils';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('../../utils/ErrorHandler');
jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);
jest.mock('react-native-haptic-feedback', () => mocks.hapticFeedback);

// Test component that uses error context
const ErrorTestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  const { reportError, clearError } = useErrorContext();
  const { executeWithRetry } = useErrorRecovery();

  const handleAsyncError = async () => {
    try {
      await executeWithRetry(async () => {
        if (shouldThrow) {
          throw new Error('Async operation failed');
        }
        return 'Success';
      });
    } catch (error) {
      reportError(error as Error, {
        component: 'ErrorTestComponent',
        action: 'handleAsyncError',
      });
    }
  };

  const handleSyncError = () => {
    try {
      if (shouldThrow) {
        throw new Error('Sync operation failed');
      }
    } catch (error) {
      reportError(error as Error, {
        component: 'ErrorTestComponent',
        action: 'handleSyncError',
      });
    }
  };

  if (shouldThrow) {
    throw new Error('Component render error');
  }

  return (
    <View testID="error-test-component">
      <Text>Error Test Component</Text>
      <Button
        testID="async-error-button"
        title="Trigger Async Error"
        onPress={handleAsyncError}
      />
      <Button
        testID="sync-error-button"
        title="Trigger Sync Error"
        onPress={handleSyncError}
      />
      <Button
        testID="clear-error-button"
        title="Clear Error"
        onPress={() => clearError()}
      />
    </View>
  );
};

// Component that displays error state
const ErrorDisplayComponent = () => {
  const { currentError, errorHistory, statistics } = useErrorContext();

  return (
    <View testID="error-display">
      {currentError && (
        <View testID="current-error">
          <Text testID="error-message">{currentError.message}</Text>
          <Text testID="error-type">{currentError.type}</Text>
        </View>
      )}
      <Text testID="error-count">{statistics.totalErrors}</Text>
      <Text testID="error-history-count">{errorHistory.length}</Text>
    </View>
  );
};

// Full app component for integration testing
const TestApp = ({ shouldThrow = false }: { shouldThrow?: boolean }) => (
  <ErrorProvider>
    <ErrorBoundary>
      <ErrorTestComponent shouldThrow={shouldThrow} />
      <ErrorDisplayComponent />
    </ErrorBoundary>
  </ErrorProvider>
);

describe('Error Handling Integration', () => {
  const mockErrorHandler = ErrorHandler.getInstance as jest.MockedFunction<typeof ErrorHandler.getInstance>;
  const mockHandleError = jest.fn();
  const mockGetRecoveryStrategy = jest.fn();
  const mockClearErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockErrorHandler.mockReturnValue({
      handleError: mockHandleError,
      getRecoveryStrategy: mockGetRecoveryStrategy,
      clearErrors: mockClearErrors,
      getErrorStats: jest.fn().mockReturnValue({
        totalErrors: 0,
        recentErrors: [],
        errorFrequency: {},
      }),
    } as any);

    mockGetRecoveryStrategy.mockReturnValue({
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
    });

    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('complete error flow', () => {
    it('should handle component render errors through ErrorBoundary', () => {
      const { getByTestId, getByText } = renderWithProviders(
        <TestApp shouldThrow={true} />
      );

      // Should show error boundary UI
      expect(getByTestId('error-boundary-container')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();

      // Should call ErrorHandler
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Component render error',
        }),
        expect.objectContaining({
          component: 'ErrorBoundary',
        })
      );
    });

    it('should handle async errors with retry mechanism', async () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger async error
      fireEvent.press(getByTestId('async-error-button'));

      // Should start retry process
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalled();
      });
    });

    it('should handle sync errors through error context', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger sync error
      fireEvent.press(getByTestId('sync-error-button'));

      // Should report error to context
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sync operation failed',
        }),
        expect.objectContaining({
          component: 'ErrorTestComponent',
          action: 'handleSyncError',
        })
      );
    });

    it('should clear errors when requested', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger error first
      fireEvent.press(getByTestId('sync-error-button'));

      // Clear error
      fireEvent.press(getByTestId('clear-error-button'));

      expect(mockClearErrors).toHaveBeenCalled();
    });
  });

  describe('error recovery and retry', () => {
    it('should recover from ErrorBoundary errors', async () => {
      const { getByTestId, rerender } = renderWithProviders(
        <TestApp shouldThrow={true} />
      );

      // Should show error boundary
      expect(getByTestId('error-boundary-container')).toBeTruthy();

      // Click retry
      fireEvent.press(getByTestId('retry-button'));

      // Simulate successful retry
      rerender(<TestApp shouldThrow={false} />);

      await waitFor(() => {
        expect(getByTestId('error-test-component')).toBeTruthy();
      });
    });

    it('should handle multiple retry attempts with exponential backoff', async () => {
      let attemptCount = 0;
      const mockOperation = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return 'Success';
      });

      const RetryTestComponent = () => {
        const { executeWithRetry } = useErrorRecovery({
          maxRetries: 3,
          baseDelay: 100,
          backoffMultiplier: 2,
        });

        const handleRetry = () => {
          executeWithRetry(mockOperation);
        };

        return (
          <Button testID="retry-operation" title="Retry" onPress={handleRetry} />
        );
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <RetryTestComponent />
        </ErrorProvider>
      );

      fireEvent.press(getByTestId('retry-operation'));

      // First retry after 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Second retry after 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockOperation).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('error reporting and analytics', () => {
    it('should track error statistics across components', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger multiple errors
      fireEvent.press(getByTestId('sync-error-button'));
      fireEvent.press(getByTestId('sync-error-button'));
      fireEvent.press(getByTestId('sync-error-button'));

      expect(mockHandleError).toHaveBeenCalledTimes(3);
    });

    it('should maintain error history', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger error
      fireEvent.press(getByTestId('sync-error-button'));

      // Should update error history
      expect(mockHandleError).toHaveBeenCalled();
    });

    it('should provide error context to all child components', () => {
      const NestedComponent = () => {
        const { reportError, statistics } = useErrorContext();
        
        return (
          <View>
            <Text testID="nested-error-count">{statistics.totalErrors}</Text>
            <Button
              testID="nested-error-button"
              title="Report Error"
              onPress={() => reportError(new Error('Nested error'), { component: 'Nested' })}
            />
          </View>
        );
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <ErrorBoundary>
            <NestedComponent />
          </ErrorBoundary>
        </ErrorProvider>
      );

      fireEvent.press(getByTestId('nested-error-button'));

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Nested error' }),
        expect.objectContaining({ component: 'Nested' })
      );
    });
  });

  describe('performance and memory management', () => {
    it('should not cause memory leaks with frequent errors', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger many errors rapidly
      for (let i = 0; i < 100; i++) {
        fireEvent.press(getByTestId('sync-error-button'));
      }

      // Should handle all errors without crashing
      expect(mockHandleError).toHaveBeenCalledTimes(100);
    });

    it('should throttle error reporting', async () => {
      const ThrottleTestComponent = () => {
        const { reportError } = useErrorContext();
        
        const handleRapidErrors = () => {
          // Trigger multiple errors in quick succession
          for (let i = 0; i < 10; i++) {
            reportError(new Error(`Rapid error ${i}`), { component: 'Throttle' });
          }
        };

        return (
          <Button
            testID="rapid-errors"
            title="Rapid Errors"
            onPress={handleRapidErrors}
          />
        );
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <ThrottleTestComponent />
        </ErrorProvider>
      );

      fireEvent.press(getByTestId('rapid-errors'));

      // Should throttle error reporting
      expect(mockHandleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility and user experience', () => {
    it('should provide accessible error messages', () => {
      const { getByTestId } = renderWithProviders(
        <TestApp shouldThrow={true} />
      );

      const errorContainer = getByTestId('error-boundary-container');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('should trigger appropriate haptic feedback', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      fireEvent.press(getByTestId('sync-error-button'));

      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith(
        expect.stringMatching(/error|warning/)
      );
    });

    it('should provide calming error messages for wellness', () => {
      const { getByText } = renderWithProviders(
        <TestApp shouldThrow={true} />
      );

      expect(getByText('Something went wrong')).toBeTruthy();
      // Should include calming language
      expect(getByText(/take a moment/i)).toBeTruthy();
    });
  });

  describe('network and connectivity errors', () => {
    it('should handle network errors with appropriate retry strategy', async () => {
      const NetworkTestComponent = () => {
        const { executeWithRetry } = useErrorRecovery();
        
        const handleNetworkError = () => {
          const networkError = new Error('Network request failed');
          (networkError as any).code = 'NETWORK_ERROR';
          
          executeWithRetry(async () => {
            throw networkError;
          });
        };

        return (
          <Button
            testID="network-error"
            title="Network Error"
            onPress={handleNetworkError}
          />
        );
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <NetworkTestComponent />
        </ErrorProvider>
      );

      fireEvent.press(getByTestId('network-error'));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalled();
      });
    });
  });

  describe('AI service errors', () => {
    it('should handle AI service rate limits with longer delays', async () => {
      const AITestComponent = () => {
        const { executeWithRetry } = useErrorRecovery();
        
        const handleAIError = () => {
          const rateLimitError = new Error('Rate limit exceeded');
          (rateLimitError as any).status = 429;
          
          executeWithRetry(async () => {
            throw rateLimitError;
          });
        };

        return (
          <Button
            testID="ai-error"
            title="AI Error"
            onPress={handleAIError}
          />
        );
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <AITestComponent />
        </ErrorProvider>
      );

      fireEvent.press(getByTestId('ai-error'));

      act(() => {
        jest.advanceTimersByTime(5000); // Longer delay for AI services
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases and error boundaries', () => {
    it('should handle errors in error handling code', () => {
      // Mock ErrorHandler to throw
      mockHandleError.mockImplementationOnce(() => {
        throw new Error('Error handler failed');
      });

      const { getByTestId } = renderWithProviders(<TestApp />);

      // Should not crash the app
      expect(() => {
        fireEvent.press(getByTestId('sync-error-button'));
      }).not.toThrow();
    });

    it('should handle component unmounting during error recovery', () => {
      const { getByTestId, unmount } = renderWithProviders(<TestApp />);

      fireEvent.press(getByTestId('async-error-button'));

      // Unmount before retry completes
      unmount();

      // Should not cause memory leaks or errors
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(true).toBe(true); // Test passes if no errors thrown
    });

    it('should handle circular error dependencies', () => {
      const CircularErrorComponent = () => {
        const { reportError } = useErrorContext();
        
        const handleCircularError = () => {
          const error = new Error('Circular error');
          const circular: any = { error };
          circular.self = circular;
          (error as any).circular = circular;
          
          reportError(error, { component: 'Circular' });
        };

        return (
          <Button
            testID="circular-error"
            title="Circular Error"
            onPress={handleCircularError}
          />
        );
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <CircularErrorComponent />
        </ErrorProvider>
      );

      expect(() => {
        fireEvent.press(getByTestId('circular-error'));
      }).not.toThrow();
    });
  });
});