// src/components/shared/VisionStats.tsx

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';
import { IoniconsName } from '@/types/icons';

interface VisionStatsProps {
  totalSeen: number;
  totalLiked: number;
  totalPassed: number;
  streakDays: number;
  style?: any;
}

interface StatItemProps {
  icon: IoniconsName;
  label: string;
  value: number;
  color: string;
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color, delay = 0 }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withSpring(1);
    }, delay);
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <BlurView intensity={20} style={styles.statBlur}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
          style={styles.statGradient}
        >
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={styles.statValue}>{value.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export const VisionStats: React.FC<VisionStatsProps> = ({
  totalSeen,
  totalLiked,
  totalPassed,
  streakDays,
  style,
}) => {
  const likeRate = totalSeen > 0 ? Math.round((totalLiked / totalSeen) * 100) : 0;

  const stats = [
    {
      icon: 'eye' as IoniconsName,
      label: 'Outfits Seen',
      value: totalSeen,
      color: DesignSystem.colors.sage[600],
      delay: 0,
    },
    {
      icon: 'heart' as IoniconsName,
      label: 'Loved',
      value: totalLiked,
      color: DesignSystem.colors.coral[500],
      delay: 100,
    },
    {
      icon: 'close' as IoniconsName,
      label: 'Passed',
      value: totalPassed,
      color: DesignSystem.colors.text.tertiary,
      delay: 200,
    },
    {
      icon: 'flame' as IoniconsName,
      label: 'Day Streak',
      value: streakDays,
      color: DesignSystem.colors.amber[500],
      delay: 300,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Vision Journey</Text>
        <View style={styles.likeRateContainer}>
          <Text style={styles.likeRateValue}>{likeRate}%</Text>
          <Text style={styles.likeRateLabel}>Love Rate</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatItem
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            delay={stat.delay}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: DesignSystem.spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.xs,
    width: 40,
  },
  likeRateContainer: {
    alignItems: 'flex-end',
  },
  likeRateLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
  likeRateValue: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.sage[600],
    fontWeight: '700',
  },
  statBlur: {
    borderRadius: DesignSystem.radius.lg,
    flex: 1,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  statGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.md,
  },
  statItem: {
    flex: 1,
    height: 100,
    minWidth: '45%',
  },
  statLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
  },
  statValue: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  title: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
});

export default VisionStats;
