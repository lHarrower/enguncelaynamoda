// app/(app)/product/[id].tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PastelBackground from '@/components/common/PastelBackground'; // CORRECTED PATH
import { DesignSystem } from '@/theme/DesignSystem';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();

  return (
    <PastelBackground>
      <View style={styles.container}>
        <Text style={styles.text}>Product Detail Placeholder</Text>
        <Text style={styles.subText}>Product ID: {id}</Text>
      </View>
    </PastelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
  },
  subText: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
});