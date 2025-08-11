import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      fontSize: 18,
      fontWeight: 'bold',
      color: DesignSystem.colors.text.primary,
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
  rightElement 
}) => {


  const styles = StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.lg,
      backgroundColor: DesignSystem.colors.background.elevated,
      borderRadius: 12,
      marginBottom: DesignSystem.spacing.md,
      marginHorizontal: DesignSystem.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border.primary,
    },
    menuItemContent: {
      flex: 1,
      marginLeft: DesignSystem.spacing.md,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: DesignSystem.colors.text.primary,
    },
    menuItemSubtitle: {
      fontSize: 14,
      color: DesignSystem.colors.text.primary,
      opacity: 0.7,
      marginTop: 2,
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
            style={{ opacity: 0.5 }} 
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
  onValueChange 
}) => {


  const styles = StyleSheet.create({
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.lg,
      backgroundColor: DesignSystem.colors.background.elevated,
      borderRadius: 12,
      marginBottom: DesignSystem.spacing.md,
      marginHorizontal: DesignSystem.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border.primary,
    },
    switchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    switchText: {
      marginLeft: DesignSystem.spacing.md,
    },
    switchTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: DesignSystem.colors.text.primary,
    },
    switchSubtitle: {
      fontSize: 14,
      color: DesignSystem.colors.text.primary,
      opacity: 0.7,
      marginTop: 2,
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
        trackColor={{ false: DesignSystem.colors.border.primary, true: DesignSystem.colors.gold[500] }}
        thumbColor={DesignSystem.colors.background.elevated}
      />
    </View>
  );
};