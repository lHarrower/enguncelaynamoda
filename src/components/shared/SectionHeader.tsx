// src/components/shared/SectionHeader.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  showArrow?: boolean;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  showArrow = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {(actionText || onActionPress) && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {actionText && <Text style={styles.actionText}>{actionText}</Text>}
            {showArrow && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={DesignSystem.colors.sage[600]}
                style={styles.actionIcon}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.sm,
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  actionIcon: {
    marginLeft: DesignSystem.spacing.xs,
  },
  actionText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[600],
    fontWeight: '500',
  },
  container: {
    marginBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  content: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
  textContainer: {
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  title: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
});

export default SectionHeader;
