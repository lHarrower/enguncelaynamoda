import { useTheme } from '@shopify/restyle';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystemType } from '@/theme/DesignSystem';
// REMOVED: import { useTheme } from '@/context/ThemeContext';

export default function NotificationsScreen() {
  const theme = useTheme<DesignSystemType>();
  const { colors } = theme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Notifications</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          This feature is coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
