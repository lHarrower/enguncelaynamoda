import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

interface DiscoverStatsProps {
  totalOutfits: number;
  lovedOutfits: number;
  passedOutfits: number;
  todayViewed: number;
}

const DiscoverStats: React.FC<DiscoverStatsProps> = ({
  totalOutfits,
  lovedOutfits,
  passedOutfits,
  todayViewed,
}) => {
  const stats = [
    {
      icon: 'heart',
      label: 'Loved',
      value: lovedOutfits,
      color: DesignSystem.colors.coral[500],
    },
    {
      icon: 'close-circle',
      label: 'Passed',
      value: passedOutfits,
      color: DesignSystem.colors.charcoal[400],
    },
    {
      icon: 'eye',
      label: 'Today',
      value: todayViewed,
      color: DesignSystem.colors.sage[500],
    },
    {
      icon: 'library',
      label: 'Total',
      value: totalOutfits,
      color: DesignSystem.colors.lavender[500],
    },
  ];

  return (
    <BlurView intensity={20} style={styles.container}>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons 
                name={stat.icon as any} 
                size={20} 
                color={stat.color} 
              />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    ...DesignSystem.elevation.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: DesignSystem.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.charcoal[800],
    fontWeight: '700',
  },
  statLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.charcoal[600],
    textAlign: 'center',
  },
});

export default DiscoverStats;