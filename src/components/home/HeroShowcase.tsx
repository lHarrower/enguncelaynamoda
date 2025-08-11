import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.6;

const HeroShowcase = ({ scrollY }: { scrollY: Animated.SharedValue<number> }) => {
  const animatedImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-HERO_HEIGHT, 0, HERO_HEIGHT],
      [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.2]
    );
    const scale = interpolate(
        scrollY.value,
        [-HERO_HEIGHT, 0],
        [2, 1],
        'clamp'
    );
    return {
      transform: [{ translateY }, { scale }],
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
            <Text style={styles.heroTitle}>Season's Statement</Text>
            <Text style={styles.heroSubtitle}>Rich textures and timeless silhouettes to define your style.</Text>
            <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Discover The Collection</Text>
                <Ionicons name="arrow-forward" size={16} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        height: HERO_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 30,
    },
    image: {
        position: 'absolute',
        width: '120%', 
        height: '120%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    contentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    blurContainer: {
        padding: 24,
        borderRadius: DesignSystem.borderRadius.lg,
        alignItems: 'center',
        overflow: 'hidden',
        width: width * 0.85,
    },
    heroTitle: {
        ...DesignSystem.typography.heading.h1,
        color: '#FFFFFF',
        fontSize: 32,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    heroSubtitle: {
        ...DesignSystem.typography.body.medium,
         color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 24,
    },
    ctaButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: DesignSystem.borderRadius.lg,
        ...DesignSystem.elevation.soft,
    },
    ctaButtonText: {
        ...DesignSystem.typography.body.medium,
        fontWeight: '600',
        color: DesignSystem.colors.text.primary,
        marginRight: 8,
    },
});

export default HeroShowcase;