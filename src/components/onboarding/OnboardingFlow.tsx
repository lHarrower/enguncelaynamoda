import React, { useState } from 'react';
import { ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import NotificationPermissionRequest from '@/components/onboarding/NotificationPermissionRequest';
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome';
import SampleOutfitGeneration from '@/components/onboarding/SampleOutfitGeneration';
import StylePreferenceQuestionnaire, {
  StylePreferences,
} from '@/components/onboarding/StylePreferenceQuestionnaire';
import WardrobeSetupWizard from '@/components/onboarding/WardrobeSetupWizard';
import { OnboardingData } from '@/context/AuthContext';

interface OnboardingFlowProps {
  onComplete: (userData: OnboardingData) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  type Step = 'welcome' | 'wardrobe' | 'style' | 'notifications' | 'samples' | 'complete';
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [wardrobeItemsAdded, setWardrobeItemsAdded] = useState(0);
  const [stylePreferences, setStylePreferences] = useState<StylePreferences | null>(null);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);

  const goNext = (next: Step) => setCurrentStep(next);

  const handleWelcomeNext = () => goNext('wardrobe');
  const handleWardrobeNext = () => goNext('style');
  const handleWardrobeSkip = () => goNext('style');

  const handleStyleNext = (prefs: StylePreferences) => {
    setStylePreferences(prefs);
    goNext('notifications');
  };
  const handleStyleSkip = () => goNext('notifications');

  const handleNotificationsNext = (granted: boolean) => {
    setNotificationPermissionGranted(granted);
    goNext('samples');
  };
  const handleNotificationsSkip = () => goNext('samples');

  const handleSamplesComplete = () => {
    const data: OnboardingData = {
      styleDNA: stylePreferences
        ? {
            preferredStyles: stylePreferences.preferredStyles,
            preferredColors: stylePreferences.preferredColors,
            occasions: stylePreferences.occasions,
            bodyTypePreferences: stylePreferences.bodyTypePreferences,
            confidenceNoteStyle: stylePreferences.confidenceNoteStyle,
          }
        : undefined,
      onboardingDate: new Date(),
    };
    onComplete(data);
  };

  return (
    <View style={styles.container}>
      {currentStep === 'welcome' && <OnboardingWelcome onNext={handleWelcomeNext} />}

      {currentStep === 'wardrobe' && (
        <WardrobeSetupWizard onNext={handleWardrobeNext} onSkip={handleWardrobeSkip} />
      )}

      {currentStep === 'style' && (
        <StylePreferenceQuestionnaire onNext={handleStyleNext} onSkip={handleStyleSkip} />
      )}

      {currentStep === 'notifications' && (
        <NotificationPermissionRequest
          onNext={handleNotificationsNext}
          onSkip={handleNotificationsSkip}
        />
      )}

      {currentStep === 'samples' && <SampleOutfitGeneration onComplete={handleSamplesComplete} />}
    </View>
  );
}

// Safe StyleSheet create for testing
const createStyles = (styles: Record<string, ViewStyle | TextStyle | ImageStyle>) => {
  try {
    return StyleSheet.create(styles);
  } catch {
    return styles;
  }
};

const styles = createStyles({
  container: {
    flex: 1,
  },
});
