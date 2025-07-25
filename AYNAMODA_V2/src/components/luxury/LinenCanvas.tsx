import React from 'react';
import { View, StyleSheet, ViewStyle, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';

interface LinenCanvasProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'subtle' | 'warm';
}

const LinenCanvas: React.FC<LinenCanvasProps> = ({ 
  children, 
  style, 
  variant = 'default' 
}) => {
  const getGradientColors = (): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    switch (variant) {
      case 'subtle':
        return [
          APP_THEME_V2.colors.linen.base,
          APP_THEME_V2.colors.linen.light,
          APP_THEME_V2.colors.linen.base,
        ];
      case 'warm':
        return [
          APP_THEME_V2.colors.linen.base,
          `${APP_THEME_V2.colors.liquidGold[200]}10`, // 10% opacity
          APP_THEME_V2.colors.linen.base,
        ];
      default:
        return [
          APP_THEME_V2.colors.linen.base,
          `${APP_THEME_V2.colors.whisperWhite}20`, // 20% opacity
          APP_THEME_V2.colors.linen.base,
        ];
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Base Linen Background */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Subtle Texture Overlay */}
      <View style={styles.textureOverlay} />
      
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
    backgroundColor: 'transparent',
    // Subtle noise pattern - simulating linen texture
    opacity: 0.1,
    // Note: In a real implementation, you might use a pattern image here
    // backgroundImage: 'url("data:image/svg+xml,...")', // SVG noise pattern
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default LinenCanvas; 