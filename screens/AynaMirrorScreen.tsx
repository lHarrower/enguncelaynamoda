// AYNA Mirror Screen - Daily Ritual Interface
// Digital Zen Garden aesthetics with glassmorphism and organic design

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { APP_THEME_V2 } from '../constants/AppThemeV2';
import { DailyRecommendations, OutfitRecommendation } from '../types/aynaMirror';
import { AynaMirrorService } from '../services/aynaMirrorService';
import { OutfitRecommendationCard } from '../components/aynaMirror/OutfitRecommendationCard';
import { QuickActionButton } from '../components/aynaMirror/QuickActionButton';
import { ConfidenceNote } from '../components/aynaMirror/ConfidenceNote';

// Animation configurations
const ORGANIC_SPRING = {
  damping: 15,
  stiffness: 100,
  mass: 1,
};

const LIQUID_SPRING = {
  damping: 12,
  stiffness: 120,
  mass: 1,
};

interface AynaMirrorScreenProps {
  userId: string;
}

export const AynaMirrorScreen: React.FC<AynaMirrorScreenProps> = ({ userId }) => {
  const [dailyRecommendations, setDailyRecommendations] = useState<DailyRecommendations | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const backgroundScale = useSharedValue(1.1);

  // Responsive dimensions
  const dimensions = useMemo(() => {
    const isTablet = screenWidth > 768;
    const isLandscape = screenWidth > screenHeight;
    
    return {
      isTablet,
      isLandscape,
      headerHeight: isTablet ? 120 : 100,
      cardSpacing: isTablet ? APP_THEME_V2.spacing.xxl : APP_THEME_V2.spacing.xl,
    };
  }, [screenWidth, screenHeight]);

  // Load daily recommendations on mount
  useEffect(() => {
    loadDailyRecommendations();
  }, [userId]);

  // Entrance animations
  useEffect(() => {
    if (dailyRecommendations) {
      // Staggered entrance animation
      backgroundScale.value = withTiming(1, { duration: 1200 });
      headerOpacity.value = withTiming(1, { duration: 800 });
      contentTranslateY.value = withSpring(0, ORGANIC_SPRING);
    }
  }, [dailyRecommendations]);

  const loadDailyRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const recommendations = await AynaMirrorService.generateDailyRecommendations(userId);
      setDailyRecommendations(recommendations);
      
      // Auto-select first recommendation as default
      if (recommendations.recommendations.length > 0) {
        setSelectedRecommendation(recommendations.recommendations[0]);
      }
    } catch (err) {
      console.error('Failed to load daily recommendations:', err);
      setError('Unable to load your daily recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationSelect = (recommendation: OutfitRecommendation) => {
    // Haptic feedback for selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRecommendation(recommendation);
  };

  const handleQuickAction = async (action: 'wear' | 'save' | 'share', recommendation: OutfitRecommendation) => {
    // Haptic feedback for actions
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      switch (action) {
        case 'wear':
          await handleWearOutfit(recommendation);
          break;
        case 'save':
          await handleSaveOutfit(recommendation);
          break;
        case 'share':
          await handleShareOutfit(recommendation);
          break;
      }
    } catch (error) {
      console.error(`Failed to handle ${action} action:`, error);
      Alert.alert('Error', `Unable to ${action} outfit. Please try again.`);
    }
  };

  const handleWearOutfit = async (recommendation: OutfitRecommendation) => {
    // TODO: Implement wear outfit logic
    // This will log the outfit selection and schedule feedback prompt
    console.log('Wearing outfit:', recommendation.id);
    Alert.alert(
      'Perfect Choice! ✨',
      'Your outfit selection has been logged. We\'ll check in with you later to see how it made you feel!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleSaveOutfit = async (recommendation: OutfitRecommendation) => {
    // TODO: Implement save outfit logic
    console.log('Saving outfit:', recommendation.id);
    Alert.alert(
      'Saved! 💫',
      'This outfit has been added to your favorites for future inspiration.',
      [{ text: 'Perfect', style: 'default' }]
    );
  };

  const handleShareOutfit = async (recommendation: OutfitRecommendation) => {
    // TODO: Implement share outfit logic
    console.log('Sharing outfit:', recommendation.id);
    Alert.alert(
      'Share Your Style! ✨',
      'Sharing feature coming soon - spread the confidence!',
      [{ text: 'Can\'t wait!', style: 'default' }]
    );
  };

  // Animated styles
  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const styles = useMemo(() => createStyles(dimensions), [dimensions]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]}>
          <LinearGradient
            colors={[
              APP_THEME_V2.colors.linen.light,
              APP_THEME_V2.colors.linen.base,
              APP_THEME_V2.colors.cloudGray,
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        <View style={styles.loadingContainer}>
          <BlurView intensity={20} tint="light" style={styles.loadingBlur}>
            <View style={styles.loadingContent}>
              <Text style={styles.loadingText}>Preparing your mirror...</Text>
              <Text style={styles.loadingSubtext}>Curating confidence just for you</Text>
            </View>
          </BlurView>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]}>
          <LinearGradient
            colors={[
              APP_THEME_V2.colors.linen.light,
              APP_THEME_V2.colors.linen.base,
              APP_THEME_V2.colors.cloudGray,
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        <View style={styles.errorContainer}>
          <BlurView intensity={20} tint="light" style={styles.errorBlur}>
            <View style={styles.errorContent}>
              <Ionicons 
                name="refresh-circle-outline" 
                size={48} 
                color={APP_THEME_V2.colors.inkGray[500]} 
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={loadDailyRecommendations}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background with organic gradient */}
      <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]}>
        <LinearGradient
          colors={[
            APP_THEME_V2.colors.linen.light,
            APP_THEME_V2.colors.linen.base,
            APP_THEME_V2.colors.cloudGray,
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Header with glassmorphism */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <BlurView intensity={25} tint="light" style={styles.headerBlur}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.2)',
              'rgba(255, 255, 255, 0.1)',
            ]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.greetingText}>Good morning, Beautiful</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              {dailyRecommendations?.weatherContext && (
                <View style={styles.weatherContainer}>
                  <Ionicons 
                    name="partly-sunny-outline" 
                    size={16} 
                    color={APP_THEME_V2.colors.inkGray[600]} 
                  />
                  <Text style={styles.weatherText}>
                    {Math.round(dailyRecommendations.weatherContext.temperature)}°F, {dailyRecommendations.weatherContext.condition}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Main content */}
      <Animated.View style={[styles.content, animatedContentStyle]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Confidence note for selected recommendation */}
          {selectedRecommendation && (
            <ConfidenceNote 
              note={selectedRecommendation.confidenceNote}
              confidenceScore={selectedRecommendation.confidenceScore}
            />
          )}

          {/* Outfit recommendations */}
          <View style={styles.recommendationsContainer}>
            {dailyRecommendations?.recommendations.map((recommendation, index) => (
              <OutfitRecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                isSelected={selectedRecommendation?.id === recommendation.id}
                onSelect={() => handleRecommendationSelect(recommendation)}
                onQuickAction={(action) => handleQuickAction(action, recommendation)}
                animationDelay={index * 200}
              />
            ))}
          </View>

          {/* Quick actions for selected recommendation */}
          {selectedRecommendation && (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                {selectedRecommendation.quickActions.map((action) => (
                  <QuickActionButton
                    key={action.type}
                    action={action}
                    onPress={() => handleQuickAction(action.type, selectedRecommendation)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// Dynamic styles based on responsive dimensions
const createStyles = (dimensions: { 
  isTablet: boolean; 
  isLandscape: boolean; 
  headerHeight: number;
  cardSpacing: number;
}) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME_V2.colors.linen.base,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    height: dimensions.headerHeight,
    paddingTop: 44, // Status bar height
  },
  headerBlur: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingBottom: APP_THEME_V2.spacing.lg,
  },
  greetingText: {
    ...APP_THEME_V2.typography.scale.h1,
    color: APP_THEME_V2.colors.inkGray[800],
    marginBottom: APP_THEME_V2.spacing.xs,
    fontSize: dimensions.isTablet ? 32 : 28,
  },
  dateText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.colors.inkGray[600],
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.xs,
  },
  weatherText: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[600],
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingTop: APP_THEME_V2.spacing.xl,
    paddingBottom: APP_THEME_V2.spacing.sanctuary,
  },
  recommendationsContainer: {
    gap: dimensions.cardSpacing,
    marginBottom: APP_THEME_V2.spacing.xxl,
  },
  quickActionsContainer: {
    marginTop: APP_THEME_V2.spacing.xl,
  },
  quickActionsTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.colors.inkGray[700],
    marginBottom: APP_THEME_V2.spacing.lg,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: APP_THEME_V2.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_THEME_V2.spacing.xl,
  },
  loadingBlur: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
  },
  loadingContent: {
    padding: APP_THEME_V2.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingText: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.colors.inkGray[700],
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  loadingSubtext: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.colors.inkGray[600],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_THEME_V2.spacing.xl,
  },
  errorBlur: {
    borderRadius: APP_THEME_V2.radius.organic,
    overflow: 'hidden',
  },
  errorContent: {
    padding: APP_THEME_V2.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.colors.inkGray[700],
    textAlign: 'center',
    marginVertical: APP_THEME_V2.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingVertical: APP_THEME_V2.spacing.md,
    backgroundColor: APP_THEME_V2.colors.sageGreen[500],
    borderRadius: APP_THEME_V2.radius.organic,
  },
  retryButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.colors.whisperWhite,
  },
});