// Navigation Integration Service - Cohesive User Experience Management
// Ensures smooth navigation, data flow validation, and polished transitions

import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { supabase } from '@/config/supabaseClient';

export interface NavigationState {
  currentScreen: string;
  previousScreen?: string;
  navigationHistory: string[];
  userJourneyData: Record<string, any>;
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
    userJourneyData: {}
  };

  private userJourneys: UserJourney[] = [
    {
      id: 'onboarding-to-wardrobe',
      name: 'New User Onboarding to Wardrobe Setup',
      screens: ['onboarding', 'style-profile', 'wardrobe', 'wardrobe-add-item'],
      requiredData: ['userProfile', 'stylePreferences'],
      validationRules: [
        (state) => !!state.userJourneyData.userProfile,
        (state) => !!state.userJourneyData.stylePreferences
      ]
    },
    {
      id: 'wardrobe-to-outfit',
      name: 'Wardrobe Management to Outfit Creation',
      screens: ['wardrobe', 'outfit-builder', 'ayna-mirror'],
      requiredData: ['wardrobeItems'],
      validationRules: [
        (state) => state.userJourneyData.wardrobeItems?.length > 0
      ]
    },
    {
      id: 'discover-to-purchase',
      name: 'Product Discovery to Purchase Flow',
      screens: ['discover', 'product-detail', 'bag', 'checkout'],
      requiredData: ['selectedProduct'],
      validationRules: [
        (state) => !!state.userJourneyData.selectedProduct
      ]
    },
    {
      id: 'mirror-feedback-loop',
      name: 'AYNA Mirror Feedback and Learning',
      screens: ['ayna-mirror', 'feedback', 'style-insights', 'wardrobe'],
      requiredData: ['outfitData', 'feedbackData'],
      validationRules: [
        (state) => !!state.userJourneyData.outfitData,
        (state) => !!state.userJourneyData.feedbackData
      ]
    }
  ];

  // Navigation with transition management
  async navigateWithTransition(
    destination: string, 
    params?: Record<string, any>,
    transitionType: 'push' | 'replace' | 'modal' = 'push'
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
          router.push(destination as any);
          break;
        case 'replace':
          router.replace(destination as any);
          break;
        case 'modal':
          router.push(destination as any);
          break;
      }

      // Log navigation for analytics
      await this.logNavigation(destination, params);

    } catch (error) {
      console.error('Navigation error:', error);
      this.handleNavigationError(error);
    }
  }

  // Validate navigation based on user journey rules
  private async validateNavigation(
    destination: string, 
    params?: Record<string, any>
  ): Promise<boolean> {
    // Check if user is authenticated for protected routes
    const protectedRoutes = ['wardrobe', 'ayna-mirror', 'profile', 'bag', 'checkout'];
    if (protectedRoutes.includes(destination)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert(
          'Authentication Required',
          'Please sign in to access this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => router.push('/auth/sign-in') }
          ]
        );
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
  private updateNavigationState(destination: string, params?: Record<string, any>): void {
    this.navigationState.previousScreen = this.navigationState.currentScreen;
    this.navigationState.currentScreen = destination;
    this.navigationState.navigationHistory.push(destination);

    // Merge params into user journey data
    if (params) {
      this.navigationState.userJourneyData = {
        ...this.navigationState.userJourneyData,
        ...params
      };
    }

    // Limit history to last 20 screens
    if (this.navigationState.navigationHistory.length > 20) {
      this.navigationState.navigationHistory = this.navigationState.navigationHistory.slice(-20);
    }
  }

  // Get active user journey based on current navigation
  private getActiveUserJourney(destination: string): UserJourney | null {
    return this.userJourneys.find(journey => 
      journey.screens.includes(destination) &&
      journey.screens.includes(this.navigationState.currentScreen)
    ) || null;
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
  private async handleInvalidJourney(journey: UserJourney, destination: string): Promise<void> {
    const missingData = journey.requiredData?.filter(
      dataKey => !this.navigationState.userJourneyData[dataKey]
    ) || [];

    if (missingData.length > 0) {
      Alert.alert(
        'Setup Required',
        `Please complete your ${missingData.join(', ')} before proceeding.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Setup', onPress: () => this.navigateToSetup(missingData[0]) }
        ]
      );
    }
  }

  // Navigate to setup screen for missing data
  private navigateToSetup(dataType: string): void {
    const setupRoutes: Record<string, string> = {
      userProfile: '/onboarding',
      stylePreferences: '/style-profile',
      wardrobeItems: '/wardrobe',
      selectedProduct: '/discover'
    };

    const setupRoute = setupRoutes[dataType];
    if (setupRoute) {
      router.push(setupRoute as any);
    }
  }

  // Log navigation for analytics
  private async logNavigation(destination: string, params?: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('navigation_analytics').insert({
        user_id: user.id,
        from_screen: this.navigationState.previousScreen,
        to_screen: destination,
        navigation_params: params,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to log navigation:', error);
    }
  }

  // Handle navigation errors
  private handleNavigationError(error: any): void {
    console.error('Navigation error:', error);
    
    Alert.alert(
      'Navigation Error',
      'Something went wrong. Please try again.',
      [{ text: 'OK' }]
    );
  }

  // Get current session ID
  private getSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  public getCurrentScreen(): string {
    return this.navigationState.currentScreen;
  }

  public getNavigationHistory(): string[] {
    return [...this.navigationState.navigationHistory];
  }

  public getUserJourneyData(): Record<string, any> {
    return { ...this.navigationState.userJourneyData };
  }

  public setUserJourneyData(data: Record<string, any>): void {
    this.navigationState.userJourneyData = {
      ...this.navigationState.userJourneyData,
      ...data
    };
  }

  // Test complete user journeys
  public async testUserJourney(journeyId: string): Promise<boolean> {
    const journey = this.userJourneys.find(j => j.id === journeyId);
    if (!journey) {
      console.error(`Journey ${journeyId} not found`);
      return false;
    }

    console.log(`Testing user journey: ${journey.name}`);
    
    // Simulate navigation through journey screens
    for (const screen of journey.screens) {
      const canNavigate = await this.validateNavigation(screen);
      if (!canNavigate) {
        console.error(`Failed to navigate to ${screen} in journey ${journeyId}`);
        return false;
      }
    }

    console.log(`User journey ${journeyId} test completed successfully`);
    return true;
  }

  // Get journey progress
  public getJourneyProgress(journeyId: string): number {
    const journey = this.userJourneys.find(j => j.id === journeyId);
    if (!journey) return 0;

    const completedScreens = journey.screens.filter(screen => 
      this.navigationState.navigationHistory.includes(screen)
    );

    return completedScreens.length / journey.screens.length;
  }

  // Reset navigation state (for testing)
  public resetNavigationState(): void {
    this.navigationState = {
      currentScreen: 'index',
      navigationHistory: ['index'],
      userJourneyData: {}
    };
  }
}

export const navigationIntegrationService = new NavigationIntegrationService();
export default navigationIntegrationService;