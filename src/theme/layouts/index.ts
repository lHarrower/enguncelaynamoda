/**
 * Layout Systems Index
 * Part of AYNAMODA Unified Design System
 *
 * Exports all layout pattern systems for easy importing
 */

// Layout Systems - Import first, then re-export
import {
  BENTO_ANIMATIONS,
  BENTO_BREAKPOINTS,
  BENTO_LAYOUTS,
  BENTO_PATTERNS,
  BentoBoxLayouts,
} from './BentoBox';
import {
  COLLAGE_ANIMATIONS,
  COLLAGE_INTERACTIONS,
  COLLAGE_LAYOUTS,
  COLLAGE_RESPONSIVE,
  CollageLayouts,
  EFFICIENCY_INDICATOR,
} from './Collage';
import {
  GRID_ANIMATIONS,
  GRID_BREAKPOINTS,
  GRID_COMPONENTS,
  GRID_INTERACTIONS,
  GRID_LAYOUTS,
  GRID_SIZES,
  GRID_SPACING,
  GridLayouts,
} from './Grid';
import {
  STACK_ALIGNMENT,
  STACK_ANIMATIONS,
  STACK_INTERACTIONS,
  STACK_ITEMS,
  STACK_LAYOUTS,
  STACK_RESPONSIVE,
  StackLayouts,
} from './Stack';

// Re-export for external use
export { BENTO_ANIMATIONS, BENTO_BREAKPOINTS, BENTO_LAYOUTS, BENTO_PATTERNS, BentoBoxLayouts };
export {
  COLLAGE_ANIMATIONS,
  COLLAGE_INTERACTIONS,
  COLLAGE_LAYOUTS,
  COLLAGE_RESPONSIVE,
  CollageLayouts,
  EFFICIENCY_INDICATOR,
};
export {
  GRID_ANIMATIONS,
  GRID_BREAKPOINTS,
  GRID_COMPONENTS,
  GRID_INTERACTIONS,
  GRID_LAYOUTS,
  GRID_SIZES,
  GRID_SPACING,
  GridLayouts,
};
export {
  STACK_ALIGNMENT,
  STACK_ANIMATIONS,
  STACK_INTERACTIONS,
  STACK_ITEMS,
  STACK_LAYOUTS,
  STACK_RESPONSIVE,
  StackLayouts,
};

// Helper Functions
export { getResponsiveCardWidth as getBentoCardWidth, getBentoPattern } from './BentoBox';
export { getCollageCardPosition } from './Collage';
export { getGridColumns, getGridItemWidth, getGridSpacing, getMasonryItemHeight } from './Grid';
export { createHorizontalStack, createStack, getStackPadding, getStackSpacing } from './Stack';

// Type Definitions
export type { BentoBreakpoint, BentoCardSize, BentoContentType, BentoPattern } from './BentoBox';
export type {
  CollageAnimation,
  CollageInteraction,
  CollageLayoutType,
  EfficiencyLevel,
} from './Collage';
export type {
  GridAnimationType,
  GridBreakpoint,
  GridInteractionState,
  GridLayoutType,
  GridSizeType,
  GridSpacingType,
} from './Grid';
export type {
  StackAlignment,
  StackDensity,
  StackItemType,
  StackJustification,
  StackLayoutType,
  StackSize,
} from './Stack';

// Combined Layout System
export const LayoutSystems = {
  bento: BentoBoxLayouts,
  collage: CollageLayouts,
  grid: GridLayouts,
  stack: StackLayouts,
} as const;

export default LayoutSystems;
