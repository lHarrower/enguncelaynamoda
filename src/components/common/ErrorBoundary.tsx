import { Ionicons } from '@expo/vector-icons';
import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { errorInDev } from '@/utils/consoleSuppress';

// Type declaration for __DEV__ global
declare const __DEV__: boolean;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    errorInDev('ErrorBoundary caught an error:', error, errorInfo);

    // In development, you might want to send this to a crash reporting service
    if (__DEV__) {
      errorInDev('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={48} color={DesignSystem.colors.gold[500]} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              accessibilityHint="Retry the operation that failed"
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorDetails: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.sage[100],
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 1,
    marginBottom: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.md,
  },
  errorText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    fontFamily: 'monospace',
  },
  iconContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: DesignSystem.borderRadius.sm,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    ...DesignSystem.elevation.soft,
  },
  retryButtonText: {
    ...DesignSystem.typography.scale.button,
    color: DesignSystem.colors.text.inverse,
    textAlign: 'center',
  },
  subtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '400',
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
});
