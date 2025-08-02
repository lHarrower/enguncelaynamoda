// Unit tests for ErrorBoundary component
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { ErrorHandler } from '../../utils/ErrorHandler';
import { renderWithProviders } from '../utils/testUtils';
import { mocks } from '../mocks';

// Mock dependencies
jest.mock('../../utils/ErrorHandler');
jest.mock('react-native-haptic-feedback', () => mocks.hapticFeedback);
jest.mock('@react-native-async-storage/async-storage', () => mocks.asyncStorage);

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text testID="success-component">Success!</Text>;
};

// Test component that throws async error
const ThrowAsyncError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      Promise.reject(new Error('Async test error'));
    }
  }, [shouldThrow]);
  return <Text testID="async-component">Async Success!</Text>;
};

describe('ErrorBoundary', () => {
  const mockErrorHandler = ErrorHandler.getInstance as jest.MockedFunction<typeof ErrorHandler.getInstance>;
  const mockHandleError = jest.fn();
  const mockGetErrorStats = jest.fn();
  const mockClearErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorHandler.mockReturnValue({
      handleError: mockHandleError,
      getErrorStats: mockGetErrorStats,
      clearErrors: mockClearErrors,
    } as any);
    
    mockGetErrorStats.mockReturnValue({
      totalErrors: 0,
      recentErrors: [],
      errorFrequency: {},
    });

    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('normal operation', () => {
    it('should render children when no error occurs', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByTestId('success-component')).toBeTruthy();
    });

    it('should not interfere with normal component lifecycle', () => {
      const onMount = jest.fn();
      const TestComponent = () => {
        React.useEffect(onMount, []);
        return <Text>Normal component</Text>;
      };

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(onMount).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should catch and display error when child component throws', () => {
      const { getByTestId, getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('error-boundary-container')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('should call ErrorHandler when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          name: 'Error',
        }),
        expect.objectContaining({
          component: 'ErrorBoundary',
          action: 'componentDidCatch',
        })
      );
    });

    it('should handle different error types', () => {
      const TypeError = () => {
        throw new TypeError('Type error');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <TypeError />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Type error',
          name: 'TypeError',
        }),
        expect.any(Object)
      );
    });

    it('should handle errors with custom error info', () => {
      const customErrorInfo = {
        componentStack: 'in ThrowError\n    in ErrorBoundary',
      };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          errorInfo: expect.objectContaining({
            componentStack: expect.any(String),
          }),
        })
      );
    });
  });

  describe('error recovery', () => {
    it('should show retry button and allow recovery', async () => {
      const { getByTestId, rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('error-boundary-container')).toBeTruthy();
      
      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);

      // Simulate successful retry
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(getByTestId('success-component')).toBeTruthy();
      });
    });

    it('should reset error state on retry', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);

      expect(mockClearErrors).toHaveBeenCalled();
    });

    it('should trigger haptic feedback on retry', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('retry-button');
      fireEvent.press(retryButton);

      expect(mocks.hapticFeedback.trigger).toHaveBeenCalledWith('impactLight');
    });

    it('should handle multiple retry attempts', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('retry-button');
      
      // Multiple retry attempts
      fireEvent.press(retryButton);
      fireEvent.press(retryButton);
      fireEvent.press(retryButton);

      expect(mockClearErrors).toHaveBeenCalledTimes(3);
    });
  });

  describe('custom fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = ({ error, retry }: any) => (
        <View testID="custom-fallback">
          <Text>Custom Error: {error.message}</Text>
          <Text testID="custom-retry" onPress={retry}>Custom Retry</Text>
        </View>
      );

      const { getByTestId, getByText } = render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('custom-fallback')).toBeTruthy();
      expect(getByText('Custom Error: Test error')).toBeTruthy();
    });

    it('should pass error and retry function to custom fallback', () => {
      const CustomFallback = jest.fn(({ error, retry }) => (
        <View>
          <Text>{error.message}</Text>
          <Text testID="retry" onPress={retry}>Retry</Text>
        </View>
      ));

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(CustomFallback).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Test error' }),
          retry: expect.any(Function),
        }),
        {}
      );
    });
  });

  describe('error reporting and analytics', () => {
    it('should include component stack in error report', () => {
      render(
        <ErrorBoundary>
          <View>
            <ThrowError shouldThrow={true} />
          </View>
        </ErrorBoundary>
      );

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          errorInfo: expect.objectContaining({
            componentStack: expect.stringContaining('ThrowError'),
          }),
        })
      );
    });

    it('should track error frequency', () => {
      // First error
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Second error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockHandleError).toHaveBeenCalledTimes(2);
    });

    it('should include user context in error reports', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'ErrorBoundary',
          timestamp: expect.any(Number),
        })
      );
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = getByTestId('error-boundary-container');
      expect(container.props.accessibilityRole).toBe('alert');
      expect(container.props.accessibilityLabel).toBe('Error occurred');
    });

    it('should announce error to screen readers', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = getByTestId('error-boundary-container');
      expect(container.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('should have accessible retry button', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByTestId('retry-button');
      expect(retryButton.props.accessibilityRole).toBe('button');
      expect(retryButton.props.accessibilityLabel).toBe('Retry');
      expect(retryButton.props.accessibilityHint).toBe('Tap to try again');
    });
  });

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <Text>Test</Text>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Re-render with same props
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + rerender
    });

    it('should handle rapid error occurrences', () => {
      const RapidError = ({ count }: { count: number }) => {
        if (count > 0) {
          throw new Error(`Error ${count}`);
        }
        return <Text>Success</Text>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <RapidError count={1} />
        </ErrorBoundary>
      );

      rerender(
        <ErrorBoundary>
          <RapidError count={2} />
        </ErrorBoundary>
      );

      rerender(
        <ErrorBoundary>
          <RapidError count={3} />
        </ErrorBoundary>
      );

      // Should handle all errors without crashing
      expect(mockHandleError).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined children', () => {
      const { container } = render(
        <ErrorBoundary>
          {null}
          {undefined}
        </ErrorBoundary>
      );

      expect(container).toBeTruthy();
    });

    it('should handle errors in error boundary itself', () => {
      const BrokenFallback = () => {
        throw new Error('Fallback error');
      };

      // This should not crash the app
      expect(() => {
        render(
          <ErrorBoundary fallback={BrokenFallback}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );
      }).not.toThrow();
    });

    it('should handle very long error messages', () => {
      const LongError = () => {
        throw new Error('A'.repeat(1000));
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <LongError />
        </ErrorBoundary>
      );

      expect(getByTestId('error-boundary-container')).toBeTruthy();
    });

    it('should handle errors with circular references', () => {
      const CircularError = () => {
        const obj: any = { name: 'test' };
        obj.self = obj;
        const error = new Error('Circular error');
        (error as any).circular = obj;
        throw error;
      };

      const { getByTestId } = render(
        <ErrorBoundary>
          <CircularError />
        </ErrorBoundary>
      );

      expect(getByTestId('error-boundary-container')).toBeTruthy();
    });
  });

  describe('integration with providers', () => {
    it('should work with theme provider', () => {
      const { getByTestId } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('error-boundary-container')).toBeTruthy();
    });

    it('should work with navigation context', () => {
      const { getByTestId } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('error-boundary-container')).toBeTruthy();
    });
  });

  describe('wellness features', () => {
    it('should display calming error messages', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText(/take a moment/i)).toBeTruthy();
    });

    it('should provide breathing space in error UI', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = getByTestId('error-boundary-container');
      expect(container.props.style).toMatchObject({
        padding: expect.any(Number),
        margin: expect.any(Number),
      });
    });

    it('should use calming colors in error state', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const container = getByTestId('error-boundary-container');
      expect(container.props.style.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});