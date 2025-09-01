/**
 * Home Screen
 * Main dashboard and discovery screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MainTabScreenProps } from '../navigation/types';
import { UNIFIED_COLORS } from '../theme/DesignSystem';

type Props = MainTabScreenProps<'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AYNAMODA</Text>
        <Text style={styles.subtitle}>Stilinizi keşfedin</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Bugün için öneriler</Text>
        {/* TODO: Add recommendation components */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UNIFIED_COLORS.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: UNIFIED_COLORS.terracotta[600],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: UNIFIED_COLORS.warmNeutral[600],
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: UNIFIED_COLORS.terracotta[700],
    marginBottom: 16,
  },
});

export default HomeScreen;