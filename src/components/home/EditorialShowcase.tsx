/**
 * Editorial Showcase
 *
 * A showcase component demonstrating the Editorial "Weekly Color" section
 * with premium styling and Turkish content.
 */

import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import {
  ColorTheme,
  EditorialColorSection,
  EditorialImage,
} from '@/components/home/EditorialColorSection';
import { WeeklyColorTheme, weeklyColorThemes } from '@/data/weeklyColorThemes';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev } from '@/utils/consoleSuppress';

export const EditorialShowcase: React.FC = () => {
  // Adapt WeeklyColorTheme to ColorTheme shape
  const mapToColorTheme = (w: {
    id: string;
    name: string;
    color: string;
    description: string;
    week: string;
  }): ColorTheme => ({
    id: w.id,
    name: w.name,
    subtitle: w.description,
    primaryColor: w.color,
    secondaryColor: w.color,
    accentColor: w.color,
    gradientColors: [w.color, '#00000000'] as const,
    description: w.description,
    week: w.week,
    heroImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200',
    editorialImages: [],
  });

  const safeWeekly: WeeklyColorTheme = weeklyColorThemes?.[0] ?? {
    id: 'fallback',
    name: 'Fallback',
    color: '#007AFF',
    description: 'Fallback theme',
    mood: 'Neutral',
    week: 'Fallback',
  };
  const [currentTheme] = useState<ColorTheme>(mapToColorTheme(safeWeekly));

  const handleExploreColor = (theme: ColorTheme) => {
    Alert.alert(
      'Rengi Keşfet',
      `${theme.name} temasındaki ürünleri görüntülemek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Keşfet',
          onPress: () => {
            logInDev('Navigate to color theme products:', theme.id);
            // In a real app, this would navigate to a curated product list
            // filtered by the color theme
          },
        },
      ],
    );
  };

  const handleImagePress = (image: EditorialImage, theme: ColorTheme) => {
    Alert.alert(
      'Editorial İçerik',
      `"${image.title}" hakkında daha fazla bilgi almak istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Detaylar',
          onPress: () => {
            logInDev('Navigate to editorial content:', image.id, theme.id);
            // In a real app, this might open:
            // - A detailed article about the styling
            // - A product page if it's a specific item
            // - A gallery with similar items
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
        <EditorialColorSection
          colorTheme={currentTheme}
          onExploreColor={handleExploreColor}
          onImagePress={handleImagePress}
          enableAnimations={true}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
});

export default EditorialShowcase;
