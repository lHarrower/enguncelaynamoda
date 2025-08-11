import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
  delay?: number;
}

interface StatsCardProps {
  totalItems?: number;
  favoriteItems?: number;
  recentlyAdded?: number;
  categories?: number;
  onPress?: () => void;
}

const StatItem = memo<StatItemProps>(({ icon, value, label, color, delay = 0 }) => {

  
  const styles = useMemo(() => StyleSheet.create({
    statItem: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: DesignSystem.spacing.medium,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: color + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: DesignSystem.spacing.small,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: DesignSystem.colors.text.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: DesignSystem.colors.text.secondary,
      textAlign: 'center',
      fontWeight: '500',
    },
  }), [color]);

  return (
    <Animated.View 
      entering={FadeInUp.delay(delay).duration(600)}
      style={styles.statItem}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
});

const StatsCard: React.FC<StatsCardProps> = ({
  totalItems = 127,
  favoriteItems = 23,
  recentlyAdded = 8,
  categories = 12,
  onPress
}) => {

  
  const statsConfig = useMemo(() => [
    {
      icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap,
      value: totalItems.toString(),
      label: 'Total Items',
      color: DesignSystem.colors.semantic.success,
      delay: 0
    },
    {
      icon: 'heart' as keyof typeof Ionicons.glyphMap,
      value: favoriteItems.toString(),
      label: 'Favorites',
      color: DesignSystem.colors.semantic.error,
      delay: 100
    },
    {
      icon: 'add-circle-outline' as keyof typeof Ionicons.glyphMap,
      value: `+${recentlyAdded}`,
      label: 'This Week',
      color: DesignSystem.colors.semantic.warning,
      delay: 200
    },
    {
      icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
      value: categories.toString(),
      label: 'Categories',
      color: DesignSystem.colors.primary[500],
      delay: 300
    }
  ], [totalItems, favoriteItems, recentlyAdded, categories]);
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: DesignSystem.colors.background.elevated,
      marginHorizontal: DesignSystem.spacing.large,
      marginVertical: DesignSystem.spacing.medium,
      borderRadius: DesignSystem.borderRadius.large,
      padding: DesignSystem.spacing.large,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border.primary,
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: DesignSystem.spacing.large,
      paddingBottom: DesignSystem.spacing.medium,
      borderWidth: 1,
      borderBottomColor: DesignSystem.colors.border.secondary,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: DesignSystem.colors.text.primary,
    },
    subtitle: {
      fontSize: 14,
      color: DesignSystem.colors.text.secondary,
      marginTop: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  }), []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
      <Animated.View 
        entering={FadeInRight.duration(800)}
        style={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wardrobe Stats</Text>
            <Text style={styles.subtitle}>Your collection overview</Text>
          </View>
          <Ionicons 
            name="analytics-outline" 
            size={24} 
            color={DesignSystem.colors.primary[500]} 
          />
        </View>
        
        <View style={styles.statsContainer}>
          {statsConfig.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              color={stat.color}
              delay={stat.delay}
            />
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default memo(StatsCard);