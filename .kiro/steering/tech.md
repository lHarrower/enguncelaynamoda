# AynaModa Technical Stack

## Framework & Platform
- **Platform**: React Native with Expo SDK 53
- **Language**: TypeScript (strict mode enabled)
- **Navigation**: expo-router (file-based routing system)
- **Architecture**: React Native New Architecture enabled

## Core Dependencies
- **UI Framework**: React Native with custom components
- **State Management**: React Context API (AuthContext, ThemeContext)
- **Animations**: react-native-reanimated for advanced animations
- **Gestures**: react-native-gesture-handler
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **Image Processing**: expo-image-picker, expo-camera
- **Authentication**: Supabase Auth with Google/Apple sign-in

## Key Libraries
- **Fonts**: @expo-google-fonts (Inter, Playfair Display, Karla)
- **Icons**: @expo/vector-icons (Ionicons)
- **UI Effects**: expo-blur (glassmorphism), expo-linear-gradient
- **Storage**: @react-native-async-storage/async-storage
- **Utilities**: date-fns, expo-haptics

## Development Tools
- **Linting**: ESLint with React Native config
- **Formatting**: Prettier
- **Type Checking**: TypeScript with strict configuration
- **Build System**: Metro bundler

## Common Commands
```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android device/emulator
npm run ios           # Run on iOS device/simulator
npm run web           # Run web version

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier

# Build & Deploy
npx eas build         # Build with EAS (Expo Application Services)
npx eas submit        # Submit to app stores
```

## Environment Setup
- Requires `.env` file with Supabase credentials
- Google/Apple OAuth configuration needed for social auth
- EAS CLI for building and deployment

## Architecture Patterns
- File-based routing with expo-router
- Context providers for global state
- Service layer for API interactions
- Custom hook patterns for reusable logic
- Component composition over inheritance