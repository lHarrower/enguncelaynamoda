// AYNA Mirror Main Screen - Integrated with expo-router
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@shopify/restyle';
import { DesignSystemType } from '@/theme/DesignSystem';
import { AynaMirrorScreen } from '@/screens/AynaMirrorScreen';
import { Redirect } from 'expo-router';

export default function AynaMirrorPage() {
  const { user, session, loading } = useAuth();
  const theme = useTheme<DesignSystemType>();
  const { colors } = theme;

  // Redirect to auth if not authenticated
  if (loading) {
    return (
  <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Loading handled by AynaMirrorScreen */}
      </View>
    );
  }

  if (!session || !user) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <AynaMirrorScreen userId={user.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});