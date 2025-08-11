import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: DesignSystem.colors.background.primary,
  },
  circle1: {
    position: 'absolute',
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: (width * 1.6) / 2,
    backgroundColor: DesignSystem.colors.neutral[300] + '20',
    top: -width * 0.8,
    left: -width * 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: DesignSystem.colors.gold[300] + '15',
    bottom: -width * 0.6,
    right: -width * 0.3,
  },
  circle3: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: DesignSystem.colors.sage[300] + '10',
    bottom: width * 0.05,
    left: -width * 0.4,
    opacity: 0.8,
  },
});

export default PastelCircleBackground;