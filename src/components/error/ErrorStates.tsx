// Error States - Elegant error state components for various scenarios
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { AppError, ErrorCategory, RecoveryAction } from '@/utils/ErrorHandler';

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
  style?: ViewStyle;
}

/**
 * Network Error State
 */
export const NetworkErrorState: React.FC<BaseErrorStateProps> = ({
  title = 'Connection Lost',
  message = "Take a moment to breathe. Check your connection and we'll try again together.",
  actions = [],
  onActionPress,
  style,
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
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={action.primary ? 'Primary action button' : 'Secondary action button'}
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
  title = 'AI Stylist Unavailable',
  message = 'Our AI stylist is taking a quick break. Please try again in a moment.',
  actions = [],
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🤖</Text>
        <View
          style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.lilac[600] }]}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={action.primary ? 'Primary action button' : 'Secondary action button'}
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
  title = 'Image Processing Failed',
  message = 'This image needs a different approach. Try another one that speaks to you.',
  actions = [],
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🖼️</Text>
        <View
          style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.coral[400] }]}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, action.primary && styles.primaryButton]}
            onPress={() => onActionPress?.(action)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={action.primary ? 'Primary action button' : 'Secondary action button'}
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
  title = 'Authentication Required',
  message = "Let's get you back on track. Please sign in again to continue your journey.",
  actions = [],
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🔐</Text>
        <View
          style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.gold[400] }]}
        />
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
  title = 'Permission Needed',
  message = 'We need a little more access to help you. Please check your permissions.',
  actions = [],
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>🛡️</Text>
        <View
          style={[styles.illustrationAccent, { backgroundColor: DesignSystem.colors.sage[400] }]}
        />
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
  title = 'Input Validation',
  message = 'Almost there! Please review your information and try once more.',
  actions = [],
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>✏️</Text>
        <View
          style={[
            styles.illustrationAccent,
            { backgroundColor: DesignSystem.colors.accent.lavender },
          ]}
        />
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
  title = 'Something Unexpected',
  message = "Every journey has bumps. Let's try again with a clear mind.",
  actions = [],
  onActionPress,
  style,
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
  title = 'Retrying...',
  message = 'Please wait while we try again.',
  isRetrying = false,
  retryProgress = 0,
  style,
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
            <View style={[styles.progressFill, { width: `${retryProgress * 100}%` }]} />
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
  style?: ViewStyle;
}

export const SmartErrorState: React.FC<SmartErrorStateProps> = ({
  error,
  actions = [],
  onActionPress,
  style,
}) => {
  const commonProps = {
    message: error.userMessage,
    actions,
    onActionPress,
    style,
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
  style?: ViewStyle;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, visible = true, style }) => {
  if (!visible) {
    return null;
  }

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
  style?: ViewStyle;
}

export const ToastError: React.FC<ToastErrorProps> = ({
  message,
  visible = true,
  onDismiss,
  duration = 4000,
  style,
}) => {
  React.useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.toastContainer, style]}>
      <Text style={styles.toastIcon}>⚠️</Text>
      <Text style={styles.toastMessage}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.toastDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss error message"
          accessibilityHint="Closes this error notification"
        >
          <Text style={styles.toastDismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xl,
    position: 'relative',
  },
  illustration: {
    fontSize: 80,
    textAlign: 'center',
  },
  illustrationAccent: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: 12,
    bottom: -8,
    height: 24,
    opacity: 0.8,
    position: 'absolute',
    right: -8,
    width: 24,
  },
  title: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  message: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.xl,
    maxWidth: screenWidth * 0.8,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: DesignSystem.spacing.md,
    maxWidth: 300,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
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
    alignItems: 'center',
    marginTop: DesignSystem.spacing.lg,
    maxWidth: 200,
    width: '100%',
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: 2,
    height: '100%',
  },
  progressText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  // Inline Error Styles
  inlineContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.semantic.error + '10',
    borderRadius: 6,
    flexDirection: 'row',
    marginTop: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
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
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.semantic.error,
    borderRadius: 12,
    elevation: 5,
    flexDirection: 'row',
    left: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    position: 'absolute',
    right: DesignSystem.spacing.md,
    shadowColor: DesignSystem.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    top: 60,
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
    marginLeft: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.xs,
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
