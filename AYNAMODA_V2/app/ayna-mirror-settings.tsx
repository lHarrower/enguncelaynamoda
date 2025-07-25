// AYNA Mirror Settings Screen - Integrated with expo-router
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AynaMirrorSettingsScreen from '../screens/AynaMirrorSettingsScreen';
import { Redirect, useRouter } from 'expo-router';

export default function AynaMirrorSettingsPage() {
  const { user, session, loading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  // Redirect to auth if not authenticated
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Loading handled by AynaMirrorSettingsScreen */}
      </View>
    );
  }

  if (!session || !user) {
    return <Redirect href="/auth/sign-in" />;
  }

  // Create navigation object compatible with the settings screen
  const navigation = {
    goBack: () => router.back(),
    navigate: (route: string) => router.push(route as any),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AynaMirrorSettingsScreen navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});