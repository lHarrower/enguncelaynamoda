/**
 * OptimizedImage Component
 * Advanced image component with lazy loading, caching, progressive loading, and WebP support
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageErrorEventData,
  ImageSourcePropType,
  ImageStyle,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useLazyLoading } from '@/hooks/useIntersectionObserver';
import ImageCacheManager from '@/services/imageCacheManager';
import { PerformanceOptimizationService } from '@/services/performanceOptimizationService';
import { DesignSystem } from '@/theme/DesignSystem';
import { errorInDev, warnInDev } from '@/utils/consoleSuppress';

interface OptimizedImageProps {
  /** Image source */
  source: ImageSourcePropType;
  /** Image style */
  style?: ImageStyle | ViewStyle;
  /** Placeholder content while loading */
  placeholder?: React.ReactNode | string;
  /** Image quality (0-100) */
  quality?: number;
  /** Maximum width for optimization */
  maxWidth?: number;
  /** Maximum height for optimization */
  maxHeight?: number;
  /** Preferred image format */
  format?: 'webp' | 'jpg' | 'png';
  /** Enable lazy loading */
  enableLazyLoading?: boolean;
  /** Enable progressive loading (low quality first) */
  enableProgressiveLoading?: boolean;
  /** Enable caching */
  enableCaching?: boolean;
  /** Loading priority (higher = load first) */
  priority?: number;
  /** Resize mode */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  /** Blur radius for placeholder */
  blurRadius?: number;
  /** Tint color */
  tintColor?: string;
  /** Accessibility */
  accessible?: boolean;
  accessibilityLabel?: string;
  /** Test ID */
  testID?: string;
  /** Event handlers */
  onLoad?: () => void;
  onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

interface Styles {
  container: ViewStyle;
  image: ImageStyle;
  lowQualityImage: ImageStyle;
  placeholder: ViewStyle;
  placeholderText: TextStyle;
  defaultPlaceholder: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  loadingOverlay: ViewStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
}

// Helper function to check if source has uri property
const getSourceUri = (source: ImageSourcePropType): string | undefined => {
  if (typeof source === 'object' && source !== null && 'uri' in source) {
    return (source as { uri: string }).uri;
  }
  return undefined;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  quality = 80,
  maxWidth,
  maxHeight,
  format = 'webp',
  enableLazyLoading = true,
  enableProgressiveLoading = true,
  enableCaching = true,
  priority = 1,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  resizeMode = 'cover',
  blurRadius,
  tintColor,
  accessible,
  accessibilityLabel,
  testID,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [lowQualityUri, setLowQualityUri] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lowQualityFadeAnim = useRef(new Animated.Value(0)).current;
  const imageRef = useRef<Image>(null);
  const mountedRef = useRef(true);

  // Use intersection observer for lazy loading
  const { ref: lazyRef, shouldLoad } = useLazyLoading({
    rootMargin: 100,
    threshold: 0.1,
  });

  // Initialize cache manager
  useEffect(() => {
    ImageCacheManager.initialize().catch((error) => {
      warnInDev('Failed to initialize image cache:', String(error));
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadLowQualityImage = useCallback(
    async (sourceUri: string) => {
      try {
        const lowQualityCachedUri = await ImageCacheManager.getImage(sourceUri, {
          priority: priority + 1,
          quality: 20,
          maxWidth: maxWidth ? Math.floor(maxWidth / 4) : undefined,
          maxHeight: maxHeight ? Math.floor(maxHeight / 4) : undefined,
          format: 'jpg',
        });

        if (mountedRef.current) {
          setLowQualityUri(`file://${lowQualityCachedUri}`);
          setLoadProgress(25);

          Animated.timing(lowQualityFadeAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }
      } catch (lowQualityError) {
        warnInDev('Failed to load low quality version:', String(lowQualityError));
      }
    },
    [priority, maxWidth, maxHeight, lowQualityFadeAnim],
  );

  const loadWithCaching = useCallback(
    async (sourceUri: string) => {
      const cachedUri = await ImageCacheManager.getImage(sourceUri, {
        priority,
        quality,
        maxWidth,
        maxHeight,
        format: Platform.OS === 'android' ? format : 'jpg',
      });

      if (mountedRef.current) {
        setImageUri(`file://${cachedUri}`);
        setLoadProgress(50);
      }

      if (enableProgressiveLoading) {
        await loadLowQualityImage(sourceUri);
      }
    },
    [priority, quality, maxWidth, maxHeight, format, enableProgressiveLoading, loadLowQualityImage],
  );

  const loadWithoutCaching = useCallback(
    async (sourceUri: string) => {
      const optimizedUri = await PerformanceOptimizationService.optimizeImageLoading(sourceUri);

      if (enableProgressiveLoading) {
        const lowQualityUrl = await PerformanceOptimizationService.optimizeImageLoading(sourceUri);
        if (mountedRef.current) {
          setLowQualityUri(lowQualityUrl);
          setLoadProgress(25);
        }
      }

      if (mountedRef.current) {
        setImageUri(optimizedUri);
        setLoadProgress(50);
      }
    },
    [enableProgressiveLoading],
  );

  const handleLoadError = useCallback(
    (error: unknown) => {
      errorInDev('Failed to load optimized image:', String(error));
      if (mountedRef.current) {
        setHasError(true);
        setIsLoading(false);
        onError?.({
          nativeEvent: {
            error: error as Error,
          },
        } as NativeSyntheticEvent<ImageErrorEventData>);
      }
    },
    [onError],
  );

  // Load optimized image with caching
  const loadImage = useCallback(async () => {
    const sourceUri = getSourceUri(source);
    if (!shouldLoad || !sourceUri) {
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      setLoadProgress(0);
      onLoadStart?.();

      if (enableCaching) {
        await loadWithCaching(sourceUri);
      } else {
        await loadWithoutCaching(sourceUri);
      }
    } catch (error) {
      handleLoadError(error);
    }
  }, [
    shouldLoad,
    getSourceUri(source),
    enableCaching,
    loadWithCaching,
    loadWithoutCaching,
    handleLoadError,
    onLoadStart,
  ]);

  // Load image when conditions are met
  useEffect(() => {
    if (shouldLoad && getSourceUri(source)) {
      loadImage();
    }
  }, [shouldLoad, getSourceUri(source), loadImage]);

  // Handle main image load
  const handleImageLoad = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    setIsLoading(false);
    setLoadProgress(100);
    onLoad?.();
    onLoadEnd?.();

    // Animate main image in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // Fade out low quality image
      if (lowQualityUri) {
        Animated.timing(lowQualityFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [fadeAnim, lowQualityFadeAnim, lowQualityUri, onLoad, onLoadEnd]);

  // Handle image error
  const handleImageError = useCallback(
    (error: any) => {
      if (!mountedRef.current) {
        return;
      }

      setHasError(true);
      setIsLoading(false);
      onError?.(error);
      onLoadEnd?.();
    },
    [onError, onLoadEnd],
  );

  // Handle low quality image load
  const handleLowQualityLoad = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }
    setLoadProgress(75);
  }, []);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: loadProgress / 100,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [loadProgress, progressAnim]);

  // Retry loading
  const retryLoad = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    loadImage();
  }, [loadImage]);

  return (
    <View
      ref={enableLazyLoading ? lazyRef : undefined}
      style={[styles.container, style]}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      {...props}
    >
      {/* Placeholder */}
      {(isLoading || !shouldLoad) && (
        <View style={[styles.placeholder, StyleSheet.absoluteFill]}>
          {placeholder ? (
            typeof placeholder === 'string' ? (
              <Text style={styles.placeholderText}>{placeholder}</Text>
            ) : (
              placeholder
            )
          ) : (
            <View style={styles.defaultPlaceholder}>
              <ActivityIndicator size="small" color={DesignSystem.colors.sage[500]} />
            </View>
          )}
        </View>
      )}

      {/* Error state */}
      {hasError && (
        <View style={[styles.errorContainer, StyleSheet.absoluteFill]}>
          <Text style={styles.errorText}>Failed to load image</Text>
          <Text style={[styles.errorText, { fontSize: 12, marginTop: 4 }]} onPress={retryLoad}>
            Tap to retry
          </Text>
        </View>
      )}

      {/* Low quality image (progressive loading) */}
      {lowQualityUri && enableProgressiveLoading && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: lowQualityFadeAnim }]}>
          <Image
            source={{ uri: lowQualityUri }}
            style={styles.lowQualityImage}
            resizeMode={resizeMode}
            blurRadius={2}
            onLoad={handleLowQualityLoad}
            onError={() => warnInDev('Low quality image failed to load')}
          />
        </Animated.View>
      )}

      {/* Main image */}
      {imageUri && shouldLoad && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <Image
            ref={imageRef}
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode={resizeMode}
            blurRadius={blurRadius}
            tintColor={tintColor}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Animated.View>
      )}

      {/* Loading progress bar */}
      {isLoading && loadProgress > 0 && (
        <View style={styles.loadingOverlay}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: DesignSystem.colors.background.secondary,
    overflow: 'hidden',
  },
  defaultPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    justifyContent: 'center',
    padding: DesignSystem.spacing.md,
  },
  errorText: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.body.small.fontFamily,
    fontSize: DesignSystem.typography.body.small.fontSize,
    fontWeight: '400' as const,
    lineHeight: DesignSystem.typography.body.small.lineHeight,
    textAlign: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loadingOverlay: {
    bottom: 0,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  lowQualityImage: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    justifyContent: 'center',
  },
  placeholderText: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.body.medium.fontFamily,
    fontSize: DesignSystem.typography.body.medium.fontSize,
    fontWeight: '400' as const,
    lineHeight: DesignSystem.typography.body.medium.lineHeight,
    textAlign: 'center',
  },
  progressBar: {
    backgroundColor: DesignSystem.colors.background.tertiary,
    height: 2,
  },
  progressFill: {
    backgroundColor: DesignSystem.colors.sage[500],
    height: '100%',
  },
});

export default OptimizedImage;
