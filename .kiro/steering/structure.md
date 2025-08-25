# AynaModa Project Structure

## Root Level Organization

```
├── app/                    # expo-router screens (file-based routing)
├── components/             # Reusable UI components
├── constants/              # App-wide constants and themes
├── context/               # React Context providers
├── config/                # Configuration files
├── services/              # API and business logic services
├── hooks/                 # Custom React hooks
├── data/                  # Sample/mock data
├── utils/                 # Utility functions
├── theme/                 # Theme definitions
├── assets/                # Static assets (images, fonts)
├── supabase/              # Supabase configuration and functions
└── android/               # Android-specific files
```

## Key Directories

### `/app` - Screen Components (expo-router)

- File-based routing system
- `_layout.tsx` - Root layout with providers
- `index.tsx` - Home screen
- `(app)/` - Tab-based screens group
- `auth/` - Authentication screens

### `/components` - UI Components

Organized by feature/domain:

- `aura/` - Aura-themed components
- `common/` - Shared/generic components
- `luxury/` - Luxury-themed components
- `sanctuary/` - Sanctuary-themed components (main app theme)
- `wardrobe/` - Wardrobe-specific components
- `navigation/` - Navigation components
- `theme/` - Theme-related components

### `/constants` - Configuration & Themes

- `AppThemeV2.ts` - Main theme system (Digital Zen Garden)
- `Colors.ts` - Color definitions
- `Layout.ts` - Layout constants
- `AppConstants.ts` - App-wide constants

### `/context` - Global State

- `AuthContext.tsx` - Authentication state management
- `ThemeContext.tsx` - Theme state management

### `/services` - Business Logic

- `wardrobeService.ts` - Wardrobe data operations
- `sanctuaryService.ts` - Sanctuary feature operations

## File Naming Conventions

- **Components**: PascalCase (e.g., `CustomModal.tsx`)
- **Screens**: PascalCase with descriptive names (e.g., `MainRitualScreen.tsx`)
- **Services**: camelCase with Service suffix (e.g., `wardrobeService.ts`)
- **Constants**: PascalCase for files, UPPER_CASE for exports
- **Types**: PascalCase interfaces/types
- **Hooks**: camelCase starting with 'use' (e.g., `useImageUploader.ts`)

## Import Patterns

- Relative imports for local files: `../components/CustomModal`
- Absolute imports from root: Not configured (use relative)
- Group imports: React imports first, then libraries, then local

## Component Organization

- One component per file
- Export component as default
- Co-locate types with components when specific to that component
- Separate shared types in dedicated type files

## Theme Integration

- All components should use `APP_THEME_V2` from `constants/AppThemeV2.ts`
- Follow Digital Zen Garden design philosophy
- Use semantic color mappings over direct color values
- Implement glassmorphism effects where appropriate

## State Management Patterns

- Context for global state (auth, theme)
- Local state with useState for component-specific state
- Custom hooks for reusable stateful logic
- Service layer for data operations and API calls
