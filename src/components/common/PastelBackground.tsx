import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');

const PastelBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          DesignSystem.colors.sage[50],
          DesignSystem.colors.sage[100],
          DesignSystem.colors.sage[75],
        ]}
        style={styles.gradient}
      />
      <View style={styles.shape1} />
      <View style={styles.shape2} />
      <View style={styles.shape3} />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  shape: {
    borderRadius: width,
    opacity: 0.15,
    position: 'absolute',
  },
  shape1: {
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: width * 0.75,
    height: width * 1.5,
    opacity: 0.1,
    position: 'absolute',
    right: -width * 0.5,
    top: -height * 0.2,
    transform: [{ rotate: '-30deg' }],
    width: width * 1.5,
  },
  shape2: {
    backgroundColor: DesignSystem.colors.sage[200],
    borderRadius: width * 0.5,
    bottom: -height * 0.1,
    height: width,
    left: -width * 0.3,
    opacity: 0.15,
    position: 'absolute',
    transform: [{ rotate: '20deg' }],
    width: width,
  },
  shape3: {
    backgroundColor: '#FFFFFF',
    borderRadius: width * 0.4,
    height: width * 0.8,
    left: -width * 0.4,
    opacity: 0.2,
    position: 'absolute',
    top: height * 0.3,
    transform: [{ rotate: '80deg' }],
    width: width * 0.8,
  },
});

export default PastelBackground;
