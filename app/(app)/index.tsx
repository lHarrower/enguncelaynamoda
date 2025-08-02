import React from 'react';
import { router } from 'expo-router';
import StudioHomeScreen from '@/components/studio/StudioHomeScreen';

export default function HomeScreen() {
  const handleNavigateToWardrobe = () => {
    router.push('/(app)/wardrobe');
  };

  const handleNavigateToDiscover = () => {
    router.push('/(app)/discover');
  };

  const handleNavigateToMirror = () => {
    router.push('/(app)/ayna-mirror');
  };

  const handleNavigateToProfile = () => {
    router.push('/(app)/profile');
  };

  return (
    <StudioHomeScreen
      onNavigateToWardrobe={handleNavigateToWardrobe}
      onNavigateToDiscover={handleNavigateToDiscover}
      onNavigateToMirror={handleNavigateToMirror}
      onNavigateToProfile={handleNavigateToProfile}
    />
  );
}