/**
 * Stack Layout System
 * Part of AYNAMODA Unified Design System
 *
 * Provides vertical stacking layouts for content organization
 * Optimized for mobile-first design with consistent spacing
 * Following Digital Zen Garden philosophy with clean vertical rhythm
 */

import { ViewStyle } from 'react-native';

import { BORDER_RADIUS, ELEVATION, SPACING, UNIFIED_COLORS } from '@/theme/tokens';

export const STACK_LAYOUTS = {
  // Basic vertical stack
  vertical: {
    container: {
      flex: 1,
    } as ViewStyle,

    // Tight spacing for compact layouts
    tight: {
      gap: SPACING.xs,
    } as ViewStyle,

    // Normal spacing for balanced layouts
    normal: {
      gap: SPACING.md,
    } as ViewStyle,

    // Loose spacing for premium feel
    loose: {
      gap: SPACING.lg,
    } as ViewStyle,

    // Luxury spacing for high-end layouts
    luxury: {
      gap: SPACING.xl,
    } as ViewStyle,
  },

  // Horizontal stack (for button groups, etc.)
  horizontal: {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    // Tight spacing
    tight: {
      gap: SPACING.xs,
    } as ViewStyle,

    // Normal spacing
    normal: {
      gap: SPACING.sm,
    } as ViewStyle,

    // Loose spacing
    loose: {
      gap: SPACING.md,
    } as ViewStyle,

    // Luxury spacing
    luxury: {
      gap: SPACING.lg,
    } as ViewStyle,
  },

  // Card stack for layered content
  cardStack: {
    container: {
      flex: 1,
      paddingHorizontal: SPACING.md,
    } as ViewStyle,

    // Individual card in stack
    card: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.lg,
      ...ELEVATION.soft,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
    } as ViewStyle,

    // Premium card variant
    premiumCard: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.xl,
      ...ELEVATION.medium,
      padding: SPACING.xl,
      marginBottom: SPACING.lg,
    } as ViewStyle,

    // Luxury card variant
    luxuryCard: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.organic,
      ...ELEVATION.organic,
      padding: SPACING.xxl,
      marginBottom: SPACING.xl,
    } as ViewStyle,
  },

  // Section stack for content organization
  sectionStack: {
    container: {
      flex: 1,
    } as ViewStyle,

    // Section with header
    section: {
      marginBottom: SPACING.xl,
    } as ViewStyle,

    // Section header
    sectionHeader: {
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: UNIFIED_COLORS.neutral[200],
      marginBottom: SPACING.lg,
    } as ViewStyle,

    // Section content
    sectionContent: {
      paddingHorizontal: SPACING.md,
    } as ViewStyle,
  },

  // Form stack for input layouts
  formStack: {
    container: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.xl,
    } as ViewStyle,

    // Field group
    fieldGroup: {
      marginBottom: SPACING.lg,
    } as ViewStyle,

    // Field with label
    field: {
      marginBottom: SPACING.md,
    } as ViewStyle,

    // Field label
    fieldLabel: {
      marginBottom: SPACING.sm,
    } as ViewStyle,

    // Field helper text
    fieldHelper: {
      marginTop: SPACING.xs,
    } as ViewStyle,

    // Action buttons group
    actions: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginTop: SPACING.xl,
      paddingTop: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: UNIFIED_COLORS.neutral[200],
    } as ViewStyle,
  },
} as const;

// Stack item configurations
export const STACK_ITEMS = {
  // Content item with consistent padding
  contentItem: {
    base: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    } as ViewStyle,

    // With background
    withBackground: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.md,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Interactive item
    interactive: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderRadius: BORDER_RADIUS.md,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Pressed state for interactive items
    pressed: {
      backgroundColor: UNIFIED_COLORS.sage[100],
      ...ELEVATION.none,
      transform: [{ scale: 0.98 }],
    } as ViewStyle,
  },

  // Divider between stack items
  divider: {
    // Simple line divider
    line: {
      height: 1,
      backgroundColor: UNIFIED_COLORS.neutral[200],
      marginVertical: SPACING.md,
    } as ViewStyle,

    // Spaced divider
    spaced: {
      height: 1,
      backgroundColor: UNIFIED_COLORS.neutral[200],
      marginVertical: SPACING.lg,
      marginHorizontal: SPACING.xl,
    } as ViewStyle,

    // Invisible spacer
    spacer: {
      height: SPACING.lg,
    } as ViewStyle,

    // Large spacer
    largeSpacer: {
      height: SPACING.xl,
    } as ViewStyle,
  },

  // Header items
  header: {
    // Main header
    main: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.lg,
      backgroundColor: UNIFIED_COLORS.background.primary,
    } as ViewStyle,

    // Section header
    section: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: UNIFIED_COLORS.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: UNIFIED_COLORS.neutral[200],
    } as ViewStyle,

    // Sticky header
    sticky: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: UNIFIED_COLORS.background.primary,
      ...ELEVATION.soft,
    } as ViewStyle,
  },
} as const;

// Stack alignment options
export const STACK_ALIGNMENT = {
  // Horizontal alignment
  horizontal: {
    start: {
      alignItems: 'flex-start',
    } as ViewStyle,

    center: {
      alignItems: 'center',
    } as ViewStyle,

    end: {
      alignItems: 'flex-end',
    } as ViewStyle,

    stretch: {
      alignItems: 'stretch',
    } as ViewStyle,
  },

  // Vertical alignment (for horizontal stacks)
  vertical: {
    start: {
      justifyContent: 'flex-start',
    } as ViewStyle,

    center: {
      justifyContent: 'center',
    } as ViewStyle,

    end: {
      justifyContent: 'flex-end',
    } as ViewStyle,

    spaceBetween: {
      justifyContent: 'space-between',
    } as ViewStyle,

    spaceAround: {
      justifyContent: 'space-around',
    } as ViewStyle,

    spaceEvenly: {
      justifyContent: 'space-evenly',
    } as ViewStyle,
  },
} as const;

// Stack interaction states
export const STACK_INTERACTIONS = {
  // Scrollable stack
  scrollable: {
    container: {
      flex: 1,
    } as ViewStyle,

    // Content container with padding
    content: {
      paddingVertical: SPACING.lg,
    } as ViewStyle,

    // Scroll indicators
    scrollIndicator: {
      position: 'absolute',
      right: SPACING.xs,
      width: 4,
      backgroundColor: UNIFIED_COLORS.sage[300],
      borderRadius: 2,
      opacity: 0.6,
    } as ViewStyle,
  },

  // Collapsible stack sections
  collapsible: {
    // Section header (clickable)
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.lg,
      backgroundColor: UNIFIED_COLORS.background.secondary,
      borderRadius: BORDER_RADIUS.md,
    } as ViewStyle,

    // Expanded content
    content: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.lg,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      borderBottomLeftRadius: BORDER_RADIUS.md,
      borderBottomRightRadius: BORDER_RADIUS.md,
    } as ViewStyle,

    // Collapse indicator
    indicator: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
  },

  // Reorderable stack
  reorderable: {
    // Item being dragged
    dragging: {
      ...ELEVATION.high,
      transform: [{ scale: 1.05 }],
      opacity: 0.9,
    } as ViewStyle,

    // Drop zone indicator
    dropZone: {
      height: 4,
      backgroundColor: UNIFIED_COLORS.sage[500],
      borderRadius: 2,
      marginVertical: SPACING.xs,
    } as ViewStyle,

    // Drag handle
    dragHandle: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0.6,
    } as ViewStyle,
  },
} as const;

// Animation configurations for stack layouts
export const STACK_ANIMATIONS = {
  // Item entrance animations
  entrance: {
    // Slide in from bottom
    slideInBottom: {
      duration: 400,
      easing: 'easeOutQuart',
      initialTransform: [{ translateY: 50 }],
      initialOpacity: 0,
    },

    // Fade in with scale
    fadeInScale: {
      duration: 300,
      easing: 'easeOutBack',
      initialTransform: [{ scale: 0.9 }],
      initialOpacity: 0,
    },

    // Staggered entrance
    staggered: {
      duration: 200,
      easing: 'easeOutQuart',
      staggerDelay: 50,
      initialTransform: [{ translateY: 20 }],
      initialOpacity: 0,
    },
  },

  // Layout change animations
  layoutChange: {
    duration: 300,
    easing: 'easeInOutQuart',
  },

  // Collapse/expand animations
  collapse: {
    duration: 250,
    easing: 'easeInOutCubic',
  },

  // Reorder animations
  reorder: {
    duration: 200,
    easing: 'easeOutQuart',
  },
} as const;

// Responsive configurations
export const STACK_RESPONSIVE = {
  // Mobile-first spacing
  mobile: {
    padding: SPACING.md,
    gap: SPACING.sm,
    itemPadding: SPACING.sm,
  },

  // Tablet spacing
  tablet: {
    padding: SPACING.lg,
    gap: SPACING.md,
    itemPadding: SPACING.md,
  },

  // Desktop spacing
  desktop: {
    padding: SPACING.xl,
    gap: SPACING.lg,
    itemPadding: SPACING.lg,
  },
} as const;

// Helper functions
export const getStackSpacing = (density: 'tight' | 'normal' | 'loose' | 'luxury') => {
  switch (density) {
    case 'tight':
      return SPACING.xs;
    case 'normal':
      return SPACING.md;
    case 'loose':
      return SPACING.lg;
    case 'luxury':
      return SPACING.xl;
    default:
      return SPACING.md;
  }
};

export const getStackPadding = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return SPACING.sm;
    case 'medium':
      return SPACING.md;
    case 'large':
      return SPACING.lg;
    default:
      return SPACING.md;
  }
};

// Create stack with custom spacing
export const createStack = (
  spacing: number,
  alignment?: 'start' | 'center' | 'end' | 'stretch',
) => {
  const baseStyle: ViewStyle = {
    gap: spacing,
  };

  if (alignment) {
    return {
      ...baseStyle,
      ...STACK_ALIGNMENT.horizontal[alignment],
    };
  }

  return baseStyle;
};

// Create horizontal stack
export const createHorizontalStack = (
  spacing: number,
  alignment?: 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly',
) => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    gap: spacing,
  };

  if (alignment) {
    return {
      ...baseStyle,
      ...STACK_ALIGNMENT.vertical[alignment],
    };
  }

  return baseStyle;
};

// Export for easy access
export const StackLayouts = STACK_LAYOUTS;
export default STACK_LAYOUTS;

// Type definitions
export type StackLayoutType = keyof typeof STACK_LAYOUTS;
export type StackItemType = keyof typeof STACK_ITEMS;
export type StackAlignment = keyof typeof STACK_ALIGNMENT.horizontal;
export type StackJustification = keyof typeof STACK_ALIGNMENT.vertical;
export type StackDensity = 'tight' | 'normal' | 'loose' | 'luxury';
export type StackSize = 'small' | 'medium' | 'large';
