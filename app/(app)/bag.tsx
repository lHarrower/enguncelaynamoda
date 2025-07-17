import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { SEMANTIC_TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/AppConstants';

export default function BagScreen() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Shopping Bag
        </Text>
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Ionicons 
          name="bag-outline" 
          size={80} 
          color={colors.textTertiary} 
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Your bag is empty
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
          Start shopping to add items to your bag
        </Text>
        
        <TouchableOpacity 
          style={[styles.shopButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.shopButtonText, { color: colors.background }]}>
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    ...SEMANTIC_TYPOGRAPHY.pageTitle,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...SEMANTIC_TYPOGRAPHY.sectionTitle,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emptyMessage: {
    ...SEMANTIC_TYPOGRAPHY.bodyText,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  shopButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.small,
    ...SHADOWS.subtle,
  },
  shopButtonText: {
    ...SEMANTIC_TYPOGRAPHY.buttonPrimary,
  },
}); 