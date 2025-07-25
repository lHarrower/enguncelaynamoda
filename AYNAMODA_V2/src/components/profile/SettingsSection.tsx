import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DIMENSIONS, SPACING } from '../../constants/AppConstants';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    section: {
      marginTop: SPACING.XXXL,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SPACING.LG,
      paddingHorizontal: SPACING.XL,
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
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.LG,
      paddingHorizontal: SPACING.LG,
      backgroundColor: colors.card,
      borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
      marginBottom: SPACING.MD,
      marginHorizontal: SPACING.XL,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItemContent: {
      flex: 1,
      marginLeft: SPACING.MD,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    menuItemSubtitle: {
      fontSize: 14,
      color: colors.text,
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
      <Ionicons name={icon} size={DIMENSIONS.ICON_SIZE_MEDIUM} color={colors.tint} />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.menuItemRight}>
        {rightElement}
        {showArrow && (
          <Ionicons 
            name="chevron-forward" 
            size={DIMENSIONS.ICON_SIZE_SMALL} 
            color={colors.text} 
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
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.LG,
      paddingHorizontal: SPACING.LG,
      backgroundColor: colors.card,
      borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
      marginBottom: SPACING.MD,
      marginHorizontal: SPACING.XL,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    switchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    switchText: {
      marginLeft: SPACING.MD,
    },
    switchTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    switchSubtitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.switchContainer}>
      <View style={styles.switchContent}>
        <Ionicons name={icon} size={DIMENSIONS.ICON_SIZE_MEDIUM} color={colors.tint} />
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>{title}</Text>
          {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.tint }}
        thumbColor={colors.card}
      />
    </View>
  );
}; 