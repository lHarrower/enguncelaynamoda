/**
 * Experience Showcase
 * 
 * A showcase component demonstrating the cinematic Experience Story Block
 * with Turkish content and premium interactions.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ExperienceStoryBlock, ExperienceStory, StoryItem } from './ExperienceStoryBlock';
import { getFeaturedStory, getAllStories } from '../../data/experienceStories';
import { logInDev } from '../../utils/consoleSuppress';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
  ORIGINAL_BORDER_RADIUS,
} from '../auth/originalLoginStyles';

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
          }
        },
      ]
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
            const nextStoryIndex = allStories.findIndex(s => s.id === story.id) + 1;
            if (nextStoryIndex < allStories.length) {
              setCurrentStory(allStories[nextStoryIndex]);
            }
          }
        },
      ]
    );
  };

  const handleStoryChange = (story: ExperienceStory) => {
    setCurrentStory(story);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Story Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorTitle}>Stil Hikayeleri</Text>
          <Text style={styles.selectorSubtitle}>
            Günün her anında ilham veren hikayeler
          </Text>
          
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
                    backgroundColor: currentStory.id === story.id 
                      ? story.accentColor + '20' 
                      : ORIGINAL_COLORS.inputBackground,
                    borderColor: currentStory.id === story.id 
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
                      color: currentStory.id === story.id 
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
                      color: currentStory.id === story.id 
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
            Bu hikaye, {currentStory.title.toLowerCase()} temasında günün farklı anlarında 
            nasıl şık görünebileceğinizi gösteriyor. Her kart, belirli bir an ve ruh hali 
            için özel olarak seçilmiş kombinasyonları içeriyor.
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
    flex: 1,
    backgroundColor: ORIGINAL_COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  // Story Selector
  selectorSection: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingVertical: 24,
    backgroundColor: ORIGINAL_COLORS.background,
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
    textAlign: 'center',
    marginBottom: 24,
  },

  storySelector: {
    gap: 12,
    paddingHorizontal: 4,
  },

  storyButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 140,
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
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingVertical: 32,
    backgroundColor: ORIGINAL_COLORS.background,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    borderWidth: 1,
    borderColor: ORIGINAL_COLORS.inputBorder,
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: ORIGINAL_COLORS.primaryText,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: ORIGINAL_COLORS.secondaryText,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 40,
  },
});

export default ExperienceShowcase;