import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

export const WardrobeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Wardrobe</Text>
          <Text style={styles.subtitle}>Your curated collection</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👗</Text>
          <Text style={styles.emptyTitle}>Your Wardrobe Awaits</Text>
          <Text style={styles.emptyDescription}>
            Start building your digital wardrobe by adding pieces from your discoveries
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  emptyDescription: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...DesignSystem.typography.scale.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    lineHeight: 44,
    marginBottom: 8,
  },
});
