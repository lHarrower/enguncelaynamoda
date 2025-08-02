/**
 * Layout Systems Index
 * Part of AYNAMODA Unified Design System
 * 
 * Exports all layout pattern systems for easy importing
 */

// Layout Systems - Import first, then re-export
import { BentoBoxLayouts, BENTO_LAYOUTS, BENTO_PATTERNS, BENTO_ANIMATIONS, BENTO_BREAKPOINTS } from './BentoBox';
import { CollageLayouts, COLLAGE_LAYOUTS, COLLAGE_INTERACTIONS, EFFICIENCY_INDICATOR, COLLAGE_ANIMATIONS, COLLAGE_RESPONSIVE } from './Collage';
import { GridLayouts, GRID_LAYOUTS, GRID_SIZES, GRID_SPACING, GRID_INTERACTIONS, GRID_COMPONENTS, GRID_ANIMATIONS, GRID_BREAKPOINTS } from './Grid';
import { StackLayouts, STACK_LAYOUTS, STACK_ITEMS, STACK_ALIGNMENT, STACK_INTERACTIONS, STACK_ANIMATIONS, STACK_RESPONSIVE } from './Stack';

// Re-export for external use
export { BentoBoxLayouts, BENTO_LAYOUTS, BENTO_PATTERNS, BENTO_ANIMATIONS, BENTO_BREAKPOINTS };
export { CollageLayouts, COLLAGE_LAYOUTS, COLLAGE_INTERACTIONS, EFFICIENCY_INDICATOR, COLLAGE_ANIMATIONS, COLLAGE_RESPONSIVE };
export { GridLayouts, GRID_LAYOUTS, GRID_SIZES, GRID_SPACING, GRID_INTERACTIONS, GRID_COMPONENTS, GRID_ANIMATIONS, GRID_BREAKPOINTS };
export { StackLayouts, STACK_LAYOUTS, STACK_ITEMS, STACK_ALIGNMENT, STACK_INTERACTIONS, STACK_ANIMATIONS, STACK_RESPONSIVE };

// Helper Functions
export { getBentoCardWidth, getBentoPattern } from './BentoBox';
export { getCollageCardPosition } from './Collage';
export { getGridItemWidth, getGridColumns, getGridSpacing, getMasonryItemHeight } from './Grid';
export { getStackSpacing, getStackPadding, createStack, createHorizontalStack } from './Stack';

// Type Definitions
export type {
  BentoCardSize,
  BentoContentType,
  BentoPattern,
  BentoBreakpoint
} from './BentoBox';

export type {
  CollageLayoutType,
  CollageInteraction,
  EfficiencyLevel,
  CollageAnimation
} from './Collage';

export type {
  GridLayoutType,
  GridSizeType,
  GridSpacingType,
  GridInteractionState,
  GridAnimationType,
  GridBreakpoint
} from './Grid';

export type {
  StackLayoutType,
  StackItemType,
  StackAlignment,
  StackJustification,
  StackDensity,
  StackSize
} from './Stack';

// Combined Layout System
export const LayoutSystems = {
  bento: BentoBoxLayouts,
  collage: CollageLayouts,
  grid: GridLayouts,
  stack: StackLayouts,
} as const;

export default LayoutSystems;