// FILE: components/luxury/AynaWelcomeMessage.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { Ionicons } from '@expo/vector-icons';

interface AynaWelcomeMessageProps {
  userName: string;
}

export const AynaWelcomeMessage = ({ userName }: AynaWelcomeMessageProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="sparkles-outline" size={28} color={APP_THEME_V2.colors.liquidGold[500]} />
      <Text style={styles.title}>Good morning, {userName}.</Text>
      <Text style={styles.subtitle}>
        Your daily ritual is ready. Three thoughtful combinations from your own treasure chest await you.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    padding: APP_THEME_V2.spacing.lg,
    marginHorizontal: APP_THEME_V2.spacing.lg,
    marginBottom: APP_THEME_V2.spacing.xl,
    alignItems: 'center',
    ...APP_THEME_V2.elevation.lift,
  },
  title: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
    marginTop: APP_THEME_V2.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    textAlign: 'center',
    marginTop: APP_THEME_V2.spacing.sm,
    opacity: 0.8,
  },
});