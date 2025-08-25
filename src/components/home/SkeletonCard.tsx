import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const SkeletonCard: React.FC = () => {
  const shimmerTranslateX = useSharedValue(-100);

  React.useEffect(() => {
    shimmerTranslateX.value = withRepeat(withTiming(100, { duration: 1500 }), -1, false);
  }, [shimmerTranslateX]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(shimmerTranslateX.value, [-100, 100], [-100, 100]),
        },
      ],
    };
  });

  const shimmerColors = [
    'transparent',
    DesignSystem.colors.border.primary + '40',
    'transparent',
  ] as const;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: DesignSystem.colors.background.elevated,
          borderColor: DesignSystem.colors.border.primary,
        },
      ]}
    >
      {/* Card Image Skeleton */}
      <View
        style={[styles.imageContainer, { backgroundColor: DesignSystem.colors.background.primary }]}
      >
        <View style={styles.shimmerContainer}>
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
            <LinearGradient
              colors={shimmerColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </View>
      </View>

      {/* Card Header Skeleton */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: DesignSystem.colors.background.primary,
            borderBottomColor: DesignSystem.colors.border.primary,
          },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: DesignSystem.colors.border.primary }]}>
          <View style={styles.shimmerContainer}>
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={shimmerColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        </View>
        <View style={[styles.heartIcon, { backgroundColor: DesignSystem.colors.border.primary }]}>
          <View style={styles.shimmerContainer}>
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={shimmerColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Card Content Skeleton */}
      <View style={styles.content}>
        {/* Title Skeleton */}
        <View
          style={[styles.titleSkeleton, { backgroundColor: DesignSystem.colors.border.primary }]}
        >
          <View style={styles.shimmerContainer}>
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={shimmerColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        </View>

        {/* Brand Skeleton */}
        <View
          style={[styles.brandSkeleton, { backgroundColor: DesignSystem.colors.border.primary }]}
        >
          <View style={styles.shimmerContainer}>
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={shimmerColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        </View>

        {/* Price Container Skeleton */}
        <View
          style={[styles.priceContainer, { borderTopColor: DesignSystem.colors.border.primary }]}
        >
          <View
            style={[styles.priceSkeleton, { backgroundColor: DesignSystem.colors.border.primary }]}
          >
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={shimmerColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </View>
          <View
            style={[
              styles.originalPriceSkeleton,
              { backgroundColor: DesignSystem.colors.border.primary },
            ]}
          >
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={shimmerColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </View>
          <View
            style={[
              styles.savingsSkeleton,
              { backgroundColor: DesignSystem.colors.border.primary },
            ]}
          >
            <View style={styles.shimmerContainer}>
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={shimmerColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 80,
  },
  brandSkeleton: {
    borderRadius: 7,
    height: 14,
    marginBottom: 8,
    width: '50%',
  },
  container: {
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heartIcon: {
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  imageContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    height: 120,
    justifyContent: 'center',
  },
  originalPriceSkeleton: {
    borderRadius: 7,
    height: 14,
    marginRight: 8,
    width: 45,
  },
  priceContainer: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
  },
  priceSkeleton: {
    borderRadius: 9,
    height: 18,
    marginRight: 8,
    width: 60,
  },
  savingsSkeleton: {
    borderRadius: 10,
    height: 17,
    width: 70,
  },
  shimmerContainer: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
  shimmerOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '200%',
  },
  titleSkeleton: {
    borderRadius: 8,
    height: 16,
    marginBottom: 4,
    width: '70%',
  },
});

export default SkeletonCard;
