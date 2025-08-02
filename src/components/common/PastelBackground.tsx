import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  shape: {
    position: 'absolute',
    borderRadius: width,
    opacity: 0.15,
  },
  shape1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: DesignSystem.colors.sage[100],
    top: -height * 0.2,
    right: -width * 0.5,
    opacity: 0.1,
    transform: [{ rotate: '-30deg' }],
  },
  shape2: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: DesignSystem.colors.sage[200],
    bottom: -height * 0.1,
    left: -width * 0.3,
    opacity: 0.15,
    transform: [{ rotate: '20deg' }],
  },
  shape3: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#FFFFFF',
    top: height * 0.3,
    left: -width * 0.4,
    opacity: 0.2,
    transform: [{ rotate: '80deg' }],
  }
});

export default PastelBackground;