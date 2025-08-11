/**
 * Shared Components Index
 * 
 * Exports all shared and standardized components for easy importing
 * throughout the AYNAMODA application.
 */

// Export shared components
export { default as SwipeableCard } from './SwipeableCard';
export { default as DiscoverStats } from '../vision/shared/DiscoverStats';
export { default as SwipeStack } from './SwipeStack';

// Export standardized components
export { default as StandardButton, type StandardButtonProps } from './StandardButton';
export { default as StandardInput, type StandardInputProps, type StandardInputRef } from './StandardInput';
export { default as StandardCard, type StandardCardProps } from './StandardCard';

// Export component prop types
export * from '@/types/componentProps';