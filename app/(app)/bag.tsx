// app/(app)/bag.tsx

import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BORDER_RADIUS, SEMANTIC_TYPOGRAPHY, SHADOWS, SPACING } from '@/constants/AppConstants'; // CORRECTED PATH
import { DesignSystem } from '@/theme/DesignSystem';

export default function BagPage() {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: DesignSystem.colors.background.primary }]}
    >
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: DesignSystem.colors.text.primary }]}>
          Shopping Bag
        </Text>
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Ionicons name="bag-outline" size={80} color={DesignSystem.colors.text.tertiary} />
        <Text style={[styles.emptyTitle, { color: DesignSystem.colors.text.primary }]}>
          Your bag is empty
        </Text>
        <Text style={[styles.emptyMessage, { color: DesignSystem.colors.text.secondary }]}>
          Start shopping to add items to your bag
        </Text>

        <TouchableOpacity
          style={[styles.shopButton, { backgroundColor: DesignSystem.colors.primary[500] }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.shopButtonText, { color: DesignSystem.colors.neutral[50] }]}>
            Start Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyMessage: {
    ...SEMANTIC_TYPOGRAPHY.bodyText,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...SEMANTIC_TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  header: {
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    ...SEMANTIC_TYPOGRAPHY.pageTitle,
    textAlign: 'center',
  },
  shopButton: {
    borderRadius: BORDER_RADIUS.small,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    ...SHADOWS.subtle,
  },
  shopButtonText: {
    ...SEMANTIC_TYPOGRAPHY.buttonPrimary,
  },
});
