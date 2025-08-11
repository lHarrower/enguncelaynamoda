import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';

interface MirrorHeaderProps {
  greetingText: string;
  dateText: string;
  weatherText?: string;
  headerOpacity: Animated.SharedValue<number>;
  dimensions: {
    isTablet: boolean;
    headerHeight: number;
  };
}

export const MirrorHeader: React.FC<MirrorHeaderProps> = ({
  greetingText,
  dateText,
  weatherText,
  headerOpacity,
  dimensions,
}) => {
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  return (
  <Animated.View style={[getHeaderStyle(dimensions), headerAnimatedStyle]}>
      <BlurView intensity={20} style={styles.headerBlur}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.9)',
            'rgba(255, 255, 255, 0.7)',
          ]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
      <Text style={getGreetingTextStyle(dimensions)}>
              {greetingText}
            </Text>
            <Text style={styles.dateText}>
              {dateText}
            </Text>
            {weatherText && (
              <View style={styles.weatherContainer}>
                <Ionicons
                  name="partly-sunny-outline"
                  size={16}
                  color={DesignSystem.colors.inkGray[600]}
                />
                <Text style={styles.weatherText}>
                  {weatherText}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

const getHeaderStyle = (dimensions: { headerHeight: number }) => ({
  height: dimensions.headerHeight,
  paddingTop: 44, // Status bar height
});

const getGreetingTextStyle = (dimensions: { isTablet: boolean }) => ({
  ...DesignSystem.typography.heading.h1,
  color: DesignSystem.colors.inkGray[800],
  marginBottom: DesignSystem.spacing.xs,
  fontSize: dimensions.isTablet ? 32 : 28,
});

const styles = StyleSheet.create({
  headerBlur: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.lg,
  },
  dateText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.inkGray[600],
    marginBottom: DesignSystem.spacing.sm,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  weatherText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.inkGray[600],
    textTransform: 'capitalize',
  },
});