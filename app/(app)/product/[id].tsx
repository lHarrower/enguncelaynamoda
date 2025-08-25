// app/(app)/product/[id].tsx

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  subText: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
  text: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    marginBottom: 12,
  },
});
