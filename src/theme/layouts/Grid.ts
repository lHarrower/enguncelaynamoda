/**
 * Grid Layout System
 * Part of AYNAMODA Unified Design System
 *
 * Provides traditional grid layouts for product listings and galleries
 * Responsive, accessible, and optimized for fashion content
 * Following Digital Zen Garden philosophy with clean, organized structures
 */

import { Dimensions, ViewStyle } from 'react-native';

import { BORDER_RADIUS, ELEVATION, SPACING, UNIFIED_COLORS } from '@/theme/tokens';
import { logInDev } from '@/utils/consoleSuppress';

const { width: screenWidth } = Dimensions.get('window');
const GRID_PADDING = SPACING.md;
const AVAILABLE_WIDTH = screenWidth - GRID_PADDING * 2;

export const GRID_LAYOUTS = {
  // Standard product grid
  productGrid: {
    container: {
      flex: 1,
      paddingHorizontal: GRID_PADDING,
      paddingVertical: SPACING.lg,
    } as ViewStyle,

    // Two column grid
    twoColumn: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: SPACING.md,
    } as ViewStyle,

    // Three column grid
    threeColumn: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    } as ViewStyle,

    // Single column (list view)
    singleColumn: {
      gap: SPACING.lg,
    } as ViewStyle,

    // Grid item base styles
    gridItem: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      overflow: 'hidden',
    } as ViewStyle,
  },

  // Masonry-style grid (Pinterest-like)
  masonryGrid: {
    container: {
      flex: 1,
      paddingHorizontal: GRID_PADDING,
    } as ViewStyle,

    // Column wrapper
    column: {
      flex: 1,
      paddingHorizontal: SPACING.xs,
    } as ViewStyle,

    // Masonry item
    masonryItem: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      marginBottom: SPACING.md,
      overflow: 'hidden',
    } as ViewStyle,
  },

  // Gallery grid with aspect ratios
  galleryGrid: {
    container: {
      flex: 1,
      paddingHorizontal: GRID_PADDING,
    } as ViewStyle,

    // Square aspect ratio (1:1)
    square: {
      aspectRatio: 1,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      overflow: 'hidden',
    } as ViewStyle,

    // Portrait aspect ratio (3:4)
    portrait: {
      aspectRatio: 3 / 4,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      overflow: 'hidden',
    } as ViewStyle,

    // Landscape aspect ratio (4:3)
    landscape: {
      aspectRatio: 4 / 3,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      overflow: 'hidden',
    } as ViewStyle,

    // Wide aspect ratio (16:9)
    wide: {
      aspectRatio: 16 / 9,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      overflow: 'hidden',
    } as ViewStyle,
  },

  // Staggered grid for dynamic layouts
  staggeredGrid: {
    container: {
      flex: 1,
      paddingHorizontal: GRID_PADDING,
    } as ViewStyle,

    // Row with mixed sizes
    staggeredRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    } as ViewStyle,

    // Large item (2/3 width)
    largeItem: {
      flex: 2,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      ...ELEVATION.medium,
      overflow: 'hidden',
    } as ViewStyle,

    // Small item (1/3 width)
    smallItem: {
      flex: 1,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      overflow: 'hidden',
    } as ViewStyle,
  },
} as const;

// Grid item sizes for different layouts
export const GRID_SIZES = {
  // Two column grid item widths
  twoColumn: {
    width: (AVAILABLE_WIDTH - SPACING.md) / 2,
    minHeight: 200,
  },

  // Three column grid item widths
  threeColumn: {
    width: (AVAILABLE_WIDTH - SPACING.sm * 2) / 3,
    minHeight: 150,
  },

  // Single column (full width)
  singleColumn: {
    width: AVAILABLE_WIDTH,
    minHeight: 120,
  },

  // Masonry column widths
  masonryColumn: {
    twoColumn: (AVAILABLE_WIDTH - SPACING.xs) / 2,
    threeColumn: (AVAILABLE_WIDTH - SPACING.xs * 2) / 3,
  },
} as const;

// Grid spacing configurations
export const GRID_SPACING = {
  // Tight spacing for dense layouts
  tight: {
    horizontal: SPACING.xs,
    vertical: SPACING.sm,
    padding: SPACING.sm,
  },

  // Normal spacing for balanced layouts
  normal: {
    horizontal: SPACING.sm,
    vertical: SPACING.md,
    padding: SPACING.md,
  },

  // Loose spacing for premium feel
  loose: {
    horizontal: SPACING.md,
    vertical: SPACING.lg,
    padding: SPACING.lg,
  },

  // Luxury spacing for high-end layouts
  luxury: {
    horizontal: SPACING.lg,
    vertical: SPACING.xl,
    padding: SPACING.xl,
  },
} as const;

// Grid interaction states
export const GRID_INTERACTIONS = {
  // Item selection states
  selection: {
    // Default state
    default: {
      borderWidth: 0,
      transform: [{ scale: 1 }],
    } as ViewStyle,

    // Hovered/focused state
    focused: {
      ...ELEVATION.medium,
      transform: [{ scale: 1.02 }],
      borderWidth: 2,
      borderColor: UNIFIED_COLORS.sage[300],
    } as ViewStyle,

    // Selected state
    selected: {
      ...ELEVATION.high,
      transform: [{ scale: 1.05 }],
      borderWidth: 3,
      borderColor: UNIFIED_COLORS.sage[500],
      backgroundColor: UNIFIED_COLORS.sage[100],
    } as ViewStyle,

    // Pressed state
    pressed: {
      transform: [{ scale: 0.98 }],
      ...ELEVATION.none,
    } as ViewStyle,
  },

  // Multi-select mode
  multiSelect: {
    // Selection indicator overlay
    indicator: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: UNIFIED_COLORS.sage[500],
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    } as ViewStyle,

    // Unselected indicator
    unselected: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: UNIFIED_COLORS.background.elevated,
    } as ViewStyle,
  },

  // Loading states
  loading: {
    // Skeleton placeholder
    skeleton: {
      backgroundColor: UNIFIED_COLORS.neutral[100],
      opacity: 0.7,
    } as ViewStyle,

    // Shimmer effect container
    shimmer: {
      overflow: 'hidden',
      backgroundColor: UNIFIED_COLORS.neutral[50],
    } as ViewStyle,
  },
} as const;

// Grid header and footer components
export const GRID_COMPONENTS = {
  // Section headers
  sectionHeader: {
    container: {
      paddingHorizontal: GRID_PADDING,
      paddingVertical: SPACING.lg,
      backgroundColor: UNIFIED_COLORS.background.primary,
    } as ViewStyle,

    // Header with action button
    withAction: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,
  },

  // Load more footer
  loadMore: {
    container: {
      paddingHorizontal: GRID_PADDING,
      paddingVertical: SPACING.xl,
      alignItems: 'center',
    } as ViewStyle,

    // Loading indicator
    loading: {
      paddingVertical: SPACING.lg,
    } as ViewStyle,
  },

  // Empty state
  emptyState: {
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xxl,
    } as ViewStyle,
  },

  // Filter bar
  filterBar: {
    container: {
      paddingHorizontal: GRID_PADDING,
      paddingVertical: SPACING.md,
      backgroundColor: UNIFIED_COLORS.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: UNIFIED_COLORS.neutral[200],
    } as ViewStyle,

    // Filter chips container
    chips: {
      flexDirection: 'row',
      gap: SPACING.sm,
    } as ViewStyle,
  },
} as const;

// Animation configurations for grid layouts
export const GRID_ANIMATIONS = {
  // Item entrance animations
  entrance: {
    // Staggered fade in
    staggeredFadeIn: {
      duration: 400,
      easing: 'easeOutQuart',
      staggerDelay: 100,
      initialOpacity: 0,
      initialTransform: [{ translateY: 20 }],
    },

    // Scale in animation
    scaleIn: {
      duration: 300,
      easing: 'easeOutBack',
      initialOpacity: 0,
      initialTransform: [{ scale: 0.8 }],
    },

    // Slide up animation
    slideUp: {
      duration: 500,
      easing: 'easeOutCubic',
      initialOpacity: 0,
      initialTransform: [{ translateY: 50 }],
    },
  },

  // Layout change animations
  layoutChange: {
    duration: 400,
    easing: 'easeInOutQuart',
  },

  // Selection animations
  selection: {
    duration: 200,
    easing: 'easeOutCubic',
  },

  // Scroll animations
  scroll: {
    // Parallax effect
    parallax: {
      factor: 0.5,
      easing: 'linear',
    },

    // Reveal on scroll
    reveal: {
      threshold: 0.1,
      duration: 600,
      easing: 'easeOutQuart',
    },
  },
} as const;

// Responsive breakpoints for grid layouts
export const GRID_BREAKPOINTS = {
  small: {
    maxWidth: 480,
    columns: 2,
    spacing: GRID_SPACING.tight,
  },

  medium: {
    maxWidth: 768,
    columns: 3,
    spacing: GRID_SPACING.normal,
  },

  large: {
    maxWidth: 1024,
    columns: 4,
    spacing: GRID_SPACING.loose,
  },

  xlarge: {
    maxWidth: Infinity,
    columns: 5,
    spacing: GRID_SPACING.luxury,
  },
} as const;

// Helper functions
export const getGridItemWidth = (columns: number, spacing: number = SPACING.md) => {
  return (AVAILABLE_WIDTH - spacing * (columns - 1)) / columns;
};

export const getGridColumns = (viewportWidth: number) => {
  // Defensive check to prevent undefined access
  if (!GRID_BREAKPOINTS || !GRID_BREAKPOINTS.medium) {
    logInDev('GRID_BREAKPOINTS not properly initialized');
    return 2; // fallback
  }

  if (viewportWidth <= GRID_BREAKPOINTS.small.maxWidth) {
    return GRID_BREAKPOINTS.small.columns;
  }
  if (viewportWidth <= GRID_BREAKPOINTS.medium.maxWidth) {
    return GRID_BREAKPOINTS.medium.columns;
  }
  if (viewportWidth <= GRID_BREAKPOINTS.large.maxWidth) {
    return GRID_BREAKPOINTS.large.columns;
  }
  return GRID_BREAKPOINTS.xlarge.columns;
};

export const getGridSpacing = (viewportWidth: number) => {
  // Defensive check to prevent undefined access
  if (!GRID_BREAKPOINTS || !GRID_BREAKPOINTS.medium) {
    logInDev('GRID_BREAKPOINTS not properly initialized');
    return GRID_SPACING.normal; // fallback
  }

  if (viewportWidth <= GRID_BREAKPOINTS.small.maxWidth) {
    return GRID_BREAKPOINTS.small.spacing;
  }
  if (viewportWidth <= GRID_BREAKPOINTS.medium.maxWidth) {
    return GRID_BREAKPOINTS.medium.spacing;
  }
  if (viewportWidth <= GRID_BREAKPOINTS.large.maxWidth) {
    return GRID_BREAKPOINTS.large.spacing;
  }
  return GRID_BREAKPOINTS.xlarge.spacing;
};

// Masonry layout helper
export const getMasonryItemHeight = (index: number, baseHeight: number = 200) => {
  const variations = [1, 1.2, 0.8, 1.5, 0.9, 1.3, 1.1] as const;
  const safeIdx = variations.length ? index % variations.length : 0;
  const factor = variations[safeIdx] ?? 1;
  return baseHeight * factor;
};

// Export for easy access
export const GridLayouts = GRID_LAYOUTS;
export default GRID_LAYOUTS;

// Type definitions
export type GridLayoutType = keyof typeof GRID_LAYOUTS;
export type GridSizeType = keyof typeof GRID_SIZES;
export type GridSpacingType = keyof typeof GRID_SPACING;
export type GridInteractionState = keyof typeof GRID_INTERACTIONS.selection;
export type GridAnimationType = keyof typeof GRID_ANIMATIONS;
export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS;
