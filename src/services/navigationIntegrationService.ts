// Navigation Integration Service - Cohesive User Experience Management
// Ensures smooth navigation, data flow validation, and polished transitions

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { supabase } from '@/config/supabaseClient';
import { isSupabaseOk, wrap } from '@/utils/supabaseResult';

// Known application route names (extend as new screens are added)
export type RouteName =
  | 'index'
  | 'onboarding'
  | 'style-profile'
  | 'wardrobe'
  | 'wardrobe-add-item'
  | 'outfit-builder'
  | 'ayna-mirror'
  | 'feedback'
  | 'style-insights'
  | 'discover'
  | 'product-detail'
  | 'bag'
  | 'checkout'
  | '/auth/sign-in';

// Structured (but still flexible) user journey data container
export interface UserJourneyData {
  userProfile?: unknown;
  stylePreferences?: unknown;
  wardrobeItems?: unknown[]; // Could be refined to WardrobeItem[] once type imported
  selectedProduct?: unknown;
  outfitData?: {
    id: string;
    name: string;
    items: string[];
    occasion?: string;
  };
  feedbackData?: unknown;
  selectedItems?: string[];
  mirrorAnalysis?: {
    styleScore: number;
    recommendations: string[];
    confidence: number;
  };
  bagItems?: unknown[];
  [key: string]: unknown; // Allow forward-compatible extension without reverting to any
}

export interface NavigationState {
  currentScreen: RouteName;
  previousScreen?: RouteName;
  navigationHistory: RouteName[];
  userJourneyData: UserJourneyData;
}

export interface UserJourney {
  id: string;
  name: string;
  screens: string[];
  requiredData?: string[];
  validationRules?: ((state: NavigationState) => boolean)[];
}

class NavigationIntegrationService {
  private navigationState: NavigationState = {
    currentScreen: 'index',
    navigationHistory: ['index'],
    userJourneyData: {},
  };

  private userJourneys: UserJourney[] = [
    {
      id: 'onboarding-to-wardrobe',
      name: 'New User Onboarding to Wardrobe Setup',
      screens: ['onboarding', 'style-profile', 'wardrobe', 'wardrobe-add-item'],
      requiredData: ['userProfile', 'stylePreferences'],
      validationRules: [
        (state) => !!state.userJourneyData.userProfile,
        (state) => !!state.userJourneyData.stylePreferences,
      ],
    },
    {
      id: 'wardrobe-to-outfit',
      name: 'Wardrobe Management to Outfit Creation',
      screens: ['wardrobe', 'outfit-builder', 'ayna-mirror'],
      requiredData: ['wardrobeItems'],
      validationRules: [
        (state) =>
          Array.isArray(state.userJourneyData.wardrobeItems) &&
          state.userJourneyData.wardrobeItems.length > 0,
      ],
    },
    {
      id: 'discover-to-purchase',
      name: 'Product Discovery to Purchase Flow',
      screens: ['discover', 'product-detail', 'bag', 'checkout'],
      requiredData: ['selectedProduct'],
      validationRules: [(state) => !!state.userJourneyData.selectedProduct],
    },
    {
      id: 'mirror-feedback-loop',
      name: 'AYNA Mirror Feedback and Learning',
      screens: ['ayna-mirror', 'feedback', 'style-insights', 'wardrobe'],
      requiredData: ['outfitData', 'feedbackData'],
      validationRules: [
        (state) => !!state.userJourneyData.outfitData,
        (state) => !!state.userJourneyData.feedbackData,
      ],
    },
  ];

  // Navigation with transition management
  async navigateWithTransition(
    destination: RouteName,
    params?: Partial<UserJourneyData>,
    transitionType: 'push' | 'replace' | 'modal' = 'push',
  ): Promise<void> {
    try {
      // Validate navigation
      const canNavigate = await this.validateNavigation(destination, params);
      if (!canNavigate) {
        return;
      }

      // Add haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Update navigation state
      this.updateNavigationState(destination, params);

      // Perform navigation based on type
      switch (transitionType) {
        case 'push':
          router.push(destination as never);
          break;
        case 'replace':
          router.replace(destination as never);
          break;
        case 'modal':
          router.push(destination as never);
          break;
      }

      // Log navigation for analytics
      await this.logNavigation(destination, params);
    } catch (error) {
      // Navigation error
      this.handleNavigationError(error);
    }
  }

  // Validate navigation based on user journey rules
  private async validateNavigation(
    destination: RouteName,
    _params?: Partial<UserJourneyData>,
  ): Promise<boolean> {
    // Check if user is authenticated for protected routes
    const protectedRoutes = ['wardrobe', 'ayna-mirror', 'profile', 'bag', 'checkout'];
    if (protectedRoutes.includes(destination)) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Authentication Required', 'Please sign in to access this feature.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/sign-in') },
        ]);
        return false;
      }
    }

    // Validate data requirements for specific journeys
    const activeJourney = this.getActiveUserJourney(destination);
    if (activeJourney) {
      const isValid = this.validateJourneyRequirements(activeJourney);
      if (!isValid) {
        await this.handleInvalidJourney(activeJourney, destination);
        return false;
      }
    }

    return true;
  }

  // Update navigation state and user journey data
  private updateNavigationState(destination: RouteName, params?: Partial<UserJourneyData>): void {
    this.navigationState.previousScreen = this.navigationState.currentScreen;
    this.navigationState.currentScreen = destination;
    this.navigationState.navigationHistory.push(destination);

    // Merge params into user journey data
    if (params) {
      this.navigationState.userJourneyData = {
        ...this.navigationState.userJourneyData,
        ...params,
      };
    }

    // Limit history to last 20 screens
    if (this.navigationState.navigationHistory.length > 20) {
      this.navigationState.navigationHistory = this.navigationState.navigationHistory.slice(-20);
    }
  }

  // Get active user journey based on current navigation
  private getActiveUserJourney(destination: RouteName): UserJourney | null {
    return (
      this.userJourneys.find(
        (journey) =>
          journey.screens.includes(destination) &&
          journey.screens.includes(this.navigationState.currentScreen),
      ) || null
    );
  }

  // Validate journey requirements
  private validateJourneyRequirements(journey: UserJourney): boolean {
    // Check required data
    if (journey.requiredData) {
      for (const dataKey of journey.requiredData) {
        if (!this.navigationState.userJourneyData[dataKey]) {
          return false;
        }
      }
    }

    // Check validation rules
    if (journey.validationRules) {
      for (const rule of journey.validationRules) {
        if (!rule(this.navigationState)) {
          return false;
        }
      }
    }

    return true;
  }

  // Handle invalid journey navigation
  private async handleInvalidJourney(journey: UserJourney, _destination: string): Promise<void> {
    // ensure async contains at least one await (lint require-await)
    await Promise.resolve();
    const missingData =
      journey.requiredData?.filter((dataKey) => !this.navigationState.userJourneyData[dataKey]) ||
      [];

    if (missingData.length > 0) {
      Alert.alert(
        'Setup Required',
        `Please complete your ${missingData.join(', ')} before proceeding.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete Setup',
            onPress: () => {
              const first = missingData[0];
              if (first) {
                this.navigateToSetup(first);
              }
            },
          },
        ],
      );
    }
  }

  // Navigate to setup screen for missing data
  private navigateToSetup(dataType: string): void {
    const setupRoutes: Record<string, string> = {
      userProfile: '/onboarding',
      stylePreferences: '/style-profile',
      wardrobeItems: '/wardrobe',
      selectedProduct: '/discover',
    };

    const setupRoute = setupRoutes[dataType];
    if (setupRoute) {
      router.push(setupRoute as never);
    }
  }

  // Log navigation for analytics
  private async logNavigation(
    destination: RouteName,
    params?: Partial<UserJourneyData>,
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const navRes = await wrap(
        async () =>
          await supabase
            .from('navigation_analytics')
            .insert({
              user_id: user.id,
              from_screen: this.navigationState.previousScreen,
              to_screen: destination,
              navigation_params: params,
              timestamp: new Date().toISOString(),
              session_id: this.getSessionId(),
            })
            .select('*')
            .single(),
      );
      if (!isSupabaseOk(navRes)) {
        // Silent fail; optionally could log in dev
      }
    } catch (error) {
      // Failed to log navigation
    }
  }

  // Handle navigation errors
  private handleNavigationError(error: unknown): void {
    // Basic dev logging without exposing internals to user
    // (Optional) Integrate with errorHandlingService if available
    Alert.alert('Navigation Error', 'Something went wrong. Please try again.', [{ text: 'OK' }]);
  }

  // Get current session ID
  private getSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  public getCurrentScreen(): RouteName {
    return this.navigationState.currentScreen;
  }

  public getNavigationHistory(): RouteName[] {
    return [...this.navigationState.navigationHistory];
  }

  public getUserJourneyData(): UserJourneyData {
    return { ...this.navigationState.userJourneyData };
  }

  public setUserJourneyData(data: Partial<UserJourneyData>): void {
    this.navigationState.userJourneyData = {
      ...this.navigationState.userJourneyData,
      ...data,
    };
  }

  // Test complete user journeys
  public async testUserJourney(journeyId: string): Promise<boolean> {
    const journey = this.userJourneys.find((j) => j.id === journeyId);
    if (!journey) {
      // Journey not found
      return false;
    }

    // Testing user journey

    // Simulate navigation through journey screens
    for (const screen of journey.screens) {
      if (!this.isKnownRoute(screen)) {
        continue;
      } // skip unknown legacy screens
      const canNavigate = await this.validateNavigation(screen);
      if (!canNavigate) {
        // Failed to navigate to screen
        return false;
      }
    }

    // User journey test completed successfully
    return true;
  }

  // Get journey progress
  public getJourneyProgress(journeyId: string): number {
    const journey = this.userJourneys.find((j) => j.id === journeyId);
    if (!journey) {
      return 0;
    }

    const completedScreens = journey.screens.filter(
      (screen) =>
        this.isKnownRoute(screen) && this.navigationState.navigationHistory.includes(screen),
    );

    return completedScreens.length / journey.screens.length;
  }

  private isKnownRoute(value: string): value is RouteName {
    const routes: RouteName[] = [
      'index',
      'onboarding',
      'style-profile',
      'wardrobe',
      'wardrobe-add-item',
      'outfit-builder',
      'ayna-mirror',
      'feedback',
      'style-insights',
      'discover',
      'product-detail',
      'bag',
      'checkout',
      '/auth/sign-in',
    ];
    return (routes as string[]).includes(value);
  }

  // Reset navigation state (for testing)
  public resetNavigationState(): void {
    this.navigationState = {
      currentScreen: 'index',
      navigationHistory: ['index'],
      userJourneyData: {},
    };
  }
}

export const navigationIntegrationService = new NavigationIntegrationService();
export default navigationIntegrationService;
