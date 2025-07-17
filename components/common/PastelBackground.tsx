import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

const { width, height } = Dimensions.get('window');

const PastelBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          APP_THEME_V2.colors.linen.light,
          APP_THEME_V2.colors.sageGreen[50],
          APP_THEME_V2.colors.liquidGold[50],
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
    backgroundColor: APP_THEME_V2.semantic.background,
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
    backgroundColor: APP_THEME_V2.colors.sageGreen[100],
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
    backgroundColor: APP_THEME_V2.colors.liquidGold[100],
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