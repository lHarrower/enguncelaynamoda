/**
 * Experience Showcase
 *
 * A showcase component demonstrating the cinematic Experience Story Block
 * with Turkish content and premium interactions.
 */

import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  ORIGINAL_BORDER_RADIUS,
  ORIGINAL_COLORS,
  ORIGINAL_SPACING,
  ORIGINAL_TYPOGRAPHY,
} from '@/components/auth/originalLoginStyles';
import { getAllStories, getFeaturedStory } from '@/data/experienceStories';
import { logInDev } from '@/utils/consoleSuppress';

import { ExperienceStory, ExperienceStoryBlock, StoryItem } from './ExperienceStoryBlock';

export const ExperienceShowcase: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<ExperienceStory>(getFeaturedStory());
  const [allStories] = useState<ExperienceStory[]>(getAllStories());

  const handleItemPress = (item: StoryItem, story: ExperienceStory) => {
    Alert.alert(
      item.title,
      `"${item.moment}" temasındaki bu stili keşfetmek istiyor musunuz?\n\n${item.description}`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Keşfet',
          onPress: () => {
            logInDev('Navigate to story item:', item.id, story.id);
            // In a real app, this would navigate to:
            // - Product details for the specific look
            // - Shopping page with similar items
            // - Style guide for the moment/occasion
          },
        },
      ],
    );
  };

  const handleStoryComplete = (story: ExperienceStory) => {
    Alert.alert(
      'Hikaye Tamamlandı',
      `"${story.title}" hikayesini tamamladınız! Benzer hikayeleri keşfetmek istiyor musunuz?`,
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Keşfet',
          onPress: () => {
            // Show next story or navigate to story collection
            const nextStoryIndex = allStories.findIndex((s) => s.id === story.id) + 1;
            if (nextStoryIndex < allStories.length) {
              const next = allStories[nextStoryIndex];
              if (next) {
                setCurrentStory(next);
              }
            }
          },
        },
      ],
    );
  };

  const handleStoryChange = (story: ExperienceStory) => {
    setCurrentStory(story);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
        {/* Story Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorTitle}>Stil Hikayeleri</Text>
          <Text style={styles.selectorSubtitle}>Günün her anında ilham veren hikayeler</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storySelector}
          >
            {allStories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={[
                  styles.storyButton,
                  {
                    backgroundColor:
                      currentStory.id === story.id
                        ? story.accentColor + '20'
                        : ORIGINAL_COLORS.inputBackground,
                    borderColor:
                      currentStory.id === story.id
                        ? story.accentColor
                        : ORIGINAL_COLORS.inputBorder,
                  },
                ]}
                onPress={() => handleStoryChange(story)}
              >
                <Text
                  style={[
                    styles.storyButtonText,
                    {
                      color:
                        currentStory.id === story.id
                          ? story.accentColor
                          : ORIGINAL_COLORS.primaryText,
                      fontWeight: currentStory.id === story.id ? '600' : '400',
                    },
                  ]}
                >
                  {story.title}
                </Text>
                <Text
                  style={[
                    styles.storyButtonSubtext,
                    {
                      color:
                        currentStory.id === story.id
                          ? story.accentColor + 'CC'
                          : ORIGINAL_COLORS.secondaryText,
                    },
                  ]}
                >
                  {story.theme}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Experience Story */}
        <ExperienceStoryBlock
          story={currentStory}
          onItemPress={handleItemPress}
          onStoryComplete={handleStoryComplete}
          enableParallax={true}
          enableSnapping={true}
        />

        {/* Story Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Hikaye Hakkında</Text>
          <Text style={styles.infoDescription}>
            Bu hikaye, {currentStory.title.toLowerCase()} temasında günün farklı anlarında nasıl şık
            görünebileceğinizi gösteriyor. Her kart, belirli bir an ve ruh hali için özel olarak
            seçilmiş kombinasyonları içeriyor.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentStory.items.length}</Text>
              <Text style={styles.statLabel}>Farklı An</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentStory.items.reduce((acc, item) => acc + (item.tags?.length || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Stil Etiketi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Ana Renk</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ORIGINAL_COLORS.background,
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  // Story Selector
  selectorSection: {
    backgroundColor: ORIGINAL_COLORS.background,
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingVertical: 24,
  },

  selectorTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },

  selectorSubtitle: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },

  storySelector: {
    gap: 12,
    paddingHorizontal: 4,
  },

  storyButton: {
    alignItems: 'center',
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    borderWidth: 2,
    minWidth: 140,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  storyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },

  storyButtonSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Info Section
  infoSection: {
    backgroundColor: ORIGINAL_COLORS.background,
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingVertical: 32,
  },

  infoTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 20,
    marginBottom: 16,
  },

  infoDescription: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },

  statsContainer: {
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    borderColor: ORIGINAL_COLORS.inputBorder,
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    color: ORIGINAL_COLORS.primaryText,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },

  statLabel: {
    color: ORIGINAL_COLORS.secondaryText,
    fontSize: 14,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 40,
  },
});

export default ExperienceShowcase;
