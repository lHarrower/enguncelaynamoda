import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { EDITORIAL_THEME } from '../../constants/EditorialTheme';

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
    flex: 1,
    backgroundColor: EDITORIAL_THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: EDITORIAL_THEME.layout.containerPadding,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes['4xl'],
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.text.primary,
    marginBottom: 8,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes['2xl'],
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});