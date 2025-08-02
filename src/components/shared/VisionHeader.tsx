// src/components/shared/VisionHeader.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignSystem } from '@/theme/DesignSystem';

interface VisionHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  style?: any;
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
          colors={[
            'rgba(255, 255, 255, 0.95)',
            'rgba(255, 255, 255, 0.85)',
          ]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              {showBackButton && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onBackPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
              {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
              )}
            </View>
            
            <View style={styles.rightSection}>
              {showSettingsButton && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onSettingsPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blur: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  gradient: {
    paddingBottom: DesignSystem.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    minHeight: 56,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.sm,
  },
  title: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default VisionHeader;