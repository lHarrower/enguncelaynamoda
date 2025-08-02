import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const handleOnboardingComplete = async (userData: any) => {
    try {
      await completeOnboarding(userData);
      // Navigation will be handled automatically by AuthContext
    } catch (error) {
      console.error('Error completing onboarding:', error);
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
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
});