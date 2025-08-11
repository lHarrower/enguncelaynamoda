// Error States - Elegant error state components for various scenarios
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { AppError, ErrorCategory, ErrorSeverity, RecoveryAction } from '../../utils/ErrorHandler';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Base Error State Props
 */
interface BaseErrorStateProps {
  title?: string;
  message?: string;
  illustration?: string;
  actions?: RecoveryAction[];
  onActionPress?: (action: RecoveryAction) => void;
  style?: any;
}

/**
 * Network Error State
 */
export const NetworkErrorState: React.FC<BaseErrorStateProps> = ({
  title = "Connection Lost",
  message = "Take a moment to breathe. Check your connection and we'll try again together.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>📡</Text>
        <View style={styles.illustrationAccent} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * AI Service Error State
 */
export const AIServiceErrorState: React.FC<BaseErrorStateProps> = ({
  title = "AI Stylist Unavailable",
  message = "Our AI stylist is taking a quick break. Please try again in a moment.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🤖</Text>
  <View style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.lilac[600] }]} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * Image Processing Error State
 */
export const ImageErrorState: React.FC<BaseErrorStateProps> = ({
  title = "Image Processing Failed",
  message = "This image needs a different approach. Try another one that speaks to you.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🖼️</Text>
  <View style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.coral[400] }]} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * Authentication Error State
 */
export const AuthErrorState: React.FC<BaseErrorStateProps> = ({
  title = "Authentication Required",
  message = "Let's get you back on track. Please sign in again to continue your journey.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🔐</Text>
  <View style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.gold[400] }]} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * Permission Error State
 */
export const PermissionErrorState: React.FC<BaseErrorStateProps> = ({
  title = "Permission Needed",
  message = "We need a little more access to help you. Please check your permissions.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🛡️</Text>
  <View style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.sage[400] }]} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * Validation Error State
 */
export const ValidationErrorState: React.FC<BaseErrorStateProps> = ({
  title = "Input Validation",
  message = "Almost there! Please review your information and try once more.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>✏️</Text>
        <View style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.accent.lavender }]} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * Generic Error State
 */
export const GenericErrorState: React.FC<BaseErrorStateProps> = ({
  title = "Something Unexpected",
  message = "Every journey has bumps. Let's try again with a clear mind.",
  actions = [],
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🌸</Text>
        <View style={styles.illustrationAccent} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
          >
            <Text style={[styles.actionText, action.primary && styles.primaryText]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

/**
 * Loading Error State (for retry scenarios)
 */
interface LoadingErrorStateProps extends BaseErrorStateProps {
  isRetrying?: boolean;
  retryProgress?: number;
}

export const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({
  title = "Retrying...",
  message = "Please wait while we try again.",
  isRetrying = false,
  retryProgress = 0,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        {isRetrying ? (
          <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
        ) : (
          <Text style={styles.illustration}>⏳</Text>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {isRetrying && retryProgress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${retryProgress * 100}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(retryProgress * 100)}%</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Smart Error State Component - automatically selects appropriate error state
 */
interface SmartErrorStateProps {
  error: AppError;
  actions?: RecoveryAction[];
  onActionPress?: (action: RecoveryAction) => void;
  style?: any;
}

export const SmartErrorState: React.FC<SmartErrorStateProps> = ({
  error,
  actions = [],
  onActionPress,
  style
}) => {
  const commonProps = {
    message: error.userMessage,
    actions,
    onActionPress,
    style
  };
  
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return <NetworkErrorState {...commonProps} />;
    case ErrorCategory.AI_SERVICE:
      return <AIServiceErrorState {...commonProps} />;
    case ErrorCategory.IMAGE_PROCESSING:
      return <ImageErrorState {...commonProps} />;
    case ErrorCategory.AUTHENTICATION:
      return <AuthErrorState {...commonProps} />;
    case ErrorCategory.PERMISSION:
      return <PermissionErrorState {...commonProps} />;
    case ErrorCategory.VALIDATION:
      return <ValidationErrorState {...commonProps} />;
    default:
      return <GenericErrorState {...commonProps} />;
  }
};

/**
 * Inline Error Component (for form fields, etc.)
 */
interface InlineErrorProps {
  message: string;
  visible?: boolean;
  style?: any;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  visible = true,
  style
}) => {
  if (!visible) return null;
  
  return (
    <View style={[styles.inlineContainer, style]}>
      <Text style={styles.inlineIcon}>⚠️</Text>
      <Text style={styles.inlineMessage}>{message}</Text>
    </View>
  );
};

/**
 * Toast Error Component (for temporary error messages)
 */
interface ToastErrorProps {
  message: string;
  visible?: boolean;
  onDismiss?: () => void;
  duration?: number;
  style?: any;
}

export const ToastError: React.FC<ToastErrorProps> = ({
  message,
  visible = true,
  onDismiss,
  duration = 4000,
  style
}) => {
  React.useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);
  
  if (!visible) return null;
  
  return (
    <View style={[styles.toastContainer, style]}>
      <Text style={styles.toastIcon}>⚠️</Text>
      <Text style={styles.toastMessage}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.toastDismiss}>
          <Text style={styles.toastDismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  illustration: {
    fontSize: 80,
    textAlign: 'center',
  },
  illustrationAccent: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DesignSystem.colors.primary[500],
    opacity: 0.8,
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
    maxWidth: screenWidth * 0.8,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
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
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderColor: DesignSystem.colors.primary[500],
  },
  actionText: {
    ...DesignSystem.typography.button.medium,
    color: DesignSystem.colors.text.primary,
  },
  primaryText: {
    color: DesignSystem.colors.text.inverse,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 200,
    marginTop: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  // Inline Error Styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.semantic.error + '10',
    borderRadius: 6,
    marginTop: DesignSystem.spacing.xs,
  },
  inlineIcon: {
    fontSize: 14,
    marginRight: DesignSystem.spacing.xs,
  },
  inlineMessage: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.semantic.error,
    flex: 1,
  },
  // Toast Error Styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: DesignSystem.spacing.md,
    right: DesignSystem.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.semantic.error,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  toastIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.sm,
  },
  toastMessage: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.inverse,
    flex: 1,
  },
  toastDismiss: {
    padding: DesignSystem.spacing.xs,
    marginLeft: DesignSystem.spacing.sm,
  },
  toastDismissText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.inverse,
    fontWeight: 'bold',
  },
});

export default {
  NetworkErrorState,
  AIServiceErrorState,
  ImageErrorState,
  AuthErrorState,
  PermissionErrorState,
  ValidationErrorState,
  GenericErrorState,
  LoadingErrorState,
  SmartErrorState,
  InlineError,
  ToastError,
};