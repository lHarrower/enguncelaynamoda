import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { OnboardingData, useAuth } from '@/context/AuthContext';
import { DesignSystem } from '@/theme/DesignSystem';

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const handleOnboardingComplete = async (userData: OnboardingData) => {
    try {
      await completeOnboarding(userData);
      // Navigation will be handled automatically by AuthContext
    } catch (error) {
      Alert.alert(
        'Onboarding Error',
        'There was an issue saving your preferences. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => {
              // User can retry the onboarding
            },
          },
        ],
      );
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingFlow onComplete={(userData) => void handleOnboardingComplete(userData)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.secondary,
    flex: 1,
  },
});
