import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DIMENSIONS, SPACING } from '../../constants/AppConstants';

interface UserStats {
  wardrobeItems: number;
  favoriteItems: number;
  followingBoutiques: number;
  totalSaved: number;
  thisMonthSaved: number;
  stylesCreated: number;
}

interface StatsCardProps {
  stats: UserStats;
  onStatPress: (statType: string) => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, onStatPress }) => {
  const { colors, isDark } = useTheme();

  const statItems = [
    { 
      key: 'wardrobe', 
      label: 'Wardrobe Items', 
      value: stats.wardrobeItems, 
      icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.tint 
    },
    { 
      key: 'favorites', 
      label: 'Favorites', 
      value: stats.favoriteItems, 
      icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.accentOrange 
    },
    { 
      key: 'boutiques', 
      label: 'Following', 
      value: stats.followingBoutiques, 
      icon: 'storefront-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.accentGreen 
    },
    { 
      key: 'saved', 
      label: 'Total Saved', 
      value: `$${stats.totalSaved}`, 
      icon: 'cash-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.tint 
    },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: DIMENSIONS.BORDER_RADIUS_LARGE,
      padding: SPACING.LG,
      marginVertical: SPACING.LG,
      shadowColor: isDark ? '#000' : colors.tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SPACING.LG,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      width: '48%',
      backgroundColor: colors.background,
      borderRadius: DIMENSIONS.BORDER_RADIUS_MEDIUM,
      padding: SPACING.MD,
      marginBottom: SPACING.MD,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      marginBottom: SPACING.SM,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SPACING.XS,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.7,
      textAlign: 'center',
    },
    monthlySection: {
      marginTop: SPACING.MD,
      paddingTop: SPACING.MD,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    monthlyText: {
      fontSize: 14,
      color: colors.text,
    },
    monthlyValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.tint,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Fashion Stats</Text>
      
      <View style={styles.statsGrid}>
        {statItems.map((stat) => (
          <TouchableOpacity 
            key={stat.key}
            style={styles.statItem}
            onPress={() => onStatPress(stat.key)}
          >
            <View style={styles.statIcon}>
              <Ionicons 
                name={stat.icon} 
                size={DIMENSIONS.ICON_SIZE_LARGE} 
                color={stat.color} 
              />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.monthlySection}>
        <Text style={styles.monthlyText}>Saved This Month</Text>
        <Text style={styles.monthlyValue}>${stats.thisMonthSaved}</Text>
      </View>
    </View>
  );
}; 