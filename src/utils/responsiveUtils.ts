import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for different device types
export const BREAKPOINTS = {
  xs: 0, // Small phones
  sm: 375, // Standard phones
  md: 414, // Large phones
  lg: 768, // Tablets
  xl: 1024, // Large tablets
  xxl: 1440, // Desktop
} as const;

// Device type detection
export const getDeviceType = () => {
  if (SCREEN_WIDTH < BREAKPOINTS.sm) {
    return 'xs';
  }
  if (SCREEN_WIDTH < BREAKPOINTS.md) {
    return 'sm';
  }
  if (SCREEN_WIDTH < BREAKPOINTS.lg) {
    return 'md';
  }
  if (SCREEN_WIDTH < BREAKPOINTS.xl) {
    return 'lg';
  }
  if (SCREEN_WIDTH < BREAKPOINTS.xxl) {
    return 'xl';
  }
  return 'xxl';
};

// Responsive width/height functions
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Responsive font size
export const responsiveFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base on iPhone X width
  const newSize = size * scale;

  // Ensure minimum and maximum font sizes
  const minSize = size * 0.8;
  const maxSize = size * 1.3;

  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Responsive spacing
export const responsiveSpacing = (size: number): number => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'xs':
      return size * 0.8;
    case 'sm':
      return size;
    case 'md':
      return size * 1.1;
    case 'lg':
      return size * 1.3;
    case 'xl':
      return size * 1.5;
    case 'xxl':
      return size * 1.8;
    default:
      return size;
  }
};

// Grid columns based on screen size
export const getGridColumns = (): number => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'xs':
    case 'sm':
      return 2;
    case 'md':
      return 2;
    case 'lg':
      return 3;
    case 'xl':
    case 'xxl':
      return 4;
    default:
      return 2;
  }
};

// Responsive padding/margin
export const getResponsivePadding = () => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'xs':
      return { horizontal: 12, vertical: 8 };
    case 'sm':
      return { horizontal: 16, vertical: 12 };
    case 'md':
      return { horizontal: 20, vertical: 16 };
    case 'lg':
      return { horizontal: 24, vertical: 20 };
    case 'xl':
      return { horizontal: 32, vertical: 24 };
    case 'xxl':
      return { horizontal: 40, vertical: 32 };
    default:
      return { horizontal: 16, vertical: 12 };
  }
};

// Check if device is tablet
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.lg;
};

// Check if device is phone
export const isPhone = (): boolean => {
  return SCREEN_WIDTH < BREAKPOINTS.lg;
};

// Get safe area multiplier
export const getSafeAreaMultiplier = (): number => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'xs':
    case 'sm':
      return 1;
    case 'md':
      return 1.1;
    case 'lg':
      return 1.2;
    case 'xl':
    case 'xxl':
      return 1.3;
    default:
      return 1;
  }
};

// Responsive border radius
export const responsiveBorderRadius = (radius: number): number => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'xs':
      return radius * 0.8;
    case 'sm':
      return radius;
    case 'md':
      return radius * 1.1;
    case 'lg':
      return radius * 1.2;
    case 'xl':
    case 'xxl':
      return radius * 1.3;
    default:
      return radius;
  }
};

// Get responsive image dimensions
export const getResponsiveImageSize = (baseWidth: number, baseHeight: number) => {
  const scale = Math.min(wp(100) / baseWidth, hp(100) / baseHeight);

  return {
    width: baseWidth * scale,
    height: baseHeight * scale,
  };
};

// Responsive hook for real-time updates
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    isTablet: dimensions.width >= BREAKPOINTS.lg,
    isPhone: dimensions.width < BREAKPOINTS.lg,
    deviceType: getDeviceType(),
  };
};
