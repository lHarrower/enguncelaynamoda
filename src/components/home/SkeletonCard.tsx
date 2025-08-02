import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const SkeletonCard: React.FC = () => {
  const { colors } = useTheme();
  const shimmerTranslateX = useSharedValue(-100);

  React.useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(100, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerTranslateX.value,
            [-100, 100],
            [-100, 100]
          ),
        },
      ],
    };
  });

  const shimmerColors = [
    'transparent',
    colors.border + '40',
    'transparent',
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Card Image Skeleton */}
      <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
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
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.badge, { backgroundColor: colors.border }]}>
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
        <View style={[styles.heartIcon, { backgroundColor: colors.border }]}>
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
        <View style={[styles.titleSkeleton, { backgroundColor: colors.border }]}>
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
        <View style={[styles.brandSkeleton, { backgroundColor: colors.border }]}>
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
        <View style={[styles.priceContainer, { borderTopColor: colors.border }]}>
          <View style={[styles.priceSkeleton, { backgroundColor: colors.border }]}>
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
          <View style={[styles.originalPriceSkeleton, { backgroundColor: colors.border }]}>
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
          <View style={[styles.savingsSkeleton, { backgroundColor: colors.border }]}>
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
  container: {
    borderRadius: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    width: 80,
    height: 28,
  },
  heartIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  titleSkeleton: {
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
    width: '70%',
  },
  brandSkeleton: {
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
    width: '50%',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  priceSkeleton: {
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    width: 60,
  },
  originalPriceSkeleton: {
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    width: 45,
  },
  savingsSkeleton: {
    height: 17,
    borderRadius: 10,
    width: 70,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
  },
  shimmerGradient: {
    flex: 1,
  },
});

export default SkeletonCard;