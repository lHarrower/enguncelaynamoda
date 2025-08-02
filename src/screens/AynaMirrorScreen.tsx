// AYNA Mirror Screen - Daily Ritual Interface
// Digital Zen Garden aesthetics with glassmorphism and organic design

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DesignSystem } from '@/theme/DesignSystem';
import { DailyRecommendations, OutfitRecommendation } from '@/types/aynaMirror';
import { AynaMirrorService } from '@/services/aynaMirrorService';
import { MirrorHeader } from '@/components/shared/MirrorHeader';
import { RecommendationsList } from '@/components/shared/RecommendationsList';
import { QuickActionsSection } from '@/components/shared/QuickActionsSection';
import { MirrorLoadingState } from '@/components/shared/MirrorLoadingState';
import { MirrorErrorState } from '@/components/shared/MirrorErrorState';
import { ConfidenceNote } from '@/components/aynaMirror/ConfidenceNote';

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

  // Add these helper functions inside the AynaMirrorScreen component

  const logOutfitAsWorn = async (outfit: OutfitRecommendation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Log the outfit as worn in the database
      const { error } = await supabase
        .from('outfit_interactions')
        .insert({
          user_id: user.id,
          outfit_id: outfit.id,
          interaction_type: 'worn',
          interaction_date: new Date().toISOString(),
          confidence_score: outfit.confidence
        });
        
      if (error) throw error;
      
      // Show success message
      Alert.alert(
        "Outfit Logged",
        "We've recorded this outfit as worn today. Your style preferences have been updated!",
        [{ text: "Great!" }]
      );
    } catch (error) {
      console.error('Error logging outfit as worn:', error);
      Alert.alert("Error", "Failed to log outfit as worn. Please try again.");
    }
  };

  const saveOutfitToFavorites = async (outfit: OutfitRecommendation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Save the outfit to favorites in the database
      const { error } = await supabase
        .from('outfit_interactions')
        .insert({
          user_id: user.id,
          outfit_id: outfit.id,
          interaction_type: 'favorite',
          interaction_date: new Date().toISOString(),
          confidence_score: outfit.confidence
        });
        
      if (error) throw error;
      
      // Show success message
      Alert.alert(
        "Outfit Saved",
        "This outfit has been saved to your favorites!",
        [{ text: "Awesome!" }]
      );
    } catch (error) {
      console.error('Error saving outfit to favorites:', error);
      Alert.alert("Error", "Failed to save outfit to favorites. Please try again.");
    }
  };

  const shareOutfit = (outfit: OutfitRecommendation) => {
    // In a real implementation, this would use the Share API
    Alert.alert(
      "Share Outfit",
      "Sharing functionality would open the native share dialog here, allowing you to share this outfit with friends via social media, messaging, etc.",
      [{ text: "Got it" }]
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

  const styles = useMemo(() => createStyles(), []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]}>
          <LinearGradient
            colors={[
              DesignSystem.colors.background.secondary,
              DesignSystem.colors.background.primary,
               DesignSystem.colors.neutral[300],
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        <MirrorLoadingState
          message="Preparing your mirror..."
          subMessage="Curating confidence just for you"
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]}>
          <LinearGradient
            colors={[
              DesignSystem.colors.background.secondary,
              DesignSystem.colors.background.primary,
               DesignSystem.colors.neutral[300],
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        
        <MirrorErrorState
          errorMessage={error}
          onRetry={loadDailyRecommendations}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundGradient, animatedBackgroundStyle]}>
        <LinearGradient
          colors={[
            DesignSystem.colors.background.secondary,
            DesignSystem.colors.background.primary,
             DesignSystem.colors.neutral[300],
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <MirrorHeader
        greetingText="Good morning, Beautiful"
        dateText={new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
        weatherText={dailyRecommendations?.weatherContext ? 
          `${Math.round(dailyRecommendations.weatherContext.temperature)}°F, ${dailyRecommendations.weatherContext.condition}` : 
          undefined
        }
        headerOpacity={headerOpacity}
        dimensions={dimensions}
      />

      {selectedRecommendation && (
        <ConfidenceNote 
          note={selectedRecommendation.confidenceNote}
          confidenceScore={selectedRecommendation.confidenceScore}
        />
      )}

      <RecommendationsList
        recommendations={dailyRecommendations?.recommendations || []}
        selectedRecommendation={selectedRecommendation}
        onRecommendationSelect={handleRecommendationSelect}
        contentTranslateY={contentTranslateY}
        dimensions={dimensions}
      />

      <QuickActionsSection
        selectedRecommendation={selectedRecommendation}
        onQuickAction={handleQuickAction}
      />
    </View>
  );
};

// Dynamic styles based on responsive dimensions
const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});