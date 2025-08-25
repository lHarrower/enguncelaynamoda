/**
 * Navigation Component Styles
 * Part of AYNAMODA Unified Design System
 *
 * Provides consistent navigation styling for tab bars and navigation elements
 * Following Digital Zen Garden philosophy with premium feel
 */

import { TextStyle, ViewStyle } from 'react-native';

import {
  BORDER_RADIUS,
  ELEVATION,
  GLASSMORPHISM,
  SPACING,
  TYPOGRAPHY,
  UNIFIED_COLORS,
} from '@/theme/tokens';

export const NAVIGATION_VARIANTS = {
  // Tab Bar - Bottom navigation
  tabBar: {
    container: {
      ...GLASSMORPHISM.navigation,
      height: 80,
      paddingBottom: 20,
      paddingTop: 12,
      paddingHorizontal: SPACING.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    } as ViewStyle,

    // Tab item container
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.xs,
    } as ViewStyle,

    // Active tab item
    activeTabItem: {
      backgroundColor: UNIFIED_COLORS.sage[100],
      borderRadius: BORDER_RADIUS.lg,
      paddingHorizontal: SPACING.md,
    } as ViewStyle,

    // Tab label
    tabLabel: {
      ...TYPOGRAPHY.caption.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.tertiary,
      marginTop: SPACING.xs,
      textAlign: 'center',
    } as TextStyle,

    // Active tab label
    activeTabLabel: {
      color: UNIFIED_COLORS.sage[700],
      fontWeight: '600',
    } as TextStyle,
  },

  // Header Navigation
  header: {
    container: {
      backgroundColor: UNIFIED_COLORS.background.primary,
      paddingTop: 44, // Status bar height
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: UNIFIED_COLORS.background.secondary,
      ...ELEVATION.soft,
    } as ViewStyle,

    // Header content area
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    } as ViewStyle,

    // Header title
    title: {
      ...TYPOGRAPHY.scale.h2,
      fontFamily: TYPOGRAPHY.fontFamily.headline,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
      textAlign: 'center',
    } as TextStyle,

    // Header subtitle
    subtitle: {
      ...TYPOGRAPHY.body.small,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.secondary,
      textAlign: 'center',
      marginTop: SPACING.xs,
    } as TextStyle,
  },

  // Glass Header - Transparent overlay
  glassHeader: {
    container: {
      ...GLASSMORPHISM.light,
      paddingTop: 44,
      paddingBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    } as ViewStyle,

    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    } as ViewStyle,

    title: {
      ...TYPOGRAPHY.scale.h3,
      fontFamily: TYPOGRAPHY.fontFamily.headline,
      color: UNIFIED_COLORS.text.primary,
      flex: 1,
      textAlign: 'center',
      fontWeight: '600',
    } as TextStyle,
  },

  // Side Navigation
  sidebar: {
    container: {
      backgroundColor: UNIFIED_COLORS.background.elevated,
      width: 280,
      paddingTop: 60,
      paddingHorizontal: SPACING.lg,
      ...ELEVATION.high,
    } as ViewStyle,

    // Navigation item
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: BORDER_RADIUS.lg,
      marginVertical: SPACING.xs,
    } as ViewStyle,

    // Active navigation item
    activeItem: {
      backgroundColor: UNIFIED_COLORS.sage[100],
      borderLeftWidth: 3,
      borderLeftColor: UNIFIED_COLORS.sage[500],
    } as ViewStyle,

    // Navigation item text
    itemText: {
      ...TYPOGRAPHY.body.medium,
      fontFamily: TYPOGRAPHY.fontFamily.body,
      color: UNIFIED_COLORS.text.primary,
      marginLeft: SPACING.md,
      flex: 1,
    } as TextStyle,

    // Active navigation item text
    activeItemText: {
      color: UNIFIED_COLORS.sage[700],
      fontWeight: '600',
    } as TextStyle,
  },
} as const;

// Navigation button styles
export const NAV_BUTTONS = {
  // Back button
  back: {
    container: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: UNIFIED_COLORS.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      ...ELEVATION.soft,
    } as ViewStyle,

    pressed: {
      backgroundColor: UNIFIED_COLORS.background.secondary,
      ...ELEVATION.medium,
    } as ViewStyle,
  },

  // Menu button
  menu: {
    container: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    pressed: {
      backgroundColor: UNIFIED_COLORS.background.secondary,
    } as ViewStyle,
  },

  // Close button
  close: {
    container: {
      width: 32,
      height: 32,
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: UNIFIED_COLORS.background.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    pressed: {
      backgroundColor: UNIFIED_COLORS.text.tertiary,
    } as ViewStyle,
  },

  // Floating action button
  fab: {
    container: {
      width: 56,
      height: 56,
      borderRadius: BORDER_RADIUS.round,
      backgroundColor: UNIFIED_COLORS.sage[500],
      alignItems: 'center',
      justifyContent: 'center',
      ...ELEVATION.floating,
      position: 'absolute',
      bottom: 100,
      right: SPACING.lg,
    } as ViewStyle,

    pressed: {
      backgroundColor: UNIFIED_COLORS.sage[700],
      ...ELEVATION.high,
      transform: [{ scale: 0.95 }],
    } as ViewStyle,
  },
} as const;

// Breadcrumb navigation
export const BREADCRUMB = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: UNIFIED_COLORS.background.secondary,
  } as ViewStyle,

  item: {
    ...TYPOGRAPHY.body.small,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    color: UNIFIED_COLORS.text.secondary,
  } as TextStyle,

  activeItem: {
    color: UNIFIED_COLORS.text.primary,
    fontWeight: '600',
  } as TextStyle,

  separator: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.tertiary,
    marginHorizontal: SPACING.sm,
  } as TextStyle,
} as const;

// Pagination navigation
export const PAGINATION = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  } as ViewStyle,

  button: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: UNIFIED_COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...ELEVATION.soft,
  } as ViewStyle,

  activeButton: {
    backgroundColor: UNIFIED_COLORS.sage[500],
  } as ViewStyle,

  buttonText: {
    ...TYPOGRAPHY.body.small,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    color: UNIFIED_COLORS.text.primary,
    fontWeight: '600',
  } as TextStyle,

  activeButtonText: {
    color: UNIFIED_COLORS.text.inverse,
  } as TextStyle,
} as const;

// Export for easy access
export const NavigationStyles = NAVIGATION_VARIANTS;
export default NAVIGATION_VARIANTS;

// Type definitions
export type NavigationVariant = keyof typeof NAVIGATION_VARIANTS;
export type NavButtonType = keyof typeof NAV_BUTTONS;
