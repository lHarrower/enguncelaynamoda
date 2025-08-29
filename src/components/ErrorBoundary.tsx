import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { BORDER_RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/AppConstants';
import { DesignSystem } from '@/theme/DesignSystem';
import { BaseComponentProps } from '@/types/componentProps';
import { errorInDev } from '@/utils/consoleSuppress';

interface ErrorBoundaryProps extends BaseComponentProps {
  children: React.ReactNode;
  /** Custom error message to display */
  fallbackMessage?: string;
  /** Callback when user attempts to recover from error */
  onRetry?: () => void;
  /** Whether to show error details in development */
  showErrorDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    errorInDev('Uncaught error:', error, info.componentStack);
    // You can log the error to an error reporting service here

    // Announce error for accessibility
    AccessibilityInfo.announceForAccessibility(
      'An error occurred. Please try again or contact support if the problem persists.',
    );
  }

  handleReset = () => {
    const { onRetry } = this.props;
    this.setState({ hasError: false, error: null });
    onRetry?.();
  };

  static defaultProps: Partial<ErrorBoundaryProps> = {
    fallbackMessage: 'Something went wrong. Please try again.',
    showErrorDetails: __DEV__,
  };

  render() {
    const { fallbackMessage, showErrorDetails, style, testID, accessibilityLabel } = this.props;

    if (this.state.hasError) {
      return (
        <View
          style={[styles.container, style]}
          testID={testID || 'error-boundary-container'}
          accessibilityLabel={accessibilityLabel || 'An error occurred in the application'}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <LinearGradient colors={['#FEFEFE', '#FFF8F5']} style={StyleSheet.absoluteFillObject} />

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
            </View>

            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>
              Don&apos;t worry, {fallbackMessage} We&apos;re here to help.
            </Text>

            {showErrorDetails && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              testID="error-retry-button"
              accessibilityLabel="Try again"
              accessibilityRole="button"
              accessibilityHint="Double tap to retry the failed operation"
            >
              <LinearGradient colors={['#B8918F', '#A67C7A']} style={styles.buttonGradient}>
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.soft,
  } as ViewStyle,
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  } as ViewStyle,
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold as TextStyle['fontWeight'],
    color: DesignSystem.colors.text.inverse,
  } as TextStyle,
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  } as ViewStyle,
  errorDetails: {
    backgroundColor: DesignSystem.colors.error.light,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.xxxl,
    width: '100%',
    maxWidth: 400,
  } as ViewStyle,
  errorText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: DesignSystem.colors.text.tertiary,
    lineHeight: TYPOGRAPHY.lineHeights.caption,
  } as TextStyle,
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.weights.bold as TextStyle['fontWeight'],
    color: DesignSystem.colors.error.main,
    marginBottom: SPACING.xs,
  } as TextStyle,
  iconContainer: {
    marginBottom: SPACING.lg,
  } as ViewStyle,
  message: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.body,
    marginBottom: SPACING.xxxl,
  } as TextStyle,
  title: {
    fontSize: TYPOGRAPHY.sizes.title,
    fontWeight: TYPOGRAPHY.weights.bold as TextStyle['fontWeight'],
    color: DesignSystem.colors.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  } as TextStyle,
});
