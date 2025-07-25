import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export default function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[APP_THEME_V2.colors.linen.light, APP_THEME_V2.colors.linen.base]}
        style={styles.gradient}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern} />
        
        {/* Main Content */}
        <View style={styles.content}>
          <Animated.View 
            entering={FadeInUp.delay(300).duration(800)}
            style={styles.heroSection}
          >
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
                Every day at 6 AM, AYNA delivers 3 personalized outfit recommendations 
                that make you feel confident and ready for anything.
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
            <Text style={styles.actionText}>
              Ready to start your confidence journey?
            </Text>
            
            <Animated.Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed
              ]}
              onPress={onNext}
            >
              <LinearGradient
                colors={[APP_THEME_V2.colors.sageGreen[400], APP_THEME_V2.colors.sageGreen[600]]}
                style={styles.buttonGradient}
              >
                <Text style={styles.continueButtonText}>Begin Your Journey</Text>
              </LinearGradient>
            </Animated.Pressable>
          </Animated.View>
        </View>
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
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: APP_THEME_V2.colors.sageGreen[100],
  },
  content: {
    flex: 1,
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    justifyContent: 'space-between',
    paddingTop: APP_THEME_V2.spacing.xxxl,
    paddingBottom: APP_THEME_V2.spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: APP_THEME_V2.spacing.xxxl,
  },
  heroTitle: {
    ...APP_THEME_V2.typography.scale.hero,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  heroSubtitle: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
  },
  descriptionSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: APP_THEME_V2.spacing.xxxl,
  },
  descriptionCard: {
    ...APP_THEME_V2.glassmorphism.subtle,
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.xl,
    ...APP_THEME_V2.elevation.lift,
  },
  descriptionTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  descriptionText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  featureList: {
    gap: APP_THEME_V2.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: APP_THEME_V2.spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: APP_THEME_V2.spacing.md,
    width: 30,
  },
  featureText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    flex: 1,
  },
  actionSection: {
    alignItems: 'center',
  },
  actionText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  continueButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    paddingHorizontal: APP_THEME_V2.spacing.xxxl,
    paddingVertical: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
    alignItems: 'center',
  },
  continueButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.inverse,
  },
});