/**
 * Optimized Image Component
 * Progressive loading with WebP support, lazy loading, and caching
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageErrorEventData,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PerformanceOptimizationService } from '@/services/performanceOptimizationService';
import { DesignSystem } from '@/theme/DesignSystem';
import { optimizeImageUri } from '@/utils/performanceUtils';

import { warnInDev } from '../../utils/consoleSuppress';

interface OptimizedImageProps {
  /** Image source URI */
  source: string | ImageSourcePropType;
  /** Image style */
  style?: ImageStyle;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Resize mode */
  resizeMode?: ImageResizeMode;
  /** Enable lazy loading */
  lazy?: boolean;
  /** Enable progressive loading */
  progressive?: boolean;
  /** Enable WebP format when possible */
  enableWebP?: boolean;
  /** Placeholder component */
  placeholder?: React.ReactNode;
  /** Error placeholder component */
  errorPlaceholder?: React.ReactNode;
  /** Loading indicator color */
  loadingColor?: string;
  /** Fade animation duration */
  fadeDuration?: number;
  /** Cache the image */
  cache?: boolean;
  /** Image quality (0-100) */
  quality?: number;
  /** Target width for optimization */
  targetWidth?: number;
  /** Target height for optimization */
  targetHeight?: number;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: NativeSyntheticEvent<ImageErrorEventData>) => void;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Accessibility label */
  accessibilityLabel?: string;
}

interface ImageState {
  loading: boolean;
  error: boolean;
  loaded: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    source,
    style,
    containerStyle,
    resizeMode = 'cover',
    lazy = true,
    progressive = true,
    enableWebP = true,
    placeholder,
    errorPlaceholder,
    loadingColor = DesignSystem.colors.primary[500],
    fadeDuration = 300,
    cache = true,
    quality = 80,
    targetWidth,
    targetHeight,
    onLoad,
    onError,
    onLoadStart,
    accessibilityLabel,
  }) => {
    const [imageState, setImageState] = useState<ImageState>({
      loading: false,
      error: false,
      loaded: false,
    });
    const [optimizedSource, setOptimizedSource] = useState<ImageSourcePropType | undefined>(
      typeof source === 'string' ? { uri: source } : source,
    );
    const [isInView, setIsInView] = useState(!lazy);
    const viewRef = useRef<View>(null);

    // Animation values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.95);
    const loadingOpacity = useSharedValue(0);

    // Optimize image source
    useEffect(() => {
      const optimizeSource = async () => {
        if (typeof source === 'string' && cache) {
          try {
            let optimizedUri = source;

            // Apply WebP format if supported
            if (enableWebP && !source.includes('.gif')) {
              if (source.includes('unsplash.com') || source.includes('images.')) {
                const separator = source.includes('?') ? '&' : '?';
                optimizedUri = `${source}${separator}fm=webp&q=${quality}`;
              }
            }

            // Apply size optimization
            if (targetWidth && targetHeight) {
              optimizedUri = optimizeImageUri(optimizedUri, targetWidth, targetHeight);
            }

            // Use performance service for caching
            const cachedUri =
              await PerformanceOptimizationService.optimizeImageLoading(optimizedUri);
            setOptimizedSource({ uri: cachedUri });
          } catch (error) {
            warnInDev('Image optimization failed:', String(error));
            setOptimizedSource(typeof source === 'string' ? { uri: source } : source);
          }
        } else {
          setOptimizedSource(typeof source === 'string' ? { uri: source } : source);
        }
      };

      optimizeSource();
    }, [source, cache, enableWebP, quality, targetWidth, targetHeight]);

    // Lazy loading intersection observer simulation
    useEffect(() => {
      if (!lazy) {
        return;
      }

      const checkVisibility = () => {
        if (viewRef.current) {
          // Simple visibility check - in a real implementation,
          // you might use react-native-intersection-observer or similar
          setIsInView(true);
        }
      };

      const timer = setTimeout(checkVisibility, 100);
      return () => clearTimeout(timer);
    }, [lazy]);

    // Handle loading start
    const handleLoadStart = useCallback(() => {
      setImageState((prev) => ({ ...prev, loading: true, error: false }));
      loadingOpacity.value = withTiming(1, { duration: 200 });
      onLoadStart?.();
    }, [loadingOpacity, onLoadStart]);

    // Handle successful load
    const handleLoad = useCallback(() => {
      const completeLoad = () => {
        setImageState((prev) => ({ ...prev, loading: false, loaded: true }));
        onLoad?.();
      };

      if (progressive) {
        // Progressive loading animation
        opacity.value = withTiming(1, { duration: fadeDuration });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
        loadingOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(completeLoad)();
        });
      } else {
        opacity.value = 1;
        scale.value = 1;
        loadingOpacity.value = 0;
        completeLoad();
      }
    }, [opacity, scale, loadingOpacity, progressive, fadeDuration, onLoad]);

    // Handle load error
    const handleError = useCallback(
      (error: NativeSyntheticEvent<ImageErrorEventData>) => {
        setImageState((prev) => ({ ...prev, loading: false, error: true }));
        loadingOpacity.value = withTiming(0, { duration: 200 });
        onError?.(error);
      },
      [loadingOpacity, onError],
    );

    // Animated styles
    const imageAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    const loadingAnimatedStyle = useAnimatedStyle(() => ({
      opacity: loadingOpacity.value,
    }));

    // Render loading placeholder
    const renderLoadingPlaceholder = () => {
      if (placeholder) {
        return placeholder;
      }

      return (
        <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
          <ActivityIndicator size="small" color={loadingColor} />
        </Animated.View>
      );
    };

    // Render error placeholder
    const renderErrorPlaceholder = () => {
      if (errorPlaceholder) {
        return errorPlaceholder;
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      );
    };

    // Don't render if lazy loading and not in view
    if (lazy && !isInView) {
      return (
        <View ref={viewRef} style={[styles.container, containerStyle]}>
          {placeholder || <View style={[styles.placeholder, style]} />}
        </View>
      );
    }

    return (
      <View ref={viewRef} style={[styles.container, containerStyle]}>
        {/* Main Image */}
        {isInView && (
          <Animated.View style={[styles.imageWrapper, imageAnimatedStyle]}>
            <Image
              source={optimizedSource}
              style={[styles.image, style]}
              resizeMode={resizeMode}
              onLoadStart={handleLoadStart}
              onLoad={handleLoad}
              onError={handleError}
              accessibilityLabel={accessibilityLabel}
            />
          </Animated.View>
        )}

        {/* Loading Overlay */}
        {imageState.loading && renderLoadingPlaceholder()}

        {/* Error Overlay */}
        {imageState.error && renderErrorPlaceholder()}
      </View>
    );
  },
);

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageWrapper: {
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  placeholder: {
    backgroundColor: DesignSystem.colors.background.secondary,
    height: '100%',
    width: '100%',
  },
});

export default OptimizedImage;
