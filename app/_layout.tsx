import React from 'react';
import { AppProvider } from '@/providers/AppProvider';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Slot />
      </AppProvider>
    </GestureHandlerRootView>
  );
}