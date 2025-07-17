import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AynaOutfitCard } from './AynaOutfitCard';
import { LikeButton } from './LikeButton';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { Outfit, MoodTag } from '../../data/sanctuaryModels';
import AynaAIService from '../../services/sanctuaryService';
import { SAMPLE_WARDROBE } from '../../data/sanctuarySampleData';

const MOODS: { tag: MoodTag; icon: string; description: string }[] = [
  { 
    tag: 'Serene & Grounded', 
    icon: 'leaf-outline', 
    description: 'Calm, peaceful looks that center your spirit' 
  },
  { 
    tag: 'Luminous & Confident', 
    icon: 'sunny-outline', 
    description: 'Radiant outfits that amplify your inner light' 
  },
  { 
    tag: 'Creative & Inspired', 
    icon: 'color-palette-outline', 
    description: 'Artistic combinations that spark imagination' 
  },
  { 
    tag: 'Joyful & Playful', 
    icon: 'happy-outline', 
    description: 'Fun, spirited looks that celebrate your joy' 
  },
  { 
    tag: 'Elegant & Refined', 
    icon: 'diamond-outline', 
    description: 'Sophisticated styles that honor your grace' 
  },
  { 
    tag: 'Bold & Adventurous', 
    icon: 'flash-outline', 
    description: 'Fearless outfits that embrace your courage' 
  },
];

export const MainRitualScreen: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check if screen reader is enabled for enhanced accessibility
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  const handleMoodSelect = async (mood: MoodTag) => {
    try {
      setSelectedMood(mood);
      setLoading(true);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Announce mood selection for screen readers
      if (isScreenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility(
          `Selected ${mood} mood. Generating outfit suggestions.`
        );
      }

      // Generate outfits based on mood
      const outfits = [
        AynaAIService.generateOutfit(SAMPLE_WARDROBE, mood),
        AynaAIService.generateOutfit(SAMPLE_WARDROBE, mood),
        AynaAIService.generateOutfit(SAMPLE_WARDROBE, mood),
      ].filter(Boolean) as Outfit[];
      setGeneratedOutfits(outfits);
      
      // Announce completion for screen readers
      if (isScreenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility(
          `Found ${outfits.length} outfit suggestions for ${mood} mood.`
        );
      }
    } catch (error) {
      console.error('Error generating outfits:', error);
      Alert.alert('Error', 'Failed to generate outfit suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOutfitPress = (outfit: Outfit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      outfit.name,
      `"${outfit.whisper}"\n\nThis ${outfit.moodTag.toLowerCase()} look includes ${outfit.items.length} pieces from your wardrobe.\n\nConfidence Score: ${outfit.confidenceScore}/10`,
      [
        { text: 'Wear Today', onPress: () => handleWearOutfit(outfit) },
        { text: 'Save to Favorites', onPress: () => handleSaveOutfit(outfit) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleWearOutfit = (outfit: Outfit) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Perfect Choice!', 'Your outfit selection has been noted. You\'re going to look amazing! ✨');
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', `${outfit.name} has been added to your saved outfits. ✨`);
  };

  const handleFavoriteToggle = (outfit: Outfit) => {
    console.log('Toggle favorite for:', outfit.id);
  };

  return (
    <SafeAreaView 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Main sanctuary screen"
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Sanctuary content"
      >
        {/* Welcome Header */}
        <View 
          style={styles.header}
          accessible={true}
        >
          <Text 
            style={styles.title}
            accessible={true}
            accessibilityLabel="Welcome to your Personal Sanctuary"
          >
            Your Personal Sanctuary
          </Text>
          <Text 
            style={styles.subtitle}
            accessible={true}
            accessibilityLabel="Where confidence meets artistry, every day"
          >
            "Where confidence meets artistry, every day"
          </Text>
        </View>

        {/* Mood Selection */}
        <View 
          style={styles.moodSection}
          accessible={true}
          accessibilityLabel="Mood selection section"
        >
          <Text 
            style={styles.sectionTitle}
            accessible={true}
          >
            How do you want to feel today?
          </Text>
          <Text 
            style={styles.sectionSubtitle}
            accessible={true}
          >
            Choose a mood to discover outfit combinations from your wardrobe
          </Text>

          <View 
            style={styles.moodGrid}
            accessible={true}
            accessibilityLabel="Mood options grid"
          >
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.tag}
                style={[
                  styles.moodCard,
                  selectedMood === mood.tag && styles.selectedMoodCard
                ]}
                onPress={() => handleMoodSelect(mood.tag)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${mood.tag} mood`}
                accessibilityHint={`Double tap to select ${mood.tag} mood. ${mood.description}`}
                accessibilityState={{ selected: selectedMood === mood.tag }}
              >
                <View style={styles.moodIconContainer}>
                  <Ionicons
                    name={mood.icon as any}
                    size={32}
                    color={selectedMood === mood.tag 
                      ? APP_THEME_V2.colors.whisperWhite 
                      : APP_THEME_V2.colors.sageGreen[600]
                    }
                  />
                </View>
                <Text 
                  style={[
                    styles.moodText,
                    selectedMood === mood.tag && styles.selectedMoodText
                  ]}
                  accessible={false} // Handled by parent TouchableOpacity
                >
                  {mood.tag}
                </Text>
                <Text 
                  style={[
                    styles.moodDescription,
                    selectedMood === mood.tag && styles.selectedMoodDescription
                  ]}
                  accessible={false} // Handled by parent TouchableOpacity
                >
                  {mood.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View 
            style={styles.loadingContainer}
            accessible={true}
            accessibilityRole="progressbar"
            accessibilityLabel="Generating outfit suggestions"
            accessibilityValue={{ text: "Loading" }}
          >
            <Text style={styles.loadingText}>
              Curating your perfect looks...
            </Text>
          </View>
        )}

        {/* Generated Outfits */}
        {generatedOutfits.length > 0 && (
          <View 
            style={styles.outfitsSection}
            accessible={true}
            accessibilityLabel={`${generatedOutfits.length} outfit suggestions for ${selectedMood} mood`}
          >
            <Text 
              style={styles.sectionTitle}
              accessible={true}
            >
              Today's Whispers
            </Text>
            <Text 
              style={styles.sectionSubtitle}
              accessible={true}
            >
              AI-curated looks from your personal collection
            </Text>

            {generatedOutfits.map((outfit, index) => (
              <View 
                key={outfit.id}
                accessible={true}
                accessibilityLabel={`Outfit ${index + 1} of ${generatedOutfits.length}: ${outfit.name}`}
              >
                <AynaOutfitCard
                  outfit={outfit}
                  onPress={() => handleOutfitPress(outfit)}
                  onFavorite={() => handleFavoriteToggle(outfit)}
                  showFavoriteButton={true}
                />
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!selectedMood && generatedOutfits.length === 0 && (
          <View 
            style={styles.emptyState}
            accessible={true}
            accessibilityLabel="Welcome message"
          >
            <View style={styles.emptyIcon}>
              <Ionicons 
                name="sparkles-outline" 
                size={48} 
                color={APP_THEME_V2.colors.liquidGold[400]} 
              />
            </View>
            <Text 
              style={styles.emptyTitle}
              accessible={true}
              accessibilityRole="text"
            >
              Ready to discover your style?
            </Text>
            <Text 
              style={styles.emptySubtitle}
              accessible={true}
              accessibilityRole="text"
            >
              Select a mood above to see personalized outfit combinations created just for you from your own wardrobe.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME_V2.colors.linen.base,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: APP_THEME_V2.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...APP_THEME_V2.typography.scale.hero,
    color: APP_THEME_V2.colors.inkGray[800],
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  subtitle: {
    ...APP_THEME_V2.typography.scale.whisper,
    color: APP_THEME_V2.colors.inkGray[600],
    textAlign: 'center',
  },
  moodSection: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    marginBottom: APP_THEME_V2.spacing.xxxl,
  },
  sectionTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.colors.inkGray[800],
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.md,
  },
  sectionSubtitle: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.colors.inkGray[600],
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: APP_THEME_V2.spacing.lg,
    justifyContent: 'center',
  },
  moodCard: {
    width: '45%',
    backgroundColor: APP_THEME_V2.colors.whisperWhite,
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...APP_THEME_V2.elevation.whisper,
  },
  selectedMoodCard: {
    backgroundColor: APP_THEME_V2.colors.sageGreen[500],
    borderColor: APP_THEME_V2.colors.sageGreen[600],
    ...APP_THEME_V2.elevation.lift,
  },
  moodIconContainer: {
    marginBottom: APP_THEME_V2.spacing.md,
  },
  moodText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.colors.inkGray[800],
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  selectedMoodText: {
    color: APP_THEME_V2.colors.whisperWhite,
  },
  moodDescription: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.colors.inkGray[600],
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedMoodDescription: {
    color: APP_THEME_V2.colors.whisperWhite,
  },
  loadingContainer: {
    padding: APP_THEME_V2.spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.colors.inkGray[600],
    textAlign: 'center',
  },
  outfitsSection: {
    paddingHorizontal: APP_THEME_V2.spacing.md,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: APP_THEME_V2.spacing.xxxl,
    paddingHorizontal: APP_THEME_V2.spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_THEME_V2.colors.cloudGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  emptyTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.colors.inkGray[700],
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.md,
  },
  emptySubtitle: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.colors.inkGray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacer: {
    height: APP_THEME_V2.spacing.xl,
  },
}); 