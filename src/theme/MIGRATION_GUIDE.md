# AYNAMODA Design System Migration Guide

## Overview

This guide helps migrate from the legacy theme systems (`UnifiedTheme.ts`, `AppThemeV2.ts`, `Colors.ts`, etc.) to the new unified `DesignSystem.ts`.

## Quick Migration Reference

### Color Migrations

#### From Legacy Systems:

```typescript
// OLD - Multiple conflicting systems
import { ORGANIC_PALETTE } from '@/constants/AppThemeV2';
import { LuxuryColors } from '@/constants/Colors';
import { UnifiedTheme } from './UnifiedTheme';

// NEW - Single unified system
import { useColors } from '@/theme/ThemeProvider';
const colors = useColors();
```

#### Color Mapping:

```typescript
// Legacy -> New Unified
ORGANIC_PALETTE.neutral.white -> colors.background.primary
ORGANIC_PALETTE.neutral.black -> colors.text.primary
LuxuryColors.primary -> colors.sage[500]
LuxuryColors.accent -> colors.gold[500]
UnifiedTheme.colors.background -> colors.background.primary
```

### Typography Migrations

```typescript
// OLD
import { TYPOGRAPHY_V2 } from '@/constants/AppThemeV2';
import { EnhancedTypography } from './UnifiedTheme';

// NEW
import { useTypography } from '@/theme/ThemeProvider';
const typography = useTypography();

// Usage
style={{
  fontFamily: typography.fonts.headline, // Instead of TYPOGRAPHY_V2.primary.fontFamily
  ...typography.scale.h1 // Instead of EnhancedTypography.display.large
}}
```

### Spacing Migrations

```typescript
// OLD
import { SPACING_V2 } from '@/constants/AppThemeV2';
import { UnifiedSpacing } from './UnifiedTheme';

// NEW
import { useSpacing, useLayout } from '@/theme/ThemeProvider';
const spacing = useSpacing();
const layout = useLayout();

// Usage
padding: spacing.lg; // Instead of SPACING_V2.medium or UnifiedSpacing.medium
margin: layout.screenPadding; // For consistent screen margins
```

### Component Style Migrations

```typescript
// OLD
import { UnifiedComponents } from './UnifiedTheme';

// NEW
import { useComponents } from '@/theme/ThemeProvider';
const components = useComponents();

// Button styles
style={components.button.primary} // Instead of UnifiedComponents.buttons.primary

// Card styles
style={components.card.base} // Instead of UnifiedComponents.cards.elevated
```

## Step-by-Step Migration Process

### 1. Update Imports

Replace all theme-related imports with the new unified system:

```typescript
// Remove these imports
// import { APP_THEME_V2 } from '@/constants/AppThemeV2';
// import { LuxuryColors } from '@/constants/Colors';
// import { UnifiedTheme } from '@/theme/UnifiedTheme';

// Add this import
import { useTheme, useColors, useTypography, useSpacing } from '@/theme/ThemeProvider';
```

### 2. Update Component Usage

#### Before:

```typescript
const MyComponent = () => {
  return (
    <View style={{
      backgroundColor: ORGANIC_PALETTE.neutral.white,
      padding: SPACING_V2.large,
      borderRadius: UnifiedTheme.borderRadius.medium
    }}>
      <Text style={{
        fontFamily: TYPOGRAPHY_V2.primary.fontFamily,
        fontSize: TYPOGRAPHY_V2.scale.h1.fontSize,
        color: LuxuryColors.text.primary
      }}>
        Hello World
      </Text>
    </View>
  );
};
```

#### After:

```typescript
const MyComponent = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View style={{
      backgroundColor: colors.background.primary,
      padding: spacing.xl,
      borderRadius: borderRadius.lg
    }}>
      <Text style={{
        fontFamily: typography.fonts.headline,
        ...typography.scale.h1,
        color: colors.text.primary
      }}>
        Hello World
      </Text>
    </View>
  );
};
```

### 3. Wrap App with ThemeProvider

Update your main App component:

```typescript
// App.tsx or _layout.tsx
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Files to Update

### Priority 1 - Core Components

- [ ] `src/components/common/` - All shared components
- [ ] `src/components/studio/` - Studio-specific components
- [ ] `src/components/wardrobe/` - Wardrobe components
- [ ] Main screen files

### Priority 2 - Legacy Theme Files

After migration is complete, these files can be deprecated:

- [ ] `src/theme/UnifiedTheme.ts`
- [ ] `src/constants/AppThemeV2.ts`
- [ ] `src/constants/Colors.ts`
- [ ] `src/constants/StudioTheme.ts`
- [ ] `src/constants/LuxuryTheme.ts`
- [ ] Other theme files in `src/constants/`

## Testing Migration

1. **Visual Regression Testing**: Compare screens before/after migration
2. **Component Testing**: Ensure all components render correctly
3. **Theme Consistency**: Verify consistent spacing, colors, and typography
4. **Performance**: Check for any performance regressions

## Common Pitfalls

1. **Missing ThemeProvider**: Ensure all components are wrapped in ThemeProvider
2. **Hardcoded Values**: Replace any remaining hardcoded colors/spacing
3. **Import Conflicts**: Remove old theme imports completely
4. **Type Errors**: Update TypeScript types to match new system

## Benefits After Migration

- ✅ Single source of truth for all design tokens
- ✅ Consistent visual language across the app
- ✅ Better TypeScript support and autocomplete
- ✅ Easier maintenance and updates
- ✅ Improved performance (fewer theme objects)
- ✅ Better developer experience

## Support

If you encounter issues during migration:

1. Check this guide for common patterns
2. Refer to `DesignSystem.ts` for available tokens
3. Use TypeScript autocomplete for available options
4. Test components in isolation first
