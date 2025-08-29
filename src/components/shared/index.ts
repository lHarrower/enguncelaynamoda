/**
 * Shared Components Index
 *
 * Exports all shared and standardized components for easy importing
 * throughout the AYNAMODA application.
 */

// Export shared components
export { OutfitCarousel } from './OutfitCarousel';
export { SectionHeader } from './SectionHeader';
export { StudioHeader } from './StudioHeader';
export { default as SwipeableCard } from './SwipeableCard';
export { default as SwipeStack } from './SwipeStack';
export { default as DiscoverStats } from '@/components/vision/shared/DiscoverStats';

// Export standardized components
export { default as StandardButton, type StandardButtonProps } from './StandardButton';
export { default as StandardCard, type StandardCardProps } from './StandardCard';
export {
  default as StandardInput,
  type StandardInputProps,
  type StandardInputRef,
} from './StandardInput';

// Export component prop types
export * from '@/types/componentProps';
