/**
 * Components Index
 *
 * Main entry point for core components following atomic design principles.
 * Only exports actively used components to optimize bundle size.
 */

// Atomic Design Exports
export * from '@/components/atoms';
export * from '@/components/molecules';
export * from '@/components/organisms';
export * from '@/components/shared';

// Essential Individual Components
export { default as ErrorBoundary } from '@/components/error/ErrorBoundary';
export { default as PermissionManager } from '@/components/PermissionManager';

// Core Feature Collections
export * as AuthComponents from '@/components/auth';
export * as HomeComponents from '@/components/home';
export * as NavigationComponents from '@/components/navigation';
export * as OnboardingComponents from '@/components/onboarding';
export * as WardrobeComponents from '@/components/wardrobe';

// Modern UI Components
export * from './modern';

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
