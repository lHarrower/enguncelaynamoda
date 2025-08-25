import React, { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

// Lazy load the AynaMirrorScreen component
const AynaMirrorScreen = React.lazy(() =>
  import('../../screens/AynaMirrorScreen').then((module) => ({
    default: module.AynaMirrorScreen,
  })),
);

// Loading component for Suspense fallback
const AynaMirrorLoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
  </View>
);

// Lazy wrapper component
export const LazyAynaMirrorScreen: React.FC = () => {
  return (
    <Suspense fallback={<AynaMirrorLoadingFallback />}>
      <AynaMirrorScreen />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
});
