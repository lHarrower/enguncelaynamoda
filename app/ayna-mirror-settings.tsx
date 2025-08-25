import { useRouter } from 'expo-router';
import React from 'react';

import AynaMirrorSettingsScreen from '@/screens/AynaMirrorSettingsScreen';

export default function AynaMirrorSettingsPage() {
  const router = useRouter();

  return (
    <AynaMirrorSettingsScreen
      navigation={{
        goBack: () => router.back(),
        navigate: (route: string) => router.push(route as any),
      }}
    />
  );
}
