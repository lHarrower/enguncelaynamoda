import { Ionicons } from '@expo/vector-icons';
import React, { memo, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color?: string;
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
  const styles = useMemo(
    () =>
      StyleSheet.create({
        iconContainer: {
          alignItems: 'center',
          backgroundColor: color + '20',
          borderRadius: 24,
          height: 48,
          justifyContent: 'center',
          marginBottom: DesignSystem.spacing.small,
          width: 48,
        },
        statItem: {
          alignItems: 'center',
          flex: 1,
          paddingVertical: DesignSystem.spacing.medium,
        },
        statLabel: {
          color: DesignSystem.colors.text.secondary,
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
        },
        statValue: {
          color: DesignSystem.colors.text.primary,
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 2,
        },
      }),
    [color],
  );

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)} style={styles.statItem}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={24}
          color={color || DesignSystem.colors.sage[500] || '#007AFF'}
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
});

const StatsCard: React.FC<StatsCardProps> = React.memo(
  ({ totalItems = 127, favoriteItems = 23, recentlyAdded = 8, categories = 12, onPress }) => {
    const statsConfig = useMemo(
      () => [
        {
          icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap,
          value: totalItems.toString(),
          label: 'Total Items',
          color: DesignSystem.colors.semantic.success,
          delay: 0,
        },
        {
          icon: 'heart' as keyof typeof Ionicons.glyphMap,
          value: favoriteItems.toString(),
          label: 'Favorites',
          color: DesignSystem.colors.semantic.error,
          delay: 100,
        },
        {
          icon: 'add-circle-outline' as keyof typeof Ionicons.glyphMap,
          value: `+${recentlyAdded}`,
          label: 'This Week',
          color: DesignSystem.colors.semantic.warning,
          delay: 200,
        },
        {
          icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
          value: categories.toString(),
          label: 'Categories',
          color: DesignSystem.colors.primary[500],
          delay: 300,
        },
      ],
      [totalItems, favoriteItems, recentlyAdded, categories],
    );

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            backgroundColor: DesignSystem.colors.background.elevated,
            borderColor: DesignSystem.colors.border.primary,
            borderRadius: DesignSystem.borderRadius.large,
            borderWidth: 1,
            elevation: 4,
            marginHorizontal: DesignSystem.spacing.large,
            marginVertical: DesignSystem.spacing.medium,
            padding: DesignSystem.spacing.large,
            shadowColor: DesignSystem.colors.shadow.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          header: {
            alignItems: 'center',
            borderBottomColor: DesignSystem.colors.border.secondary,
            borderWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: DesignSystem.spacing.large,
            paddingBottom: DesignSystem.spacing.medium,
          },
          statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
          subtitle: {
            color: DesignSystem.colors.text.secondary,
            fontSize: 14,
            marginTop: 2,
          },
          title: {
            color: DesignSystem.colors.text.primary,
            fontSize: 18,
            fontWeight: '600',
          },
        }),
      [],
    );

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        accessibilityRole="button"
        accessibilityLabel="Wardrobe statistics"
        accessibilityHint="Tap to view detailed wardrobe statistics"
      >
        <Animated.View entering={FadeInRight.duration(800)} style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Wardrobe Stats</Text>
              <Text style={styles.subtitle}>Your collection overview</Text>
            </View>
            <Ionicons name="analytics-outline" size={24} color={DesignSystem.colors.primary[500]} />
          </View>

          <View style={styles.statsContainer}>
            {statsConfig.map((stat, index) => (
              <StatItem
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color || DesignSystem.colors?.primaryIndexed?.[500] || '#007AFF'}
                delay={stat.delay}
              />
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

export default StatsCard;
