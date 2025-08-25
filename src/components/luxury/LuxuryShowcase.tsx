import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LinenCanvas from '@/components/luxury/LinenCanvas';
import { DesignSystem } from '@/theme/DesignSystem';

const LuxuryShowcase: React.FC = () => {
  return (
    <LinenCanvas>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Luxury Design System</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.description}>
            The luxury design system showcase is being updated to reflect the new design language.
          </Text>
        </View>
      </SafeAreaView>
    </LinenCanvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  description: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    maxWidth: 300,
    textAlign: 'center',
  },
  subtitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.sage[500],
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
});

export default LuxuryShowcase;
