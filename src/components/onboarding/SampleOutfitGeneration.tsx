import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';
import { warnInDev } from '@/utils/consoleSuppress';

interface SampleOutfitGenerationProps {
  onComplete: () => void;
}

// Sample outfit data for demonstration
const SAMPLE_OUTFITS = [
  {
    id: 1,
    title: 'Confident Professional',
    items: ['Navy Blazer', 'White Button-down', 'Dark Jeans', 'Brown Loafers'],
    confidenceNote:
      "This classic combination exudes quiet confidence. You'll feel ready for any meeting or presentation.",
    colors: ['#1e3a8a', '#ffffff', '#1f2937', '#8b4513'],
    occasion: 'Work',
    weatherNote: 'Perfect for mild weather',
  },
  {
    id: 2,
    title: 'Effortless Weekend',
    items: ['Soft Sweater', 'Comfortable Jeans', 'White Sneakers', 'Crossbody Bag'],
    confidenceNote:
      "Comfort meets style in this relaxed look. You'll feel at ease while looking effortlessly put-together.",
    colors: ['#f3f4f6', '#4b5563', '#ffffff', '#d1d5db'],
    occasion: 'Casual',
    weatherNote: 'Great for any season',
  },
  {
    id: 3,
    title: 'Evening Elegance',
    items: ['Black Dress', 'Statement Earrings', 'Heeled Boots', 'Clutch Purse'],
    confidenceNote:
      'Timeless elegance that makes you feel powerful and graceful. Perfect for making a memorable impression.',
    colors: ['#000000', '#ffd700', '#2d1b69', '#000000'],
    occasion: 'Evening',
    weatherNote: 'Add a jacket for cooler weather',
  },
];

export default function SampleOutfitGeneration({ onComplete }: SampleOutfitGenerationProps) {
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showOutfits, setShowOutfits] = useState(false);

  useEffect(() => {
    // Simulate AI generation process (accelerated in tests)
    const delay = process.env.NODE_ENV === 'test' ? 0 : 3000;
    const timer = setTimeout(() => {
      setIsGenerating(false);
      setShowOutfits(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const currentOutfit = SAMPLE_OUTFITS[currentOutfitIndex];
  // Guard against out-of-range index (defensive – should not normally occur)
  if (!currentOutfit) {
    return null;
  }

  const handleNextOutfit = () => {
    if (currentOutfitIndex < SAMPLE_OUTFITS.length - 1) {
      setCurrentOutfitIndex(currentOutfitIndex + 1);
    }
  };

  const handlePreviousOutfit = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex(currentOutfitIndex - 1);
    }
  };

  const renderGeneratingState = () => (
    <Animated.View entering={FadeIn.duration(800)} style={styles.generatingContainer}>
      <View style={styles.generatingContent}>
        <BlurView intensity={20} style={styles.generatingCard}>
          <View style={styles.loadingAnimation}>
            <Animated.View style={styles.loadingDot} />
            {/* Removed unsupported animationDelay style property – could be reintroduced via Reanimated stagger if needed */}
            <Animated.View style={styles.loadingDot} />
            <Animated.View style={styles.loadingDot} />
          </View>

          <Text style={styles.generatingTitle}>Creating Your Sample Outfits</Text>
          <Text style={styles.generatingSubtitle}>
            AYNA is analyzing style trends and creating personalized recommendations just for you...
          </Text>

          <View style={styles.generatingSteps}>
            <View style={styles.generatingStep}>
              <Ionicons name="checkmark-circle" size={20} color={DesignSystem.colors.sage[600]} />
              <Text style={styles.generatingStepText}>Analyzing your style preferences</Text>
            </View>
            <View style={styles.generatingStep}>
              <Ionicons name="checkmark-circle" size={20} color={DesignSystem.colors.sage[600]} />
              <Text style={styles.generatingStepText}>Considering weather patterns</Text>
            </View>
            <View style={styles.generatingStep}>
              <Ionicons name="time" size={20} color={DesignSystem.colors.gold[600]} />
              <Text style={styles.generatingStepText}>Creating confidence notes</Text>
            </View>
          </View>
        </BlurView>
      </View>
    </Animated.View>
  );

  const renderOutfitCard = () => (
    <Animated.View entering={FadeInUp.duration(800)} style={styles.outfitCard}>
      <BlurView intensity={15} style={styles.outfitCardContent}>
        {/* Outfit Header */}
        <View style={styles.outfitHeader}>
          <Text style={styles.outfitTitle}>{currentOutfit.title}</Text>
          <View style={styles.outfitMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase" size={16} color={DesignSystem.colors.sage[600]} />
              <Text style={styles.metaText}>{currentOutfit.occasion}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="partly-sunny" size={16} color={DesignSystem.colors.gold[600]} />
              <Text style={styles.metaText}>{currentOutfit.weatherNote}</Text>
            </View>
          </View>
        </View>

        {/* Color Palette */}
        <View style={styles.colorPalette}>
          <Text style={styles.colorPaletteTitle}>Color Harmony</Text>
          <View style={styles.colorSwatches}>
            {currentOutfit.colors.map((color, index) => (
              <View key={index} style={[styles.colorSwatch, { backgroundColor: color }]} />
            ))}
          </View>
        </View>

        {/* Outfit Items */}
        <View style={styles.outfitItems}>
          <Text style={styles.outfitItemsTitle}>Your Outfit</Text>
          <View style={styles.itemsList}>
            {currentOutfit.items.map((item, index) => (
              <View key={index} style={styles.outfitItem}>
                <View style={styles.itemIcon}>
                  <Ionicons
                    name={
                      item.includes('Blazer') || item.includes('Sweater')
                        ? 'shirt'
                        : item.includes('Jeans') || item.includes('Dress')
                          ? 'body'
                          : item.includes('Shoes') ||
                              item.includes('Loafers') ||
                              item.includes('Sneakers') ||
                              item.includes('Boots')
                            ? 'footsteps'
                            : 'diamond'
                    }
                    size={20}
                    color={DesignSystem.colors.sage[600]}
                  />
                </View>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confidence Note */}
        <View style={styles.confidenceNoteSection}>
          <Text style={styles.confidenceNoteTitle}>✨ Your Confidence Note</Text>
          <Text style={styles.confidenceNoteText}>{currentOutfit.confidenceNote}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.actionButton}>
            <Ionicons name="heart" size={20} color={DesignSystem.colors.gold[600]} />
            <Text style={styles.actionButtonText}>Love This</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="bookmark" size={20} color={DesignSystem.colors.sage[600]} />
            <Text style={styles.actionButtonText}>Save</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="share" size={20} color={DesignSystem.colors.neutral[600]} />
            <Text style={styles.actionButtonText}>Share</Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.background.secondary, DesignSystem.colors.background.primary]}
        style={styles.gradient}
      >
        {isGenerating ? (
          renderGeneratingState()
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.header}>
                <Text style={styles.title}>Your Sample Recommendations</Text>
                <Text style={styles.subtitle}>
                  Here&apos;s a preview of how AYNA creates personalized outfit recommendations for you
                </Text>
              </Animated.View>

              {/* Outfit Navigation */}
              <Animated.View
                entering={FadeInUp.delay(400).duration(600)}
                style={styles.navigationDots}
              >
                {SAMPLE_OUTFITS.map((_, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.navigationDot,
                      index === currentOutfitIndex && styles.navigationDotActive,
                    ]}
                    onPress={() => setCurrentOutfitIndex(index)}
                  />
                ))}
              </Animated.View>

              {/* Current Outfit */}
              {renderOutfitCard()}

              {/* Navigation Buttons */}
              <Animated.View
                entering={FadeInUp.delay(800).duration(600)}
                style={styles.outfitNavigation}
              >
                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.navButton,
                    currentOutfitIndex === 0 && styles.navButtonDisabled,
                    pressed && styles.navButtonPressed,
                  ]}
                  onPress={handlePreviousOutfit}
                  disabled={currentOutfitIndex === 0}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={
                      currentOutfitIndex === 0
                        ? DesignSystem.colors.neutral[400]
                        : DesignSystem.colors.sage[600]
                    }
                  />
                  <Text
                    style={[
                      styles.navButtonText,
                      currentOutfitIndex === 0 && styles.navButtonTextDisabled,
                    ]}
                  >
                    Previous
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.navButton,
                    currentOutfitIndex === SAMPLE_OUTFITS.length - 1 && styles.navButtonDisabled,
                    pressed && styles.navButtonPressed,
                  ]}
                  onPress={handleNextOutfit}
                  disabled={currentOutfitIndex === SAMPLE_OUTFITS.length - 1}
                >
                  <Text
                    style={[
                      styles.navButtonText,
                      currentOutfitIndex === SAMPLE_OUTFITS.length - 1 &&
                        styles.navButtonTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={
                      currentOutfitIndex === SAMPLE_OUTFITS.length - 1
                        ? DesignSystem.colors.neutral[400]
                        : DesignSystem.colors.sage[600]
                    }
                  />
                </Pressable>
              </Animated.View>

              {/* Complete Button */}
              <Animated.View
                entering={FadeInDown.delay(1000).duration(600)}
                style={styles.completeSection}
              >
                <Text style={styles.completeText}>Ready to start your confidence journey?</Text>

                <Pressable
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.completeButton,
                    pressed && styles.completeButtonPressed,
                  ]}
                  onPress={onComplete}
                >
                  <LinearGradient
                    colors={[DesignSystem.colors.sage[400], DesignSystem.colors.sage[600]]}
                    style={styles.completeButtonGradient}
                  >
                    <Text style={styles.completeButtonText}>Start Using AYNA Mirror</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={DesignSystem.colors.text.inverse}
                      style={styles.completeButtonIcon}
                    />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const createStyles = (styleObj: Record<string, ViewStyle | TextStyle | ImageStyle>) => {
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
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing.xxxl,
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  generatingContent: {
    width: '100%',
  },
  generatingCard: {
    borderRadius: DesignSystem.borderRadius.large,
    padding: DesignSystem.spacing.xl,
    alignItems: 'center',
    ...DesignSystem.effects.elevation.medium,
  },
  loadingAnimation: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.xl,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignSystem.colors.sage[500],
  },
  generatingTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  generatingSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  generatingSteps: {
    gap: DesignSystem.spacing.md,
    width: '100%',
  },
  generatingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  generatingStepText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  title: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.xl,
  },
  navigationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignSystem.colors.neutral[300],
  },
  navigationDotActive: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  outfitCard: {
    marginBottom: DesignSystem.spacing.xl,
  },
  outfitCardContent: {
    borderRadius: DesignSystem.borderRadius.large,
    padding: DesignSystem.spacing.xl,
    ...DesignSystem.effects.elevation.medium,
  },
  outfitHeader: {
    marginBottom: DesignSystem.spacing.lg,
  },
  outfitTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  outfitMeta: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: DesignSystem.colors.text.secondary,
  },
  colorPalette: {
    marginBottom: DesignSystem.spacing.lg,
  },
  colorPaletteTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DesignSystem.colors.background.elevated,
    ...DesignSystem.effects.elevation.subtle,
  },
  outfitItems: {
    marginBottom: DesignSystem.spacing.lg,
  },
  outfitItemsTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
  },
  itemsList: {
    gap: DesignSystem.spacing.sm,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.sm,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.sage[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
  },
  confidenceNoteSection: {
    marginBottom: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.sage[50],
    borderRadius: DesignSystem.borderRadius.md,
  },
  confidenceNoteTitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.sage[700],
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
  },
  confidenceNoteText: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.sage[800],
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: DesignSystem.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.neutral[300],
  },
  actionButton: {
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  actionButtonText: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
  },
  outfitNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  navButtonText: {
    ...DesignSystem.typography.button.medium,
    color: DesignSystem.colors.sage[600],
  },
  navButtonTextDisabled: {
    color: DesignSystem.colors.neutral[400],
  },
  completeSection: {
    alignItems: 'center',
  },
  completeText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  completeButton: {
    borderRadius: DesignSystem.borderRadius.large,
    ...DesignSystem.effects.elevation.medium,
  },
  completeButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.xxxl,
    paddingVertical: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.large,
  },
  completeButtonText: {
    ...DesignSystem.typography.button.medium,
    color: DesignSystem.colors.text.inverse,
  },
  completeButtonIcon: {
    marginLeft: DesignSystem.spacing.sm,
  },
});

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated'),
  FadeIn: {
    duration: jest.fn(() => ({ duration: jest.fn() })),
  },
}));
