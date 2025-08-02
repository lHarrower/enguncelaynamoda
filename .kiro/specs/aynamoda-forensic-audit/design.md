# Design Document

## Overview

The AYNAMODA project requires a comprehensive design system transformation to achieve the "Digital Zen Garden" philosophy with "Confidence as a Service" at its core. The current codebase shows multiple conflicting theme systems and inconsistent design patterns that need consolidation into a unified, premium aesthetic that blends "Spotify's clean structure," "Gucci's polished luxury," and "calm, premium wellness" feel.

## Architecture

### Design System Architecture

The design system will be centralized in a single source of truth with the following hierarchy:

```
src/theme/
├── DesignSystem.ts          # Master design system export
├── foundations/
│   ├── Colors.ts           # Unified color palette
│   ├── Typography.ts       # Complete typography scale
│   ├── Spacing.ts          # Harmonious spacing system
│   ├── Elevation.ts        # Shadow and depth system
│   └── Animation.ts        # Motion and timing curves
├── components/
│   ├── Button.ts           # Button component styles
│   ├── Card.ts             # Card component styles
│   ├── Input.ts            # Input component styles
│   └── Navigation.ts       # Navigation component styles
└── layouts/
    ├── BentoBox.ts         # Dashboard grid layouts
    ├── Collage.ts          # Discovery screen layouts
    └── Screens.ts          # Screen-specific layouts
```

### Theme Consolidation Strategy

Currently, the project has multiple conflicting theme files:
- `src/constants/AppThemeV2.ts` (most comprehensive)
- `src/constants/Colors.ts` (luxury bright system)
- `src/theme/AppThemeV2.ts` (organic palette)
- Multiple specialized themes (Artistry, Atmospheric, Editorial, etc.)

The unified system will consolidate these into a single, coherent design language.

## Components and Interfaces

### Core Design Foundations

#### Color Palette
The unified color system will be based on the "Digital Zen Garden" philosophy:

```typescript
export const UNIFIED_COLORS = {
  // Primary Palette - Warm, Premium Base
  background: {
    primary: '#FAF9F6',      // Warm off-white/cream base
    secondary: '#F8F7F4',    // Subtle variation
    elevated: '#FEFEFE',     // Pure white for cards
    overlay: 'rgba(0,0,0,0.4)' // Modal overlays
  },
  
  // Accent Colors - Sophisticated & Natural
  sage: {
    50: '#F6F8F6',
    100: '#E8F0E8', 
    300: '#A8C8A8',
    500: '#5C8A5C',          // Primary sage green
    700: '#3A5F3A'
  },
  
  gold: {
    100: '#FFF9E6',
    300: '#FFE599',
    500: '#D4AF37',          // Elegant gold accent
    700: '#9C7A0F'
  },
  
  // Text Hierarchy - High Contrast
  text: {
    primary: '#212529',      // Dark ink gray
    secondary: '#495057',    // Medium gray
    tertiary: '#6C757D',     // Light gray
    inverse: '#FFFFFF'       // White text on dark
  },
  
  // Functional Colors
  success: '#5C8A5C',
  warning: '#D4AF37', 
  error: '#E57373',
  info: '#74C0FC'
}
```

#### Typography System
Elegant serif headlines with clean sans-serif body text:

```typescript
export const TYPOGRAPHY = {
  fonts: {
    headline: 'Playfair Display',  // Elegant serif for headlines
    body: 'Inter',                 // Clean sans-serif for body
    accent: 'Playfair Display'     // Serif for special elements
  },
  
  scale: {
    hero: { fontSize: 36, lineHeight: 44, fontWeight: '700' },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
    body1: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    body2: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
    button: { fontSize: 16, lineHeight: 20, fontWeight: '600' }
  }
}
```

#### Spacing & Layout System
Based on harmonious proportions and generous whitespace:

```typescript
export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
  zen: 64,        // Special zen spacing for breathing room
  sanctuary: 96   // Maximum breathing space
}

export const LAYOUT = {
  screenPadding: 24,
  cardPadding: 20,
  sectionSpacing: 32,
  componentSpacing: 16,
  maxContentWidth: 400
}
```

### Component Design Patterns

#### Custom Button System
```typescript
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.text.primary,
    color: COLORS.text.inverse,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  
  secondary: {
    backgroundColor: 'transparent',
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.text.primary,
    borderRadius: 12
  },
  
  luxury: {
    backgroundColor: COLORS.gold[500],
    color: COLORS.text.primary,
    borderRadius: 12,
    elevation: ELEVATION.soft
  }
}
```

#### Card System with Glassmorphism
```typescript
export const CARD_STYLES = {
  base: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 16,
    padding: 20,
    ...ELEVATION.soft
  },
  
  glass: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16
  },
  
  luxury: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: 20,
    padding: 24,
    ...ELEVATION.medium,
    borderWidth: 1,
    borderColor: COLORS.gold[100]
  }
}
```

## Data Models

### Design Token Structure
```typescript
interface DesignSystem {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  elevation: ElevationSystem;
  radius: BorderRadiusScale;
  animation: AnimationCurves;
  components: ComponentStyles;
  layouts: LayoutPatterns;
}

interface ColorPalette {
  background: BackgroundColors;
  sage: ColorScale;
  gold: ColorScale;
  text: TextColors;
  functional: FunctionalColors;
}

interface TypographyScale {
  fonts: FontFamilies;
  scale: TextStyles;
}
```

### Screen Layout Models
```typescript
interface BentoBoxLayout {
  grid: GridConfiguration;
  spacing: number;
  cardSizes: CardSizeVariants;
}

interface CollageLayout {
  overlapping: boolean;
  randomOffset: OffsetRange;
  cardRotation: RotationRange;
}
```

## Error Handling

### Design System Error Boundaries
- Fallback to default theme values if custom theme fails
- Graceful degradation for missing design tokens
- Development-time warnings for inconsistent usage
- Runtime validation of design token access

### Component Error States
- Loading states with premium loading animations
- Empty states with elegant illustrations
- Error states with helpful, calm messaging
- Network error states with retry mechanisms

## Testing Strategy

### Design System Testing
1. **Visual Regression Testing**
   - Screenshot testing for all component variants
   - Cross-platform consistency validation
   - Theme switching verification

2. **Accessibility Testing**
   - Color contrast ratio validation (WCAG AA compliance)
   - Typography readability testing
   - Touch target size verification
   - Screen reader compatibility

3. **Performance Testing**
   - Theme switching performance
   - Animation frame rate monitoring
   - Memory usage optimization
   - Bundle size impact analysis

### Component Testing
1. **Unit Tests**
   - Component rendering with all theme variants
   - Props validation and edge cases
   - Event handling verification

2. **Integration Tests**
   - Theme provider integration
   - Navigation flow testing
   - State management integration

3. **E2E Testing**
   - Complete user journey testing
   - Cross-screen consistency validation
   - Performance under real usage

## Screen-Specific Design Specifications

### Home Screen - Bento Box Dashboard
- **Layout**: 2-column grid with varying card heights
- **Cards**: Daily inspiration, style tips, AI-curated outfits
- **Spacing**: 16px between cards, 24px screen padding
- **Animation**: Gentle fade-in with staggered timing

### Wardrobe Screen - Grid-Based Digital Closet
- **Layout**: 2-3 column responsive grid
- **Cards**: Square aspect ratio with rounded corners
- **Interaction**: Long press for selection, tap for details
- **Search**: Floating search bar with glassmorphism

### Discover Screen - Tinder-Style Swipe Interface
- **Layout**: Full-screen cards with collage-style overlapping
- **Cards**: Large product images with efficiency score overlay
- **Gestures**: Swipe left/right, tap for details
- **Efficiency Score**: Prominent circular indicator

### Profile Screen - Clean List-Based Hub
- **Layout**: Simple list with section headers
- **Styling**: Minimal dividers, generous spacing
- **Navigation**: Subtle chevron indicators
- **Settings**: Toggle switches with luxury styling

### Onboarding - Visual-First Flow
- **Layout**: Full-screen with minimal UI chrome
- **Progress**: Subtle progress indicator
- **Upload**: Large, inviting upload areas
- **Guidance**: Gentle, encouraging copy

## Implementation Guidelines

### Theme Usage Patterns
```typescript
// Correct usage - semantic color access
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg
  },
  text: {
    ...theme.typography.scale.body1,
    color: theme.colors.text.primary
  }
});

// Avoid - direct color values
const badStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF9F6', // Don't do this
    padding: 16 // Use theme.spacing.lg instead
  }
});
```

### Component Composition
- Prefer composition over inheritance
- Use render props for flexible customization
- Implement consistent prop interfaces
- Follow atomic design principles

### Animation Guidelines
- Use natural, organic easing curves
- Implement meaningful motion (not decoration)
- Respect user accessibility preferences
- Maintain 60fps performance target