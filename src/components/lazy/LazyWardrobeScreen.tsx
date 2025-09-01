import React, { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

// Lazy load the WardrobeScreen component
const WardrobeScreen = React.lazy(() =>
  import('@/screens/WardrobeScreen').then((module) => ({
    default: module.WardrobeScreen,
  })),
);

// Loading component for Suspense fallback
const WardrobeLoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={DesignSystem.colors.primary[500]} />
  </View>
);

// Lazy wrapper component
export const LazyWardrobeScreen: React.FC = () => {
  return (
    <Suspense fallback={<WardrobeLoadingFallback />}>
      <WardrobeScreen />
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
