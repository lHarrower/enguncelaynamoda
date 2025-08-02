// src/components/shared/SectionHeader.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  showArrow?: boolean;
  style?: any;
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
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        {(actionText || onActionPress) && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {actionText && (
              <Text style={styles.actionText}>{actionText}</Text>
            )}
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
  container: {
    paddingHorizontal: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.lg,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.radius.sm,
  },
  actionText: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.sage[600],
    fontWeight: '500',
  },
  actionIcon: {
    marginLeft: DesignSystem.spacing.xs,
  },
});

export default SectionHeader;