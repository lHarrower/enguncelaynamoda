import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';

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
    if (message.includes('non-existent domain') || 
        message.includes('votekgezalqzmjtzebgi') ||
        message.includes('network request failed')) {
      return {
        hasError: true,
        errorMessage: error.message,
        errorType: 'supabase'
      };
    }
    
    // Detect theme-related errors
    if (message.includes('cannot read property') && 
        (message.includes('sizes') || message.includes('primary') || 
         message.includes('fontsize') || message.includes('family') || 
         message.includes('body'))) {
      return {
        hasError: true,
        errorMessage: error.message,
        errorType: 'theme'
      };
    }
    
    // General network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        hasError: true,
        errorMessage: error.message,
        errorType: 'network'
      };
    }
    
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('Network Error Boundary caught an error:', error, errorInfo);
    
    // Show specific alert for Supabase issues
    if (error.message.includes('votekgezalqzmjtzebgi')) {
      setTimeout(() => {
        Alert.alert(
          'Configuration Error',
          'Invalid Supabase URL detected. Please check your .env file and update with a valid Supabase project URL.',
          [{ text: 'OK' }]
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
          message: 'Invalid Supabase configuration detected.\n\nPlease update your .env file with a valid Supabase project URL.',
          buttonText: 'Check Configuration'
        };
      case 'theme':
        return {
          title: '🎨 Theme Loading Error',
          message: 'Theme system failed to initialize.\n\nThis is likely due to network connectivity issues.',
          buttonText: 'Retry Loading'
        };
      case 'network':
        return {
          title: '🌐 Network Error',
          message: 'Unable to connect to services.\n\nPlease check your internet connection.',
          buttonText: 'Retry Connection'
        };
      default:
        return {
          title: '⚠️ Connection Issue',
          message: 'Something went wrong with the connection.\n\nPlease try again.',
          buttonText: 'Retry'
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const content = this.getErrorContent();
      
      return this.props.fallback || (
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
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
    lineHeight: 24,
  },
  codeContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    maxWidth: 350,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    color: '#856404',
    fontFamily: 'monospace',
  },
});