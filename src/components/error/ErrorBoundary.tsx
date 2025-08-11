// Error Boundary - React error boundary components with graceful recovery
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import errorHandler, { AppError, ErrorCategory, ErrorSeverity, RecoveryAction } from '../../utils/ErrorHandler';
import { DesignSystem } from '@/theme/DesignSystem';

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: AppError, retry: () => void) => ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  category?: ErrorCategory;
  level?: 'screen' | 'component' | 'critical';
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, category = ErrorCategory.UI, level = 'component' } = this.props;
    
    // Determine severity based on level
    const severity = this.getSeverityFromLevel(level);
    
    // Create structured error
    const appError = errorHandler.createError(
      error,
      category,
      severity,
      {
        screen: 'ErrorBoundary',
        action: 'componentDidCatch',
        additionalData: {
          componentStack: errorInfo.componentStack,
          level,
          retryCount: this.state.retryCount
        }
      },
      {
        isRecoverable: level !== 'critical',
        retryable: this.props.enableRetry !== false,
        reportable: severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL
      }
    );
    
    // Handle the error
    errorHandler.handleError(appError);
    
    // Update state
    this.setState({
      error: appError,
      errorInfo
    });
    
    // Call custom error handler
    onError?.(appError, errorInfo);
  }
  
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
  
  private getSeverityFromLevel(level: string): ErrorSeverity {
    switch (level) {
      case 'critical':
        return ErrorSeverity.CRITICAL;
      case 'screen':
        return ErrorSeverity.HIGH;
      case 'component':
      default:
        return ErrorSeverity.MEDIUM;
    }
  }
  
  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };
  
  private handleRecoveryAction = (action: RecoveryAction) => {
    try {
      action.action();
      
      // Reset error state if it's a retry action
      if (action.strategy === 'retry') {
        this.handleRetry();
      }
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError);
    }
  };
  
  render() {
    const { hasError, error } = this.state;
    const { children, fallback, enableRetry = true, maxRetries = 3 } = this.props;
    
    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleRetry);
      }
      
      // Get recovery actions
      const recoveryActions = errorHandler.getRecoveryActions(error);
      const canRetry = enableRetry && this.state.retryCount < maxRetries;
      
      return (
        <ErrorFallback
          error={error}
          recoveryActions={recoveryActions}
          onRecoveryAction={this.handleRecoveryAction}
          canRetry={canRetry}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
        />
      );
    }
    
    return children;
  }
}

/**
 * Error Fallback Component
 */
interface ErrorFallbackProps {
  error: AppError;
  recoveryActions: RecoveryAction[];
  onRecoveryAction: (action: RecoveryAction) => void;
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  recoveryActions,
  onRecoveryAction,
  canRetry,
  retryCount,
  maxRetries
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
        </View>
        
        {/* Error Message */}
        <Text style={styles.title}>
          {error.severity === ErrorSeverity.CRITICAL ? 'Critical Error' : 'Something went wrong'}
        </Text>
        
        <Text style={styles.message}>
          {error.userMessage}
        </Text>
        
        {/* Error Details (for development) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Information:</Text>
            <Text style={styles.debugText}>ID: {error.id}</Text>
            <Text style={styles.debugText}>Category: {error.category}</Text>
            <Text style={styles.debugText}>Severity: {error.severity}</Text>
            <Text style={styles.debugText}>Retries: {retryCount}/{maxRetries}</Text>
            {error.message && (
              <Text style={styles.debugText}>Technical: {error.message}</Text>
            )}
          </View>
        )}
        
        {/* Recovery Actions */}
        <View style={styles.actionsContainer}>
          {recoveryActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                action.primary && styles.primaryActionButton,
                !canRetry && action.strategy === 'retry' && styles.disabledButton
              ]}
              onPress={() => onRecoveryAction(action)}
              disabled={!canRetry && action.strategy === 'retry'}
            >
              <Text style={[
                styles.actionButtonText,
                action.primary && styles.primaryActionButtonText,
                !canRetry && action.strategy === 'retry' && styles.disabledButtonText
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Retry Information */}
        {!canRetry && retryCount >= maxRetries && (
          <Text style={styles.retryInfo}>
            Maximum retry attempts reached. Please try a different action.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

/**
 * Screen-level Error Boundary
 */
export const ScreenErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="screen" />
);

/**
 * Component-level Error Boundary
 */
export const ComponentErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
);

/**
 * Critical Error Boundary (for app-level errors)
 */
export const CriticalErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="critical" enableRetry={false} />
);

/**
 * Wardrobe-specific Error Boundary
 */
export const WardrobeErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'category'>> = (props) => (
  <ErrorBoundary {...props} category={ErrorCategory.UI} />
);

/**
 * AI Service Error Boundary
 */
export const AIServiceErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'category'>> = (props) => (
  <ErrorBoundary {...props} category={ErrorCategory.AI_SERVICE} />
);

/**
 * Network Error Boundary
 */
export const NetworkErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'category'>> = (props) => (
  <ErrorBoundary {...props} category={ErrorCategory.NETWORK} />
);

/**
 * Higher-order component for error boundaries
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  message: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
    lineHeight: 24,
  },
  debugContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    padding: DesignSystem.spacing.md,
    borderRadius: 8,
    marginBottom: DesignSystem.spacing.lg,
    width: '100%',
  },
  debugTitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
  },
  debugText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs / 2,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    width: '100%',
    gap: DesignSystem.spacing.md,
  },
  actionButton: {
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
  },
  primaryActionButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderColor: DesignSystem.colors.primary[500],
  },
  disabledButton: {
  opacity: 0.6,
  },
  actionButtonText: {
    ...DesignSystem.typography.button.medium,
    color: DesignSystem.colors.text.primary,
  },
  primaryActionButtonText: {
    color: DesignSystem.colors.text.inverse,
  },
  disabledButtonText: {
    color: DesignSystem.colors.text.disabled,
  },
  retryInfo: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.md,
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;