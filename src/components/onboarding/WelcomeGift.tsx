import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { warnInDev } from '../../utils/consoleSuppress';

const { width, height } = Dimensions.get('window');

interface StyleDNA {
  style_energy?: { value: string };
  color_palette?: { value: string };
  [key: string]: any;
}

interface OutfitItem {
  type: string;
  name: string;
  color: string;
}

interface Outfit {
  id: string;
  name: string;
  description: string;
  items: OutfitItem[];
  confidence: number;
  styleMatch: string;
}

interface WelcomeGiftProps {
  styleDNA: StyleDNA;
  onComplete: () => void;
  onOutfitSelect: (outfit: Outfit, feedback: string) => void;
}

// Generate personalized outfits based on Style DNA
const generatePersonalizedOutfits = (styleDNA: StyleDNA): Outfit[] => {
  const outfits = [
    {
      id: 'outfit_1',
      name: 'Your Signature Look',
      description: 'Perfectly captures your unique style essence',
      items: [
        { type: 'top', name: 'Silk Blouse', color: '#F8E8E7' },
        { type: 'bottom', name: 'Tailored Trousers', color: '#2C3E50' },
        { type: 'accessory', name: 'Gold Pendant', color: '#D4A574' },
      ],
      confidence: 95,
      styleMatch: 'Perfect match for your calm strength energy',
    },
    {
      id: 'outfit_2',
      name: 'Elevated Everyday',
      description: 'Effortless sophistication for daily confidence',
      items: [
        { type: 'dress', name: 'Midi Dress', color: '#7BA7BC' },
        { type: 'jacket', name: 'Structured Blazer', color: '#2C3E50' },
        { type: 'accessory', name: 'Leather Belt', color: '#8B7355' },
      ],
      confidence: 92,
      styleMatch: 'Reflects your preference for timeless elegance',
    },
    {
      id: 'outfit_3',
      name: 'Weekend Luxe',
      description: 'Relaxed refinement for your personal moments',
      items: [
        { type: 'top', name: 'Cashmere Sweater', color: '#E6D7D3' },
        { type: 'bottom', name: 'Wide-leg Pants', color: '#B8956A' },
        { type: 'accessory', name: 'Delicate Bracelet', color: '#D4A574' },
      ],
      confidence: 89,
      styleMatch: 'Honors your love for soft, luxurious textures',
    },
  ];

  return outfits;
};

export default function WelcomeGift({ styleDNA, onComplete, onOutfitSelect }: WelcomeGiftProps) {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'reveal' | 'selection'>('intro');
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);

  const giftBoxAnim = useSharedValue(0);
  const outfitsAnim = useSharedValue(0);
  const sparkleAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(1);

  const outfits = generatePersonalizedOutfits(styleDNA);

  // Animated styles
  const sparkleStyle = useAnimatedStyle(() => {
    return {
      opacity: sparkleAnim.value,
      transform: [
        {
          scale: interpolate(sparkleAnim.value, [0, 1], [0.8, 1.2]),
        },
      ],
    };
  });

  const giftBoxRevealStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(giftBoxAnim.value, [0, 0.5, 1], [1, 1.3, 0]),
        },
        {
          rotateY: `${interpolate(giftBoxAnim.value, [0, 1], [0, 180])}deg`,
        },
      ] as any,
      opacity: interpolate(giftBoxAnim.value, [0, 0.8, 1], [1, 1, 0]),
    };
  });

  const outfitsRevealStyle = useAnimatedStyle(() => {
    return {
      opacity: outfitsAnim.value,
      transform: [
        {
          translateY: interpolate(outfitsAnim.value, [0, 1], [50, 0]),
        },
      ],
    };
  });

  const handleRevealGift = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    runOnJS(setCurrentPhase)('reveal');

    // Gift box opening animation
    giftBoxAnim.value = withTiming(1, { duration: 800 }, () => {
      outfitsAnim.value = withTiming(1, { duration: 1000 }, () => {
        runOnJS(setCurrentPhase)('selection');
      });
    });
  }, [giftBoxAnim, outfitsAnim]);

  useEffect(() => {
    // Start sparkle animation
    sparkleAnim.value = withSequence(
      withTiming(1, { duration: 2000 }),
      withTiming(0, { duration: 2000 }),
    );

    // Auto-advance to reveal phase
    setTimeout(() => {
      handleRevealGift();
    }, 3000);
  }, [handleRevealGift, sparkleAnim]);

  const handleOutfitSelect = (outfit: Outfit) => {
    setSelectedOutfit(outfit.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Generate personalized feedback
    const feedback = generatePersonalizedFeedback(outfit, styleDNA);

    setTimeout(() => {
      onOutfitSelect(outfit, feedback);
    }, 1000);
  };

  const generatePersonalizedFeedback = (outfit: Outfit, styleDNA: StyleDNA): string => {
    const energyType = (styleDNA.style_energy?.value || 'calm_strength') as
      | 'calm_strength'
      | 'creative_spark'
      | 'warm_approachable'
      | 'bold_magnetic';
    const colorPalette = styleDNA.color_palette?.value || 'soft_elegance';

    const feedbackMap: Record<
      'calm_strength' | 'creative_spark' | 'warm_approachable' | 'bold_magnetic',
      string
    > = {
      calm_strength:
        'Excellent choice! We noted that you prefer a "Calm & Strong" presence. You\'ll see more sophisticated, confidence-building pieces like this in your future recommendations.',
      creative_spark:
        "Perfect selection! Your creative energy shines through. We'll curate more artistic, unique pieces that express your individual flair.",
      warm_approachable:
        'Beautiful choice! Your warm, approachable style is noted. Expect more inviting, elegant pieces that draw people to your positive energy.',
      bold_magnetic:
        "Stunning selection! Your bold, magnetic presence is clear. We'll show you more striking pieces that command attention and turn heads.",
    };

    return feedbackMap[energyType];
  };

  const renderIntroPhase = () => (
    <View style={styles.introContainer}>
      <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>

      <Text style={styles.welcomeTitle}>We are thrilled to know you!</Text>

      <Text style={styles.welcomeSubtitle}>
        As a welcome gift, we&apos;ve prepared the first three combinations showcasing the potential of
        your wardrobe, specially curated according to your unique Style DNA.
      </Text>

      <View style={styles.giftBoxContainer}>
        <Text style={styles.giftBox}>🎁</Text>
        <Text style={styles.giftBoxLabel}>Your Personal Style Gift</Text>
      </View>
    </View>
  );

  const renderRevealPhase = () => (
    <View style={styles.revealContainer}>
      <Animated.View style={[styles.giftBoxReveal, giftBoxRevealStyle]}>
        <Text style={styles.giftBoxLarge}>🎁</Text>
      </Animated.View>

      <Animated.View style={[styles.outfitsReveal, outfitsRevealStyle]}>
        <Text style={styles.revealTitle}>Your Style DNA Combinations</Text>
        <Text style={styles.revealSubtitle}>Crafted exclusively for you</Text>
      </Animated.View>
    </View>
  );

  const renderSelectionPhase = () => (
    <ScrollView style={styles.selectionContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.selectionTitle}>Choose Your First Favorite</Text>
      <Text style={styles.selectionSubtitle}>
        Each selection teaches us more about your unique style
      </Text>

      {outfits.map((outfit, index) => (
        <Animated.View
          key={outfit.id}
          style={[
            styles.outfitCard,
            selectedOutfit === outfit.id && styles.selectedOutfitCard,
            {
              opacity: outfitsAnim,
              transform: [
                {
                  translateY: interpolate(outfitsAnim.value, [0, 1], [100 + index * 20, 0]),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleOutfitSelect(outfit)}
            activeOpacity={0.9}
            style={styles.outfitTouchable}
          >
            {/* Outfit Visual */}
            <View style={styles.outfitVisual}>
              {outfit.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.outfitItem,
                    { backgroundColor: item.color },
                    itemIndex === 0 && styles.firstItem,
                    itemIndex === outfit.items.length - 1 && styles.lastItem,
                  ]}
                />
              ))}
            </View>

            {/* Outfit Details */}
            <View style={styles.outfitDetails}>
              <Text style={styles.outfitName}>{outfit.name}</Text>
              <Text style={styles.outfitDescription}>{outfit.description}</Text>

              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${outfit.confidence}%` }]} />
                </View>
                <Text style={styles.confidenceText}>{outfit.confidence}% Style Match</Text>
              </View>

              <Text style={styles.styleMatch}>{outfit.styleMatch}</Text>
            </View>

            {/* Selection Indicator */}
            {selectedOutfit === outfit.id && (
              <View style={styles.selectionIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#D4A574" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={onComplete}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Begin My Style Journey"
        accessibilityHint="Complete the welcome process and start using the app"
      >
        <LinearGradient colors={['#D4A574', '#B8956A']} style={styles.continueGradient}>
          <Text style={styles.continueText}>Begin My Style Journey</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <LinearGradient colors={['#F8F6F0', '#FFFFFF', '#F8F6F0']} style={styles.container}>
      {currentPhase === 'intro' && renderIntroPhase()}
      {currentPhase === 'reveal' && renderRevealPhase()}
      {currentPhase === 'selection' && renderSelectionPhase()}

      {/* Decorative Background */}
      <View style={styles.decorativeBackground}>
        <View style={[styles.decorativeCircle, styles.topCircle]} />
        <View style={[styles.decorativeCircle, styles.bottomCircle]} />
      </View>
    </LinearGradient>
  );
}

const createStyles = (styleObj: Record<string, any>) => {
  try {
    return StyleSheet.create(styleObj);
  } catch (error) {
    warnInDev('StyleSheet.create failed, using fallback styles:', error);
    // Return a safe fallback with basic styles
    return {
      container: { flex: 1 },
      gradient: { flex: 1 },
      scrollView: { flex: 1 },
      content: { padding: 20 },
      ...styleObj,
    };
  }
};

const styles = createStyles({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  sparkleContainer: {
    marginBottom: 32,
  },
  sparkleText: {
    fontSize: 48,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  giftBoxContainer: {
    alignItems: 'center',
  },
  giftBox: {
    fontSize: 64,
    marginBottom: 8,
  },
  giftBoxLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#D4A574',
  },
  revealContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftBoxReveal: {
    position: 'absolute',
  },
  giftBoxLarge: {
    fontSize: 120,
  },
  outfitsReveal: {
    alignItems: 'center',
  },
  revealTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  revealSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#D4A574',
    textAlign: 'center',
  },
  selectionContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  selectionTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 32,
  },
  outfitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOutfitCard: {
    borderColor: '#D4A574',
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
  },
  outfitTouchable: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitVisual: {
    flexDirection: 'row',
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  outfitItem: {
    width: 20,
    height: 60,
  },
  firstItem: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastItem: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  outfitDetails: {
    flex: 1,
  },
  outfitName: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  outfitDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    marginBottom: 12,
    lineHeight: 20,
  },
  confidenceContainer: {
    marginBottom: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#D4A574',
  },
  styleMatch: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    fontStyle: 'italic',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  continueButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  decorativeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(212, 165, 116, 0.03)',
  },
  topCircle: {
    top: -75,
    right: -75,
  },
  bottomCircle: {
    bottom: -75,
    left: -75,
  },
});
