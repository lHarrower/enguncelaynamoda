import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

// Safe dimensions getter for testing
const getDimensions = () => {
  try {
    return Dimensions.get('window');
  } catch {
    return { width: 375, height: 812 };
  }
};

const { width, height } = getDimensions();

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export default function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.neutral[50], DesignSystem.colors.neutral[100]]}
        style={styles.gradient}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern} />

        {/* Main Content */}
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.heroSection}>
            <Text style={styles.heroTitle}>Welcome to AYNA</Text>
            <Text style={styles.heroSubtitle}>Your Mirror of Confidence</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.descriptionSection}
          >
            <BlurView intensity={20} style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Transform Your Morning Ritual</Text>
              <Text style={styles.descriptionText}>
                Every day at 6 AM, AYNA delivers 3 personalized outfit recommendations that make you
                feel confident and ready for anything.
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✨</Text>
                  <Text style={styles.featureText}>AI-powered style recommendations</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🌤️</Text>
                  <Text style={styles.featureText}>Weather-aware outfit suggestions</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💫</Text>
                  <Text style={styles.featureText}>Confidence notes that inspire you</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📱</Text>
                  <Text style={styles.featureText}>Daily ritual that builds confidence</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(900).duration(800)}
            style={styles.actionSection}
          >
            <Text style={styles.actionText}>Ready to start your confidence journey?</Text>

            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed,
              ]}
              onPress={onNext}
            >
              <LinearGradient
                colors={[DesignSystem.colors.sage[400], DesignSystem.colors.sage[600]]}
                style={styles.buttonGradient}
              >
                <Text style={styles.continueButtonText}>Begin Your Journey</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Safe StyleSheet create for testing
const createStyles = (styles: Record<string, ViewStyle | TextStyle | ImageStyle>) => {
  try {
    return StyleSheet.create(styles);
  } catch {
    return styles;
  }
};

const styles = createStyles({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: DesignSystem.colors.sage[100],
  },
  content: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: DesignSystem.spacing.xxxl,
    paddingBottom: DesignSystem.spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: DesignSystem.spacing.xxxl,
  },
  heroTitle: {
    ...DesignSystem.typography.heading.h1,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  heroSubtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  descriptionSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: DesignSystem.spacing.xxxl,
  },
  descriptionCard: {
    ...DesignSystem.effects.elevation.subtle,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.xl,
    ...DesignSystem.elevation.medium,
  },
  descriptionTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  descriptionText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.xl,
  },
  featureList: {
    gap: DesignSystem.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: DesignSystem.spacing.md,
    width: 30,
  },
  featureText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
  },
  actionSection: {
    alignItems: 'center',
  },
  actionText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  continueButton: {
    borderRadius: DesignSystem.borderRadius.xl,
    ...DesignSystem.elevation.medium,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    paddingHorizontal: DesignSystem.spacing.xxxl,
    paddingVertical: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.xl,
    alignItems: 'center',
  },
  continueButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.text.inverse,
  },
});
