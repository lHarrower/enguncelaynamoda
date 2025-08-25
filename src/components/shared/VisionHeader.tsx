// src/components/shared/VisionHeader.tsx

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

interface VisionHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  style?: ViewStyle;
}

export const VisionHeader: React.FC<VisionHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  onSettingsPress,
  showBackButton = false,
  showSettingsButton = true,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <BlurView intensity={80} style={styles.blur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              {showBackButton && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onBackPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  accessibilityHint="Navigate to previous screen"
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={DesignSystem.colors.text.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.centerSection}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            <View style={styles.rightSection}>
              {showSettingsButton && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onSettingsPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Settings"
                  accessibilityHint="Open settings menu"
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={DesignSystem.colors.text.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  blur: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
  },
  centerSection: {
    alignItems: 'center',
    flex: 1,
  },
  container: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  gradient: {
    paddingBottom: DesignSystem.spacing.md,
  },
  iconButton: {
    borderRadius: DesignSystem.radius.sm,
    padding: DesignSystem.spacing.xs,
  },
  leftSection: {
    alignItems: 'flex-start',
    width: 40,
  },
  rightSection: {
    alignItems: 'flex-end',
    width: 40,
  },
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VisionHeader;
