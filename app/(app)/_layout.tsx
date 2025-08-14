import "../../src/ignore-warnings";
// app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="wardrobe" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="ayna-mirror" />
    </Stack>
  );
}

