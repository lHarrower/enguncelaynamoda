import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.6;

const HeroShowcase = ({ scrollY }: { scrollY: Animated.SharedValue<number> }) => {
  const animatedImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-HERO_HEIGHT, 0, HERO_HEIGHT],
      [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.2],
    );
    const scale = interpolate(scrollY.value, [-HERO_HEIGHT, 0], [2, 1], 'clamp');
    return {
      transform: [{ translateY }, { scale }] as any,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f' }}
        style={[styles.image, animatedImageStyle]}
      />
      <View style={styles.overlay} />
      <View style={styles.contentContainer}>
        <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
          <Text style={styles.heroTitle}>{"Season's Statement"}</Text>
          <Text style={styles.heroSubtitle}>
            Rich textures and timeless silhouettes to define your style.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            accessibilityRole="button"
            accessibilityLabel="Discover The Collection"
            accessibilityHint="Tap to explore the season's statement collection"
          >
            <Text style={styles.ctaButtonText}>Discover The Collection</Text>
            <Ionicons name="arrow-forward" size={16} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    alignItems: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    padding: 24,
    width: width * 0.85,
  },
  container: {
    alignItems: 'center',
    height: HERO_HEIGHT,
    justifyContent: 'center',
    marginBottom: 30,
    overflow: 'hidden',
    width: width,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: DesignSystem.borderRadius.lg,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    ...DesignSystem.elevation.soft,
  },
  ctaButtonText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  heroSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  heroTitle: {
    ...DesignSystem.typography.heading.h1,
    color: '#FFFFFF',
    fontSize: 32,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  image: {
    height: '120%',
    position: 'absolute',
    width: '120%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

export default HeroShowcase;
