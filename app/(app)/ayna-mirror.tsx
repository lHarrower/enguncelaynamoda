// AYNA Mirror Main Screen - Integrated with expo-router tabs
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AynaMirrorScreen } from '../../screens/AynaMirrorScreen';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function AynaMirrorPage() {
  const { user, session, loading } = useAuth();
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  // Handle deep link parameters
  useEffect(() => {
    if (params.feedback) {
      // TODO: Handle feedback prompt deep link
      // This could trigger a feedback modal or navigate to feedback screen
    }
  }, [params]);

  // Redirect to auth if not authenticated
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Loading handled by AynaMirrorScreen */}
      </View>
    );
  }

  if (!session || !user) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AynaMirrorScreen userId={user.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});