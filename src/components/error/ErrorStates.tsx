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
import { COLORS } from '../../theme/foundations/Colors';
import { TYPOGRAPHY } from '../../theme/foundations/Typography';
import { SPACING } from '../../theme/foundations/Spacing';

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
        <View style={[styles.illustrationAccent, { backgroundColor: COLORS.accent.purple }]} />
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
        <View style={[styles.illustrationAccent, { backgroundColor: COLORS.accent.coral }]} />
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
        <View style={[styles.illustrationAccent, { backgroundColor: COLORS.accent.gold }]} />
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
        <View style={[styles.illustrationAccent, { backgroundColor: COLORS.accent.sage }]} />
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
        <View style={[styles.illustrationAccent, { backgroundColor: COLORS.accent.lavender }]} />
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
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
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
    padding: SPACING.xl,
    backgroundColor: COLORS.background.primary,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
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
    backgroundColor: COLORS.primary[500],
    opacity: 0.8,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
    maxWidth: screenWidth * 0.8,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  actionText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  primaryText: {
    color: COLORS.text.inverse,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 200,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  // Inline Error Styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.semantic.error + '10',
    borderRadius: 6,
    marginTop: SPACING.xs,
  },
  inlineIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  inlineMessage: {
    ...TYPOGRAPHY.caption,
    color: COLORS.semantic.error,
    flex: 1,
  },
  // Toast Error Styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.error,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
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
    marginRight: SPACING.sm,
  },
  toastMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.inverse,
    flex: 1,
  },
  toastDismiss: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  toastDismissText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
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