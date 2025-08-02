/**
 * Editorial Showcase
 * 
 * A showcase component demonstrating the Editorial "Weekly Color" section
 * with premium styling and Turkish content.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { EditorialColorSection, ColorTheme, EditorialImage } from '@/components/home/EditorialColorSection';
import { getCurrentWeekTheme } from '@/data/weeklyColorThemes';
import { ORIGINAL_COLORS } from '@/components/auth/originalLoginStyles';

export const EditorialShowcase: React.FC = () => {
  const [currentTheme] = useState<ColorTheme>(getCurrentWeekTheme());

  const handleExploreColor = (theme: ColorTheme) => {
    Alert.alert(
      'Rengi Keşfet',
      `${theme.name} temasındaki ürünleri görüntülemek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Keşfet', 
          onPress: () => {
            console.log('Navigate to color theme products:', theme.id);
            // In a real app, this would navigate to a curated product list
            // filtered by the color theme
          }
        },
      ]
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
            console.log('Navigate to editorial content:', image.id, theme.id);
            // In a real app, this might open:
            // - A detailed article about the styling
            // - A product page if it's a specific item
            // - A gallery with similar items
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
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
    flex: 1,
    backgroundColor: ORIGINAL_COLORS.background,
  },
  
  scrollView: {
    flex: 1,
  },
});

export default EditorialShowcase;