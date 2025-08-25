// FILE: components/luxury/AynaWelcomeMessage.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignSystem } from '../../theme/DesignSystem';

interface AynaWelcomeMessageProps {
  userName: string;
}

export const AynaWelcomeMessage = ({ userName }: AynaWelcomeMessageProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="sparkles-outline" size={28} color={DesignSystem.colors.sage[500]} />
      <Text style={styles.title}>Good morning, {userName}.</Text>
      <Text style={styles.subtitle}>
        Your daily ritual is ready. Three thoughtful combinations from your own treasure chest await
        you.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: DesignSystem.radius.lg,
    marginBottom: DesignSystem.spacing.xl,
    marginHorizontal: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.lg,
    ...DesignSystem.elevation.medium,
  },
  subtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.sm,
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginTop: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
});
