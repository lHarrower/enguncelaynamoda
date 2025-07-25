import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface NotificationPermissionRequestProps {
  onNext: (permissionGranted: boolean) => void;
  onSkip: () => void;
}

export default function NotificationPermissionRequest({ onNext, onSkip }: NotificationPermissionRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestNotificationPermission = async () => {
    setIsRequesting(true);
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        Alert.alert(
          'Perfect! 🎉',
          'You\'ll receive your daily confidence boost at 6 AM every morning.',
          [{ text: 'Continue', onPress: () => onNext(true) }]
        );
      } else {
        Alert.alert(
          'No Problem',
          'You can still use AYNA Mirror anytime. You can enable notifications later in settings.',
          [{ text: 'Continue', onPress: () => onNext(false) }]
        );
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      Alert.alert(
        'Something went wrong',
        'We couldn\'t set up notifications right now, but you can still use AYNA Mirror.',
        [{ text: 'Continue', onPress: () => onNext(false) }]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[APP_THEME_V2.colors.linen.light, APP_THEME_V2.colors.linen.base]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View 
            entering={FadeInUp.delay(300).duration(800)}
            style={styles.heroSection}
          >
            <View style={styles.iconContainer}>
              <BlurView intensity={20} style={styles.iconBlur}>
                <Ionicons 
                  name="notifications" 
                  size={64} 
                  color={APP_THEME_V2.colors.sageGreen[600]} 
                />
              </BlurView>
            </View>
            
            <Text style={styles.title}>Your Daily Confidence Ritual</Text>
            <Text style={styles.subtitle}>
              Let AYNA wake you up with confidence every morning
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.benefitsSection}
          >
            <BlurView intensity={15} style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Why Daily Notifications?</Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <Ionicons 
                      name="time" 
                      size={24} 
                      color={APP_THEME_V2.colors.sageGreen[600]} 
                    />
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>Perfect Timing</Text>
                    <Text style={styles.benefitDescription}>
                      Get your outfit recommendations at 6 AM, right when you need them most
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <Ionicons 
                      name="heart" 
                      size={24} 
                      color={APP_THEME_V2.colors.liquidGold[600]} 
                    />
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>Build Confidence</Text>
                    <Text style={styles.benefitDescription}>
                      Start every day feeling prepared and confident in your choices
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <Ionicons 
                      name="flash" 
                      size={24} 
                      color={APP_THEME_V2.colors.sageGreen[600]} 
                    />
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>No Decision Fatigue</Text>
                    <Text style={styles.benefitDescription}>
                      Skip the morning stress and jump straight to feeling amazing
                    </Text>
                  </View>
                </View>

                <View style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <Ionicons 
                      name="trending-up" 
                      size={24} 
                      color={APP_THEME_V2.colors.liquidGold[600]} 
                    />
                  </View>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>Continuous Learning</Text>
                    <Text style={styles.benefitDescription}>
                      AYNA gets better at understanding your style with every interaction
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(900).duration(800)}
            style={styles.scheduleSection}
          >
            <BlurView intensity={10} style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>📅 Your Daily Schedule</Text>
              <View style={styles.scheduleTimeline}>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineTime}>6:00 AM</Text>
                  <Text style={styles.timelineEvent}>Receive your 3 outfit recommendations</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineTime}>Morning</Text>
                  <Text style={styles.timelineEvent}>Choose your outfit and feel confident</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineTime}>Later</Text>
                  <Text style={styles.timelineEvent}>Share feedback to improve recommendations</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(1200).duration(800)}
            style={styles.actionSection}
          >
            <Text style={styles.actionText}>
              Ready to transform your mornings?
            </Text>
            
            <View style={styles.actionButtons}>
              <Animated.Pressable
                style={({ pressed }) => [
                  styles.enableButton,
                  pressed && styles.enableButtonPressed
                ]}
                onPress={requestNotificationPermission}
                disabled={isRequesting}
              >
                <LinearGradient
                  colors={[APP_THEME_V2.colors.sageGreen[400], APP_THEME_V2.colors.sageGreen[600]]}
                  style={styles.enableButtonGradient}
                >
                  <Ionicons 
                    name="notifications" 
                    size={20} 
                    color={APP_THEME_V2.semantic.text.inverse}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.enableButtonText}>
                    {isRequesting ? 'Setting up...' : 'Enable Daily Notifications'}
                  </Text>
                </LinearGradient>
              </Animated.Pressable>

              <Animated.Pressable
                style={({ pressed }) => [
                  styles.skipButton,
                  pressed && styles.skipButtonPressed
                ]}
                onPress={onSkip}
              >
                <Text style={styles.skipButtonText}>Maybe Later</Text>
              </Animated.Pressable>
            </View>

            <Text style={styles.disclaimerText}>
              You can change notification settings anytime in your profile
            </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingTop: APP_THEME_V2.spacing.xl,
    paddingBottom: APP_THEME_V2.spacing.xl,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: APP_THEME_V2.spacing.xl,
  },
  iconContainer: {
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  iconBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...APP_THEME_V2.elevation.lift,
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
  benefitsSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: APP_THEME_V2.spacing.xl,
  },
  benefitsCard: {
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.xl,
    ...APP_THEME_V2.elevation.whisper,
  },
  benefitsTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  benefitsList: {
    gap: APP_THEME_V2.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_THEME_V2.colors.whisperWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: APP_THEME_V2.spacing.md,
    ...APP_THEME_V2.elevation.whisper,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.primary,
    fontWeight: '600',
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  benefitDescription: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    lineHeight: 20,
  },
  scheduleSection: {
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  scheduleCard: {
    borderRadius: APP_THEME_V2.radius.md,
    padding: APP_THEME_V2.spacing.lg,
  },
  scheduleTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.md,
  },
  scheduleTimeline: {
    gap: APP_THEME_V2.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: APP_THEME_V2.spacing.xs,
  },
  timelineTime: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.sageGreen[600],
    fontWeight: '600',
    width: 80,
  },
  timelineEvent: {
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
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  actionButtons: {
    width: '100%',
    gap: APP_THEME_V2.spacing.md,
    marginBottom: APP_THEME_V2.spacing.md,
  },
  enableButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
  },
  enableButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  enableButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingVertical: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
  },
  buttonIcon: {
    marginRight: APP_THEME_V2.spacing.sm,
  },
  enableButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.inverse,
  },
  skipButton: {
    paddingVertical: APP_THEME_V2.spacing.md,
    alignItems: 'center',
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.tertiary,
  },
  disclaimerText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.tertiary,
    textAlign: 'center',
    marginTop: APP_THEME_V2.spacing.sm,
  },
});