import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AynaOutfitCard } from '@/components/sanctuary/AynaOutfitCard';
import { MoodTag, Outfit } from '@/data/sanctuaryModels';
import { SAMPLE_WARDROBE } from '@/data/sanctuarySampleData';
import AynaAIService from '@/services/sanctuaryService';
import { DesignSystem } from '@/theme/DesignSystem';
import { IoniconsName } from '@/types/icons';

import { errorInDev, logInDev } from '../../utils/consoleSuppress';

const MOODS: { tag: MoodTag; icon: IoniconsName; description: string }[] = [
  {
    tag: 'Serene & Grounded',
    icon: 'leaf-outline',
    description: 'Calm, peaceful looks that center your spirit',
  },
  {
    tag: 'Luminous & Confident',
    icon: 'sunny-outline',
    description: 'Radiant outfits that amplify your inner light',
  },
  {
    tag: 'Creative & Inspired',
    icon: 'color-palette-outline',
    description: 'Artistic combinations that spark imagination',
  },
  {
    tag: 'Joyful & Playful',
    icon: 'happy-outline',
    description: 'Fun, spirited looks that celebrate your joy',
  },
  {
    tag: 'Elegant & Refined',
    icon: 'diamond-outline',
    description: 'Sophisticated styles that honor your grace',
  },
  {
    tag: 'Bold & Adventurous',
    icon: 'flash-outline',
    description: 'Fearless outfits that embrace your courage',
  },
];

export const MainRitualScreen: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check if screen reader is enabled for enhanced accessibility (async IIFE to avoid floating promise)
    void (async () => {
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(enabled);
      } catch {}
    })();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled,
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
          `Selected ${mood} mood. Generating outfit suggestions.`,
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
          `Found ${outfits.length} outfit suggestions for ${mood} mood.`,
        );
      }
    } catch (error) {
      errorInDev('Error generating outfits:', String(error));
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
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleWearOutfit = (outfit: Outfit) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Perfect Choice!',
      "Your outfit selection has been noted. You're going to look amazing! ✨",
    );
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', `${outfit.name} has been added to your saved outfits. ✨`);
  };

  const handleFavoriteToggle = (outfit: Outfit) => {
    logInDev('Toggle favorite for:', outfit.id);
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
        <View style={styles.header} accessible={true}>
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
            {'"Where confidence meets artistry, every day"'}
          </Text>
        </View>

        {/* Mood Selection */}
        <View
          style={styles.moodSection}
          accessible={true}
          accessibilityLabel="Mood selection section"
        >
          <Text style={styles.sectionTitle} accessible={true}>
            How do you want to feel today?
          </Text>
          <Text style={styles.sectionSubtitle} accessible={true}>
            Choose a mood to discover outfit combinations from your wardrobe
          </Text>

          <View style={styles.moodGrid} accessible={true} accessibilityLabel="Mood options grid">
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.tag}
                style={[styles.moodCard, selectedMood === mood.tag && styles.selectedMoodCard]}
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
                    name={mood.icon}
                    size={32}
                    color={
                      selectedMood === mood.tag
                        ? DesignSystem.colors.text.inverse
                        : DesignSystem.colors.sage[600]
                    }
                  />
                </View>
                <Text
                  style={[styles.moodText, selectedMood === mood.tag && styles.selectedMoodText]}
                  accessible={false} // Handled by parent TouchableOpacity
                >
                  {mood.tag}
                </Text>
                <Text
                  style={[
                    styles.moodDescription,
                    selectedMood === mood.tag && styles.selectedMoodDescription,
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
            accessibilityValue={{ text: 'Loading' }}
          >
            <Text style={styles.loadingText}>Curating your perfect looks...</Text>
          </View>
        )}

        {/* Generated Outfits */}
        {generatedOutfits.length > 0 && (
          <View
            style={styles.outfitsSection}
            accessible={true}
            accessibilityLabel={`${generatedOutfits.length} outfit suggestions for ${selectedMood} mood`}
          >
            <Text style={styles.sectionTitle} accessible={true}>
              Today&apos;s Whispers
            </Text>
            <Text style={styles.sectionSubtitle} accessible={true}>
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
          <View style={styles.emptyState} accessible={true} accessibilityLabel="Welcome message">
            <View style={styles.emptyIcon}>
              <Ionicons name="sparkles-outline" size={48} color={DesignSystem.colors.gold[400]} />
            </View>
            <Text style={styles.emptyTitle} accessible={true} accessibilityRole="text">
              Ready to discover your style?
            </Text>
            <Text style={styles.emptySubtitle} accessible={true} accessibilityRole="text">
              Select a mood above to see personalized outfit combinations created just for you from
              your own wardrobe.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomSpacer: {
    height: DesignSystem.spacing.xl,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.xl,
    width: 80,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingVertical: DesignSystem.spacing.xxxl,
  },
  emptySubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: DesignSystem.spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: DesignSystem.spacing.xxxl,
  },
  loadingText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  moodCard: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderColor: 'transparent',
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 2,
    padding: DesignSystem.spacing.lg,
    width: '45%',
    ...DesignSystem.elevation.soft,
  },
  moodDescription: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.lg,
    justifyContent: 'center',
  },
  moodIconContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  moodSection: {
    marginBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  moodText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  outfitsSection: {
    marginBottom: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  sectionSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  sectionTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  selectedMoodCard: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderColor: DesignSystem.colors.sage[600],
    ...DesignSystem.elevation.medium,
  },
  selectedMoodDescription: {
    color: DesignSystem.colors.text.inverse,
  },
  selectedMoodText: {
    color: DesignSystem.colors.text.inverse,
  },
  subtitle: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
});
