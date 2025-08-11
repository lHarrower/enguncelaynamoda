import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { DesignSystemType } from '@/theme/DesignSystem';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});