import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PastelBackground from '../../../components/common/PastelBackground';
import { APP_THEME_V2 } from '../../../constants/AppThemeV2';

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
    ...APP_THEME_V2.typography.scale.h1,
    color: APP_THEME_V2.semantic.text.primary,
    marginBottom: 12,
  },
  subText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  },
}); 