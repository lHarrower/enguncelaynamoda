import React, { Component, ReactNode } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { errorInDev } from '@/utils/consoleSuppress';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  errorType?: 'network' | 'supabase' | 'theme' | 'general';
}

export class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const message = error.message.toLowerCase();

    // Detect Supabase domain issues
    if (
      message.includes('non-existent domain') ||
      message.includes('votekgezalqzmjtzebgi') ||
      message.includes('network request failed')
    ) {
      return {
        hasError: true,
        errorMessage: error.message,
        errorType: 'supabase',
      };
    }

    // Detect theme-related errors
    if (
      message.includes('cannot read property') &&
      (message.includes('sizes') ||
        message.includes('primary') ||
        message.includes('fontsize') ||
        message.includes('family') ||
        message.includes('body'))
    ) {
      return {
        hasError: true,
        errorMessage: error.message,
        errorType: 'theme',
      };
    }

    // General network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        hasError: true,
        errorMessage: error.message,
        errorType: 'network',
      };
    }

    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorInDev('Network Error Boundary caught an error:', error, errorInfo);

    // Show specific alert for Supabase issues
    if (error.message.includes('votekgezalqzmjtzebgi')) {
      setTimeout(() => {
        Alert.alert(
          'Configuration Error',
          'Invalid Supabase URL detected. Please check your .env file and update with a valid Supabase project URL.',
          [{ text: 'OK' }],
        );
      }, 1000);
    }
  }

  getErrorContent() {
    const { errorType } = this.state;

    switch (errorType) {
      case 'supabase':
        return {
          title: '🔧 Configuration Error',
          message:
            'Invalid Supabase configuration detected.\n\nPlease update your .env file with a valid Supabase project URL.',
          buttonText: 'Check Configuration',
        };
      case 'theme':
        return {
          title: '🎨 Theme Loading Error',
          message:
            'Theme system failed to initialize.\n\nThis is likely due to network connectivity issues.',
          buttonText: 'Retry Loading',
        };
      case 'network':
        return {
          title: '🌐 Network Error',
          message: 'Unable to connect to services.\n\nPlease check your internet connection.',
          buttonText: 'Retry Connection',
        };
      default:
        return {
          title: '⚠️ Connection Issue',
          message: 'Something went wrong with the connection.\n\nPlease try again.',
          buttonText: 'Retry',
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const content = this.getErrorContent();

      return (
        this.props.fallback || (
          <View style={styles.container}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.message}>{content.message}</Text>

            {this.state.errorType === 'supabase' && (
              <View style={styles.codeContainer}>
                <Text style={styles.codeTitle}>Expected format:</Text>
                <Text style={styles.codeText}>
                  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false })}
              accessibilityRole="button"
              accessibilityLabel={content.buttonText}
              accessibilityHint="Retry the failed operation"
            >
              <Text style={styles.retryText}>{content.buttonText}</Text>
            </TouchableOpacity>

            {__DEV__ && this.state.errorMessage && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>{this.state.errorMessage}</Text>
              </View>
            )}
          </View>
        )
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  codeContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: 350,
    padding: 16,
    width: '100%',
  },
  codeText: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: 4,
    color: DesignSystem.colors.text.secondary,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 8,
  },
  codeTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  debugContainer: {
    backgroundColor: DesignSystem.colors.warning[100],
    borderColor: DesignSystem.colors.warning[300],
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 350,
    padding: 12,
    width: '100%',
  },
  debugText: {
    color: DesignSystem.colors.warning[700],
    fontFamily: 'monospace',
    fontSize: 11,
  },
  debugTitle: {
    color: DesignSystem.colors.warning[700],
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  retryText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: DesignSystem.colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
});
