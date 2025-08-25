import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const styles = StyleSheet.create({
    section: {
      marginTop: DesignSystem.spacing.xxxl,
    },
    sectionTitle: {
      color: DesignSystem.colors.text.primary,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.xl,
    },
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
}) => {
  const styles = StyleSheet.create({
    chevronOpacity: {
      opacity: 0.5,
    },
    menuItem: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.background.elevated,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 3,
      flexDirection: 'row',
      marginBottom: DesignSystem.spacing.md,
      marginHorizontal: DesignSystem.spacing.xl,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    menuItemContent: {
      flex: 1,
      marginLeft: DesignSystem.spacing.md,
    },
    menuItemRight: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    menuItemSubtitle: {
      color: DesignSystem.colors.text.primary,
      fontSize: 14,
      marginTop: 2,
      opacity: 0.7,
    },
    menuItemTitle: {
      color: DesignSystem.colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle || 'Tap to open this setting'}
    >
      <Ionicons name={icon} size={24} color={DesignSystem.colors.text.accent} />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.menuItemRight}>
        {rightElement}
        {showArrow && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={DesignSystem.colors.text.primary}
            style={styles.chevronOpacity}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface SwitchItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SwitchItem: React.FC<SwitchItemProps> = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}) => {
  const styles = StyleSheet.create({
    switchContainer: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.background.elevated,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 3,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: DesignSystem.spacing.md,
      marginHorizontal: DesignSystem.spacing.xl,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    switchContent: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: 1,
    },
    switchSubtitle: {
      color: DesignSystem.colors.text.primary,
      fontSize: 14,
      marginTop: 2,
      opacity: 0.7,
    },
    switchText: {
      marginLeft: DesignSystem.spacing.md,
    },
    switchTitle: {
      color: DesignSystem.colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.switchContainer}>
      <View style={styles.switchContent}>
        <Ionicons name={icon} size={24} color={DesignSystem.colors.text.accent} />
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>{title}</Text>
          {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: DesignSystem.colors.border.primary,
          true: DesignSystem.colors.gold[500],
        }}
        thumbColor={DesignSystem.colors.background.elevated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chevronOpacity: {
    opacity: 0.5,
  },
});
