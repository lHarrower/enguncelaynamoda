import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface SampleOutfitGenerationProps {
  onComplete: () => void;
}

// Sample outfit data for demonstration
const SAMPLE_OUTFITS = [
  {
    id: 1,
    title: 'Confident Professional',
    items: ['Navy Blazer', 'White Button-down', 'Dark Jeans', 'Brown Loafers'],
    confidenceNote: "This classic combination exudes quiet confidence. You'll feel ready for any meeting or presentation.",
    colors: ['#1e3a8a', '#ffffff', '#1f2937', '#8b4513'],
    occasion: 'Work',
    weatherNote: 'Perfect for mild weather',
  },
  {
    id: 2,
    title: 'Effortless Weekend',
    items: ['Soft Sweater', 'Comfortable Jeans', 'White Sneakers', 'Crossbody Bag'],
    confidenceNote: "Comfort meets style in this relaxed look. You'll feel at ease while looking effortlessly put-together.",
    colors: ['#f3f4f6', '#4b5563', '#ffffff', '#d1d5db'],
    occasion: 'Casual',
    weatherNote: 'Great for any season',
  },
  {
    id: 3,
    title: 'Evening Elegance',
    items: ['Black Dress', 'Statement Earrings', 'Heeled Boots', 'Clutch Purse'],
    confidenceNote: "Timeless elegance that makes you feel powerful and graceful. Perfect for making a memorable impression.",
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
    // Simulate AI generation process
    const timer = setTimeout(() => {
      setIsGenerating(false);
      setShowOutfits(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const currentOutfit = SAMPLE_OUTFITS[currentOutfitIndex];

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
            <Animated.View style={[styles.loadingDot, { animationDelay: '0.2s' }]} />
            <Animated.View style={[styles.loadingDot, { animationDelay: '0.4s' }]} />
          </View>
          
          <Text style={styles.generatingTitle}>Creating Your Sample Outfits</Text>
          <Text style={styles.generatingSubtitle}>
            AYNA is analyzing style trends and creating personalized recommendations just for you...
          </Text>
          
          <View style={styles.generatingSteps}>
            <View style={styles.generatingStep}>
              <Ionicons name="checkmark-circle" size={20} color={APP_THEME_V2.colors.sageGreen[600]} />
              <Text style={styles.generatingStepText}>Analyzing your style preferences</Text>
            </View>
            <View style={styles.generatingStep}>
              <Ionicons name="checkmark-circle" size={20} color={APP_THEME_V2.colors.sageGreen[600]} />
              <Text style={styles.generatingStepText}>Considering weather patterns</Text>
            </View>
            <View style={styles.generatingStep}>
              <Ionicons name="time" size={20} color={APP_THEME_V2.colors.liquidGold[600]} />
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
              <Ionicons name="briefcase" size={16} color={APP_THEME_V2.colors.sageGreen[600]} />
              <Text style={styles.metaText}>{currentOutfit.occasion}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="partly-sunny" size={16} color={APP_THEME_V2.colors.liquidGold[600]} />
              <Text style={styles.metaText}>{currentOutfit.weatherNote}</Text>
            </View>
          </View>
        </View>

        {/* Color Palette */}
        <View style={styles.colorPalette}>
          <Text style={styles.colorPaletteTitle}>Color Harmony</Text>
          <View style={styles.colorSwatches}>
            {currentOutfit.colors.map((color, index) => (
              <View 
                key={index}
                style={[styles.colorSwatch, { backgroundColor: color }]} 
              />
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
                      item.includes('Blazer') || item.includes('Sweater') ? 'shirt' :
                      item.includes('Jeans') || item.includes('Dress') ? 'body' :
                      item.includes('Shoes') || item.includes('Loafers') || item.includes('Sneakers') || item.includes('Boots') ? 'footsteps' :
                      'diamond'
                    } 
                    size={20} 
                    color={APP_THEME_V2.colors.sageGreen[600]} 
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
          <Text style={styles.confidenceNoteText}>
            {currentOutfit.confidenceNote}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.actionButton}>
            <Ionicons name="heart" size={20} color={APP_THEME_V2.colors.liquidGold[600]} />
            <Text style={styles.actionButtonText}>Love This</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="bookmark" size={20} color={APP_THEME_V2.colors.sageGreen[600]} />
            <Text style={styles.actionButtonText}>Save</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="share" size={20} color={APP_THEME_V2.colors.inkGray[600]} />
            <Text style={styles.actionButtonText}>Share</Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[APP_THEME_V2.colors.linen.light, APP_THEME_V2.colors.linen.base]}
        style={styles.gradient}
      >
        {isGenerating ? (
          renderGeneratingState()
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Animated.View 
                entering={FadeInUp.delay(200).duration(600)}
                style={styles.header}
              >
                <Text style={styles.title}>Your Sample Recommendations</Text>
                <Text style={styles.subtitle}>
                  Here's a preview of how AYNA creates personalized outfit recommendations for you
                </Text>
              </Animated.View>

              {/* Outfit Navigation */}
              <Animated.View 
                entering={FadeInUp.delay(400).duration(600)}
                style={styles.navigationDots}
              >
                {SAMPLE_OUTFITS.map((_, index) => (
                  <Animated.Pressable
                    key={index}
                    style={[
                      styles.navigationDot,
                      index === currentOutfitIndex && styles.navigationDotActive
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
                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    currentOutfitIndex === 0 && styles.navButtonDisabled,
                    pressed && styles.navButtonPressed
                  ]}
                  onPress={handlePreviousOutfit}
                  disabled={currentOutfitIndex === 0}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={24} 
                    color={
                      currentOutfitIndex === 0 
                        ? APP_THEME_V2.colors.inkGray[400] 
                        : APP_THEME_V2.colors.sageGreen[600]
                    } 
                  />
                  <Text style={[
                    styles.navButtonText,
                    currentOutfitIndex === 0 && styles.navButtonTextDisabled
                  ]}>
                    Previous
                  </Text>
                </Animated.Pressable>

                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    currentOutfitIndex === SAMPLE_OUTFITS.length - 1 && styles.navButtonDisabled,
                    pressed && styles.navButtonPressed
                  ]}
                  onPress={handleNextOutfit}
                  disabled={currentOutfitIndex === SAMPLE_OUTFITS.length - 1}
                >
                  <Text style={[
                    styles.navButtonText,
                    currentOutfitIndex === SAMPLE_OUTFITS.length - 1 && styles.navButtonTextDisabled
                  ]}>
                    Next
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={
                      currentOutfitIndex === SAMPLE_OUTFITS.length - 1 
                        ? APP_THEME_V2.colors.inkGray[400] 
                        : APP_THEME_V2.colors.sageGreen[600]
                    } 
                  />
                </Animated.Pressable>
              </Animated.View>

              {/* Complete Button */}
              <Animated.View 
                entering={FadeInDown.delay(1000).duration(600)}
                style={styles.completeSection}
              >
                <Text style={styles.completeText}>
                  Ready to start your confidence journey?
                </Text>
                
                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.completeButton,
                    pressed && styles.completeButtonPressed
                  ]}
                  onPress={onComplete}
                >
                  <LinearGradient
                    colors={[APP_THEME_V2.colors.sageGreen[400], APP_THEME_V2.colors.sageGreen[600]]}
                    style={styles.completeButtonGradient}
                  >
                    <Text style={styles.completeButtonText}>Start Using AYNA Mirror</Text>
                    <Ionicons 
                      name="arrow-forward" 
                      size={20} 
                      color={APP_THEME_V2.semantic.text.inverse}
                      style={styles.completeButtonIcon}
                    />
                  </LinearGradient>
                </Animated.Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingTop: APP_THEME_V2.spacing.xl,
    paddingBottom: APP_THEME_V2.spacing.xxxl,
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: APP_THEME_V2.spacing.xl,
  },
  generatingContent: {
    width: '100%',
  },
  generatingCard: {
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.xl,
    alignItems: 'center',
    ...APP_THEME_V2.elevation.lift,
  },
  loadingAnimation: {
    flexDirection: 'row',
    gap: APP_THEME_V2.spacing.sm,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: APP_THEME_V2.colors.sageGreen[500],
  },
  generatingTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  generatingSubtitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  generatingSteps: {
    gap: APP_THEME_V2.spacing.md,
    width: '100%',
  },
  generatingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.sm,
  },
  generatingStepText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  title: {
    ...APP_THEME_V2.typography.scale.h1,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  subtitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: APP_THEME_V2.spacing.sm,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  navigationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: APP_THEME_V2.colors.moonlightSilver,
  },
  navigationDotActive: {
    backgroundColor: APP_THEME_V2.colors.sageGreen[500],
  },
  outfitCard: {
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  outfitCardContent: {
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.xl,
    ...APP_THEME_V2.elevation.lift,
  },
  outfitHeader: {
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  outfitTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  outfitMeta: {
    flexDirection: 'row',
    gap: APP_THEME_V2.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.xs,
  },
  metaText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
  },
  colorPalette: {
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  colorPaletteTitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.primary,
    fontWeight: '600',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: APP_THEME_V2.spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: APP_THEME_V2.colors.whisperWhite,
    ...APP_THEME_V2.elevation.whisper,
  },
  outfitItems: {
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  outfitItemsTitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.primary,
    fontWeight: '600',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  itemsList: {
    gap: APP_THEME_V2.spacing.sm,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.sm,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APP_THEME_V2.colors.sageGreen[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
  },
  confidenceNoteSection: {
    marginBottom: APP_THEME_V2.spacing.lg,
    padding: APP_THEME_V2.spacing.md,
    backgroundColor: APP_THEME_V2.colors.sageGreen[50],
    borderRadius: APP_THEME_V2.radius.md,
  },
  confidenceNoteTitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.colors.sageGreen[700],
    fontWeight: '600',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  confidenceNoteText: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.colors.sageGreen[800],
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: APP_THEME_V2.spacing.md,
    borderTopWidth: 1,
    borderTopColor: APP_THEME_V2.colors.moonlightSilver,
  },
  actionButton: {
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.xs,
  },
  actionButtonText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
  },
  outfitNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.xs,
    paddingVertical: APP_THEME_V2.spacing.sm,
    paddingHorizontal: APP_THEME_V2.spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  navButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.colors.sageGreen[600],
  },
  navButtonTextDisabled: {
    color: APP_THEME_V2.colors.inkGray[400],
  },
  completeSection: {
    alignItems: 'center',
  },
  completeText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  completeButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
  },
  completeButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: APP_THEME_V2.spacing.xxxl,
    paddingVertical: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  completeButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.inverse,
  },
  completeButtonIcon: {
    marginLeft: APP_THEME_V2.spacing.sm,
  },
});