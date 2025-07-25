import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

interface VellumCanvasProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'warm' | 'cool';
}

/**
 * VellumCanvas
 * The foundation of Material Honesty - a premium, textured surface
 * that feels like high-quality vellum paper
 */
const VellumCanvas: React.FC<VellumCanvasProps> = ({ 
  children, 
  style, 
  variant = 'default' 
}) => {
  // Subtle gradient variations for different moods
  const getGradientColors = (): readonly [string, string, string] => {
    switch (variant) {
      case 'warm':
        return [
          APP_THEME_V2.colors.whisperWhite,
          '#FAF9F7', // Slightly warmer
          APP_THEME_V2.colors.moonlightSilver,
        ];
      case 'cool':
        return [
          APP_THEME_V2.colors.moonlightSilver,
          '#F6F7F8', // Slightly cooler
          APP_THEME_V2.colors.whisperWhite,
        ];
      default:
        return [
          APP_THEME_V2.colors.whisperWhite,
          APP_THEME_V2.colors.moonlightSilver,
          APP_THEME_V2.colors.whisperWhite,
        ];
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Base gradient for subtle depth */}
      <LinearGradient
        colors={getGradientColors()}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />
      
      {/* Subtle texture overlay using CSS-like approach */}
      <View style={styles.textureOverlay} pointerEvents="none" />
      
      {/* Vignette for depth */}
      <LinearGradient
        colors={['transparent', APP_THEME_V2.colors.moonlightSilver + '20']}
        locations={[0.7, 1]}
        style={styles.vignette}
        pointerEvents="none"
      />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: APP_THEME_V2.colors.moonlightSilver,
    opacity: 0.15,
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default VellumCanvas; 