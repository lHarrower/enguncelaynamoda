// FILE: components/luxury/AynaWelcomeMessage.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '../../theme/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

interface AynaWelcomeMessageProps {
  userName: string;
}

export const AynaWelcomeMessage = ({ userName }: AynaWelcomeMessageProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="sparkles-outline" size={28} color={DesignSystem.colors.sage[500]} />
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
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing.lg,
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xl,
    alignItems: 'center',
    ...DesignSystem.elevation.medium,
  },
  title: {
    ...DesignSystem.typography.h3,
    color: DesignSystem.colors.text.primary,
    marginTop: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...DesignSystem.typography.body1,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.sm,
    opacity: 0.8,
  },
});