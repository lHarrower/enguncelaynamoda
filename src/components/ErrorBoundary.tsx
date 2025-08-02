import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../constants/AppConstants';
import { BaseComponentProps } from '../types/componentProps';

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

  componentDidCatch(error: Error, info: any) {
    console.error('Uncaught error:', error, info);
    // You can log the error to an error reporting service here
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
          testID={testID}
          accessibilityLabel={accessibilityLabel || 'Error screen'}
        >
          <LinearGradient
            colors={['#FEFEFE', '#FFF8F5']}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={64}
                color="#FF6B6B"
              />
            </View>
            
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>
              {fallbackMessage}
            </Text>
            
            {showErrorDetails && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={this.handleReset}
              accessibilityLabel="Try again button"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#B8918F', '#A67C7A']}
                style={styles.buttonGradient}
              >
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
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  } as ViewStyle,
  iconContainer: {
    marginBottom: SPACING.lg,
  } as ViewStyle,
  title: {
    fontSize: TYPOGRAPHY.serif.sizes.title,
    fontWeight: TYPOGRAPHY.serif.weights.bold as TextStyle['fontWeight'],
    color: '#2D2D2D',
    marginBottom: SPACING.md,
    textAlign: 'center',
  } as TextStyle,
  message: {
    fontSize: TYPOGRAPHY.sans.sizes.body,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sans.lineHeight.body,
    marginBottom: SPACING.xxxl,
  } as TextStyle,
  errorDetails: {
    backgroundColor: '#FFF0F0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.xxxl,
    width: '100%',
    maxWidth: 400,
  } as ViewStyle,
  errorTitle: {
    fontSize: TYPOGRAPHY.sans.sizes.bodySmall,
    fontWeight: TYPOGRAPHY.sans.weights.bold as TextStyle['fontWeight'],
    color: '#FF6B6B',
    marginBottom: SPACING.xs,
  } as TextStyle,
  errorText: {
    fontSize: TYPOGRAPHY.sans.sizes.caption,
    color: '#666',
    lineHeight: TYPOGRAPHY.sans.lineHeight.caption,
  } as TextStyle,
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
    fontSize: TYPOGRAPHY.sans.sizes.body,
    fontWeight: TYPOGRAPHY.sans.weights.semibold as TextStyle['fontWeight'],
    color: '#FFFFFF',
  } as TextStyle,
});