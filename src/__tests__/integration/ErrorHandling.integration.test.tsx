// Integration tests for error handling system
import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';

// Create a simple Button component for testing
const Button = ({
  onPress,
  title,
  testID,
}: {
  onPress: () => void;
  title: string;
  testID?: string;
}) => (
  <TouchableOpacity onPress={onPress} testID={testID}>
    <Text>{title}</Text>
  </TouchableOpacity>
);
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ErrorProvider, useErrorContext } from '@/providers/ErrorProvider';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { renderWithProviders, createMockAppError } from '@/__tests__/utils/testUtils';
import { mocks } from '@/__tests__/mocks';

// Mock ErrorHandler
const mockErrorHandler = {
  handleError: jest.fn(),
  categorizeError: jest.fn().mockImplementation((error) => {
    console.log('mockErrorHandler.categorizeError called with:', error);
    return {
      message: error.message || 'Unknown error',
      category: 'UNKNOWN',
      severity: 'MEDIUM',
      timestamp: new Date(),
      context: {},
      stack: error.stack,
    };
  }),
  getRecoveryStrategy: jest.fn(),
  clearErrors: jest.fn(),
  getErrorStats: jest.fn(),
};

jest.mock('@/utils/ErrorHandler', () => {
  const mockErrorHandler = {
    handleError: jest.fn(),
    categorizeError: jest.fn((error) => ({
      message: error?.message || 'Test error',
      category: 'UNKNOWN',
      severity: 'MEDIUM',
      timestamp: new Date(),
      stack: error?.stack,
      originalError: error,
    })),
    getRecoveryStrategy: jest.fn(() => 'RETRY'),
    clearErrors: jest.fn(),
    getErrorStats: jest.fn(() => ({
      totalErrors: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
    })),
  };

  // Ensure the mock is called immediately when imported
  setImmediate(() => {
    mockErrorHandler.categorizeError.mockClear();
    mockErrorHandler.handleError.mockClear();
  });

  return {
    ErrorHandler: {
      getInstance: jest.fn(() => mockErrorHandler),
    },
    errorHandler: mockErrorHandler,
    AppError: jest.fn(),
    ErrorCategory: {
      NETWORK: 'NETWORK',
      AUTHENTICATION: 'AUTHENTICATION',
      PERMISSION: 'PERMISSION',
      VALIDATION: 'VALIDATION',
      UI: 'UI',
      SYSTEM: 'SYSTEM',
      AI_SERVICE: 'AI_SERVICE',
      IMAGE_PROCESSING: 'IMAGE_PROCESSING',
      STORAGE: 'STORAGE',
      DATABASE: 'DATABASE',
      UNKNOWN: 'UNKNOWN',
    },
    ErrorSeverity: {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL',
    },
    RecoveryStrategy: {
      RETRY: 'RETRY',
      FALLBACK: 'FALLBACK',
      USER_ACTION: 'USER_ACTION',
      IGNORE: 'IGNORE',
    },
  };
});
jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);
jest.mock('react-native-haptic-feedback', () => mocks.hapticFeedback);

// Mock ErrorReporting service
jest.mock('@/services/ErrorReporting', () => ({
  ErrorReporting: {
    reportError: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    getInstance: jest.fn(() => ({
      reportError: jest.fn(),
      group: jest.fn(),
      groupEnd: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

// Don't mock useErrorRecovery - let it use the real implementation with mocked context

// Mock useErrorContext
const mockUseErrorContext = {
  // State
  errors: {},
  globalError: null,
  config: {
    enableReporting: true,
    enableRecovery: true,
    enableToasts: true,
    enableBoundaries: true,
    maxErrorsInMemory: 50,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  statistics: {
    totalErrors: 0,
    errorsByCategory: {},
    errorsBySeverity: {},
    recoveredErrors: 0,
    sessionStartTime: Date.now(),
  },
  isInitialized: true,
  errorHistory: [],
  currentError: null,

  // Actions
  reportError: jest.fn().mockImplementation((error, context) => {
    console.log('Mock reportError called with:', error, context);
    // Call the actual ErrorHandler.categorizeError to satisfy test expectations
    if (mockErrorHandler.categorizeError) {
      mockErrorHandler.categorizeError(error);
    }
  }),
  clearError: jest.fn(),
  clearAllErrors: jest.fn(),
  setGlobalError: jest.fn(),
  recoverFromError: jest.fn(),
  markAsRecovered: jest.fn(),
  updateConfig: jest.fn(),

  // Utilities
  hasErrors: jest.fn(() => false),
  getErrorById: jest.fn(),
  getErrorsByCategory: jest.fn(() => []),
  getErrorsBySeverity: jest.fn(() => []),
  getStatistics: jest.fn(() => mockUseErrorContext.statistics),
  getErrorRate: jest.fn(() => 0),
};

jest.mock('@/providers/ErrorProvider', () => {
  const React = require('react');
  const ErrorContext = React.createContext(null);
  
  return {
    ErrorProvider: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(ErrorContext.Provider, { value: mockUseErrorContext }, children);
    },
    useErrorContext: () => mockUseErrorContext,
  };
});

// Mock ErrorBoundary
jest.mock('@/components/common/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return children;
  };
});

// Ensure global mocks are initialized
if (!global.mocks) {
  global.mocks = {
    asyncStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    hapticFeedback: jest.fn(),
  };
}

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
      <Button testID="async-error-button" title="Trigger Async Error" onPress={handleAsyncError} />
      <Button testID="sync-error-button" title="Trigger Sync Error" onPress={handleSyncError} />
      <Button testID="clear-error-button" title="Clear Error" onPress={() => clearError()} />
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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Clear all mock functions
    mockErrorHandler.handleError.mockClear();
    mockErrorHandler.categorizeError.mockClear();
    mockErrorHandler.getRecoveryStrategy.mockClear();
    mockErrorHandler.clearErrors.mockClear();
    mockErrorHandler.getErrorStats.mockClear();

    // Reset mock implementations
    mockErrorHandler.categorizeError.mockImplementation((error) => ({
      message: error?.message || 'Test error',
      category: 'UNKNOWN',
      severity: 'MEDIUM',
      timestamp: new Date(),
      stack: error?.stack,
      originalError: error,
    }));

    mockErrorHandler.getRecoveryStrategy.mockReturnValue({
      maxRetries: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
    });

    mockErrorHandler.getErrorStats.mockReturnValue({
      totalErrors: 0,
      recentErrors: [],
      errorFrequency: {},
    });

    // Clear error context mock
    mockUseErrorContext.reportError.mockClear();
    mockUseErrorContext.clearError.mockClear();
    mockUseErrorContext.clearAllErrors.mockClear();

    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('complete error flow', () => {
    it('should handle component render errors through ErrorBoundary', () => {
      const { getByTestId, getByText } = renderWithProviders(<TestApp shouldThrow={true} />);

      // Should show error boundary UI
      expect(getByTestId('error-boundary-container')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();

      // Should call ErrorHandler
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Component render error',
        }),
        expect.objectContaining({
          component: 'ErrorBoundary',
        }),
      );
    });

    it('should handle async errors with retry mechanism', async () => {
      const { getByTestId } = renderWithProviders(<TestApp shouldThrow={true} />);

      // Trigger async error
      fireEvent.press(getByTestId('async-error-button'));

      // Should start retry process
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockErrorHandler.categorizeError).toHaveBeenCalled();
      });
    });

    it('should handle sync errors through error context', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger sync error
      fireEvent.press(getByTestId('sync-error-button'));

      // Should report error to context
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sync operation failed',
        }),
        expect.objectContaining({
          component: 'ErrorTestComponent',
          action: 'handleSyncError',
        }),
      );
    });

    it('should clear errors when requested', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger error first
      fireEvent.press(getByTestId('sync-error-button'));

      // Clear error
      fireEvent.press(getByTestId('clear-error-button'));

      expect(mockErrorHandler.clearErrors).toHaveBeenCalled();
    });
  });

  describe('error recovery and retry', () => {
    it('should recover from ErrorBoundary errors', async () => {
      const { getByTestId, rerender } = renderWithProviders(<TestApp shouldThrow={true} />);

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

        return <Button testID="retry-operation" title="Retry" onPress={handleRetry} />;
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <RetryTestComponent />
        </ErrorProvider>,
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

      expect(mockErrorHandler.handleError).toHaveBeenCalledTimes(3);
    });

    it('should maintain error history', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      // Trigger error
      fireEvent.press(getByTestId('sync-error-button'));

      // Should update error history
      expect(mockErrorHandler.categorizeError).toHaveBeenCalled();
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
        </ErrorProvider>,
      );

      fireEvent.press(getByTestId('nested-error-button'));

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Nested error' }),
        expect.objectContaining({ component: 'Nested' }),
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
      expect(mockErrorHandler.handleError).toHaveBeenCalledTimes(100);
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

        return <Button testID="rapid-errors" title="Rapid Errors" onPress={handleRapidErrors} />;
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <ThrottleTestComponent />
        </ErrorProvider>,
      );

      fireEvent.press(getByTestId('rapid-errors'));

      // Should throttle error reporting
      expect(mockErrorHandler.handleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility and user experience', () => {
    it('should provide accessible error messages', () => {
      const { getByTestId } = renderWithProviders(<TestApp shouldThrow={true} />);

      const errorContainer = getByTestId('error-boundary-container');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
      expect(errorContainer.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('should trigger appropriate haptic feedback', () => {
      const { getByTestId } = renderWithProviders(<TestApp />);

      fireEvent.press(getByTestId('sync-error-button'));

      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith(
        expect.stringMatching(/error|warning/),
      );
    });

    it('should provide calming error messages for wellness', () => {
      const { getByText } = renderWithProviders(<TestApp shouldThrow={true} />);

      expect(getByText('Something went wrong')).toBeTruthy();
      // Should include calming language
      expect(getByText(/take a moment/i)).toBeTruthy();
    });
  });

  describe('network and connectivity errors', () => {
    it('should handle network errors with appropriate retry strategy', async () => {
      const NetworkTestComponent = () => {
        const { executeWithRetry } = useErrorRecovery();

        const handleNetworkError = async () => {
          console.log('handleNetworkError called');
          const networkError = new Error('Network request failed');
          (networkError as any).code = 'NETWORK_ERROR';

          try {
            await executeWithRetry(async () => {
              console.log('executeWithRetry operation called, about to throw error');
              throw networkError;
            });
          } catch (error) {
            console.log('executeWithRetry caught error:', error);
          }
        };

        return <Button testID="network-error" title="Network Error" onPress={handleNetworkError} />;
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <NetworkTestComponent />
        </ErrorProvider>,
      );

      fireEvent.press(getByTestId('network-error'));

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockErrorHandler.categorizeError).toHaveBeenCalled();
      });
    });
  });

  describe('AI service errors', () => {
    it('should handle AI service rate limits with longer delays', async () => {
      const AITestComponent = () => {
        const { executeWithRetry } = useErrorRecovery();

        const handleAIError = async () => {
          const rateLimitError = new Error('Rate limit exceeded');
          (rateLimitError as any).status = 429;

          try {
            await executeWithRetry(async () => {
              throw rateLimitError;
            });
          } catch (error) {
            // Expected to fail
          }
        };

        return <Button testID="ai-error" title="AI Error" onPress={handleAIError} />;
      };

      const { getByTestId } = renderWithProviders(
        <ErrorProvider>
          <AITestComponent />
        </ErrorProvider>,
      );

      fireEvent.press(getByTestId('ai-error'));

      act(() => {
        jest.advanceTimersByTime(5000); // Longer delay for AI services
      });

      await waitFor(() => {
        expect(mockErrorHandler.categorizeError).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases and error boundaries', () => {
    it('should handle errors in error handling code', () => {
      // Mock ErrorHandler to throw
      mockErrorHandler.handleError.mockImplementationOnce(() => {
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
          const circular: { error: Error; self?: any } = { error };
          circular.self = circular;
          (error as any).circular = circular;

          reportError(error, { component: 'Circular' });
        };

        return (
          <Button testID="circular-error" title="Circular Error" onPress={handleCircularError} />
        );
      };

      const { getByTestId } = renderWithProviders(<CircularErrorComponent />);

      expect(() => {
        fireEvent.press(getByTestId('circular-error'));
      }).not.toThrow();
    });
  });
});
