/**
 * Components Index
 * 
 * Main entry point for all components following atomic design principles.
 * Exports atoms, molecules, and organisms with clear categorization.
 */

// Atomic Design Exports
export * from '@/components/atoms';
export * from '@/components/molecules';
export * from '@/components/organisms';

// Shared Components
export * from '@/components/shared';

// Individual Components
export { default as ErrorBoundary } from '@/components/ErrorBoundary';
export { default as StyleMatchCircle } from '@/components/StyleMatchCircle';
export { default as UndoNotification } from '@/components/UndoNotification';
export { default as ModernLoading } from '@/components/ModernLoading';
export { default as ModernActionSheet } from '@/components/ModernActionSheet';
export { default as PermissionManager } from '@/components/PermissionManager';
export { default as GoldShimmer } from '@/components/GoldShimmer';
export { default as FloatingActionButton } from '@/components/FloatingActionButton';
export { default as DebugOverlayRemover } from '@/components/DebugOverlayRemover';
export { default as CustomModal } from '@/components/CustomModal';

// Feature-based component collections
export * as AuthComponents from '@/components/auth';
export * as NavigationComponents from '@/components/navigation';
export * as WardrobeComponents from '@/components/wardrobe';
export * as OnboardingComponents from '@/components/onboarding';
export * as ProfileComponents from '@/components/profile';
export * as FeedbackComponents from '@/components/feedback';
export * as HomeComponents from '@/components/home';
export * as DiscoveryComponents from '@/components/discovery';
export * as LuxuryComponents from '@/components/luxury';
export * as PremiumComponents from '@/components/premium';
export * as StudioComponents from '@/components/studio';
export * as VisionComponents from '@/components/vision';
export * as CommonComponents from '@/components/common';
export * as EditorialComponents from '@/components/editorial';
export * as ArtistryComponents from '@/components/artistry';
export * as AtmosphericComponents from '@/components/atmospheric';
export * as AuraComponents from '@/components/aura';
export * as AntiConsumptionComponents from '@/components/antiConsumption';
export * as AynaMirrorComponents from '@/components/aynaMirror';
export * as SanctuaryComponents from '@/components/sanctuary';
export * as UltraComponents from '@/components/ultra';
export * as DemoComponents from '@/components/demo';

/**
 * Atomic Design Component Categories
 * 
 * ATOMS: Basic building blocks (Button, Input, Text, etc.)
 * MOLECULES: Functional combinations of atoms (FormField, Card, etc.)
 * ORGANISMS: Complex interface sections (Header, Form, Dashboard, etc.)
 * 
 * This structure promotes:
 * - Reusability and consistency
 * - Clear component hierarchy
 * - Easier testing and maintenance
 * - Better design system adherence
 */