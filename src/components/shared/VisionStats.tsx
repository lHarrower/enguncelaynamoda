// src/components/shared/VisionStats.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';

interface VisionStatsProps {
  totalSeen: number;
  totalLiked: number;
  totalPassed: number;
  streakDays: number;
  style?: any;
}

interface StatItemProps {
  icon: string;
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
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <BlurView intensity={20} style={styles.statBlur}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.9)',
            'rgba(255, 255, 255, 0.7)',
          ]}
          style={styles.statGradient}
        >
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={24} color={color} />
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
      icon: 'eye',
      label: 'Outfits Seen',
      value: totalSeen,
      color: DesignSystem.colors.sage[600],
      delay: 0,
    },
    {
      icon: 'heart',
      label: 'Loved',
      value: totalLiked,
      color: DesignSystem.colors.coral[500],
      delay: 100,
    },
    {
      icon: 'close',
      label: 'Passed',
      value: totalPassed,
      color: DesignSystem.colors.text.tertiary,
      delay: 200,
    },
    {
      icon: 'flame',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  title: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  likeRateContainer: {
    alignItems: 'flex-end',
  },
  likeRateValue: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.sage[600],
    fontWeight: '700',
  },
  likeRateLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    height: 100,
  },
  statBlur: {
    flex: 1,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    ...DesignSystem.elevation.medium,
  },
  statGradient: {
    flex: 1,
    padding: DesignSystem.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  statValue: {
    ...DesignSystem.typography.scale.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },
});

export default VisionStats;