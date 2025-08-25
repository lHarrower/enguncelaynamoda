import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width } = Dimensions.get('window');

const PastelCircleBackground = () => {
  return (
    <View style={[StyleSheet.absoluteFill, styles.background]}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: DesignSystem.colors.background.primary,
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  circle1: {
    backgroundColor: DesignSystem.colors.neutral[300] + '20',
    borderRadius: (width * 1.6) / 2,
    height: width * 1.6,
    left: -width * 0.3,
    position: 'absolute',
    top: -width * 0.8,
    width: width * 1.6,
  },
  circle2: {
    backgroundColor: DesignSystem.colors.gold[300] + '15',
    borderRadius: (width * 1.2) / 2,
    bottom: -width * 0.6,
    height: width * 1.2,
    position: 'absolute',
    right: -width * 0.3,
    width: width * 1.2,
  },
  circle3: {
    backgroundColor: DesignSystem.colors.sage[300] + '10',
    borderRadius: width / 2,
    bottom: width * 0.05,
    height: width,
    left: -width * 0.4,
    opacity: 0.8,
    position: 'absolute',
    width: width,
  },
});

export default PastelCircleBackground;
