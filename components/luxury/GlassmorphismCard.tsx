import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LuxuryMaterials, LuxuryShadows, LuxuryLayout } from '../../theme/AppThemeV2';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'subtle' | 'dark';
  intensity?: number;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  style,
  variant = 'primary',
  intensity = 25,
}) => {
  const glassStyle = LuxuryMaterials.glass[variant];

  return (
    <View style={[styles.container, style]}>
      {/* Backdrop blur effect */}
      <BlurView
        intensity={intensity}
        style={styles.blurView}
        tint="light"
      />
      
      {/* Glass overlay with border */}
      <View style={[styles.glassOverlay, {
        backgroundColor: glassStyle.backgroundColor,
        borderColor: glassStyle.borderColor,
        borderWidth: glassStyle.borderWidth,
      }]}>
        {/* Subtle noise texture overlay */}
        <View style={styles.textureOverlay} />
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: LuxuryLayout.card.borderRadius,
    overflow: 'hidden',
    ...LuxuryShadows.float,
  },
  
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  
  glassOverlay: {
    flex: 1,
    borderRadius: LuxuryLayout.card.borderRadius,
    // Inner border to catch light
    borderStyle: 'solid',
  },
  
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.02,
    // Subtle noise pattern
    borderRadius: LuxuryLayout.card.borderRadius,
  },
  
  content: {
    flex: 1,
    padding: LuxuryLayout.card.padding,
    zIndex: 1,
  },
});

export default GlassmorphismCard; 