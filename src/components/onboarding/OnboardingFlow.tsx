import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome';
import WardrobeSetupWizard from '@/components/onboarding/WardrobeSetupWizard';
import StylePreferenceQuestionnaire, { StylePreferences } from '@/components/onboarding/StylePreferenceQuestionnaire';
import NotificationPermissionRequest from '@/components/onboarding/NotificationPermissionRequest';
import SampleOutfitGeneration from '@/components/onboarding/SampleOutfitGeneration';
import { logInDev } from '@/utils/consoleSuppress';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
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
    const data = {
      notificationPermissionGranted,
      wardrobeItemsAdded,
      stylePreferences: stylePreferences || {
        preferredStyles: [],
        preferredColors: [],
        occasions: [],
        bodyTypePreferences: [],
        confidenceNoteStyle: 'encouraging',
      },
      completedAt: new Date(),
    };
    onComplete(data);
  };

  return (
    <View style={styles.container}>
      {currentStep === 'welcome' && (
        <OnboardingWelcome onNext={handleWelcomeNext} />
      )}

      {currentStep === 'wardrobe' && (
        <WardrobeSetupWizard
          onNext={handleWardrobeNext}
          onSkip={handleWardrobeSkip}
        />
      )}

      {currentStep === 'style' && (
        <StylePreferenceQuestionnaire
          onNext={handleStyleNext}
          onSkip={handleStyleSkip}
        />
      )}

      {currentStep === 'notifications' && (
        <NotificationPermissionRequest
          onNext={handleNotificationsNext}
          onSkip={handleNotificationsSkip}
        />
      )}

      {currentStep === 'samples' && (
        <SampleOutfitGeneration onComplete={handleSamplesComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});