import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import { Ionicons } from '@expo/vector-icons';

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

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In development, you might want to send this to a crash reporting service
    if (__DEV__) {
      console.log('Error details:', {
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
              <Ionicons 
                name="warning-outline" 
                size={48} 
                color={ULTRA_PREMIUM_THEME.semantic.status.warning} 
              />
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={this.handleRetry}
              activeOpacity={0.8}
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
    flex: 1,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  title: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h2,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    textAlign: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.md,
    fontWeight: '400',
  },
  subtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xl,
  },
  errorDetails: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    borderRadius: ULTRA_PREMIUM_THEME.radius.sm,
    padding: ULTRA_PREMIUM_THEME.spacing.md,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  errorText: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingVertical: ULTRA_PREMIUM_THEME.spacing.md,
    borderRadius: ULTRA_PREMIUM_THEME.radius.sm,
    ...ULTRA_PREMIUM_THEME.elevation.subtle,
  },
  retryButtonText: {
    ...ULTRA_PREMIUM_THEME.typography.scale.button,
    color: ULTRA_PREMIUM_THEME.semantic.text.inverse,
    textAlign: 'center',
  },
});