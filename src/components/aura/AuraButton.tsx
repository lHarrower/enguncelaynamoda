import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { DesignSystem } from '../../theme/DesignSystem';

interface AuraButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  haptic?: 'touch' | 'impact' | 'selection';
}

/**
 * AuraButton
 * Embodies all three principles:
 * - Sensory Stillness: Generous padding, single font
 * - Gentle Confidence: Overshoot animation, haptic harmony
 * - Material Honesty: Liquid metal gradients
 */
const AuraButton: React.FC<AuraButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  haptic = 'touch',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Liquid metal shimmer animation
    if (variant === 'primary' && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }
  }, [variant, disabled, shimmerAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Overshoot animation for gentle confidence
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled) {
      // Haptic harmony
      if (haptic === 'impact') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (haptic === 'selection') {
        void Haptics.selectionAsync();
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      onPress();
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: DesignSystem.spacing.xs,
          paddingHorizontal: DesignSystem.spacing.md,
          minHeight: 40,
        };
      case 'large':
        return {
          paddingVertical: DesignSystem.spacing.md,
          paddingHorizontal: DesignSystem.spacing.xl,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: DesignSystem.spacing.sm,
          paddingHorizontal: DesignSystem.spacing.lg,
          minHeight: 48,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...DesignSystem.typography.body.medium,
      fontWeight: '600',
      color:
        variant === 'primary' ? DesignSystem.colors.text.inverse : DesignSystem.colors.sage[500],
      opacity: disabled ? 0.5 : 1,
    };
    return baseStyle;
  };

  const getGradientColors = (): readonly [string, string] => {
    if (variant === 'primary') {
      return [DesignSystem.colors.sage[500], DesignSystem.colors.gold[500]];
    }
    return ['transparent', 'transparent'];
  };

  const content = (
    <View style={styles.contentContainer}>
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </View>
  );

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth, style]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={`Aura ${variant} button${disabled ? ', disabled' : ''}`}
        accessibilityState={{ disabled }}
        style={[
          styles.button,
          getSizeStyles(),
          variant === 'secondary' && styles.secondary,
          variant === 'ghost' && styles.ghost,
          disabled && styles.disabled,
        ]}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, getSizeStyles()]}
          >
            {content}
            {/* Liquid metal shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmer,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.15, 0],
                  }),
                },
              ]}
            />
          </LinearGradient>
        ) : (
          content
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  ghost: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  gradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.sage[500],
    borderWidth: 1,
    ...DesignSystem.elevation.soft,
  },
  shimmer: {
    backgroundColor: DesignSystem.colors.gold[500] + '30',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default AuraButton;
