import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev } from '@/utils/consoleSuppress';
import VisionHomeHeader from '@/components/vision/shared/VisionHomeHeader';
import BentoGrid from '@/components/vision/shared/BentoGrid';



interface VisionHomeScreenProps {
  onNavigateToWardrobe?: () => void;
  onNavigateToDiscover?: () => void;
  onNavigateToProfile?: () => void;
}

const VisionHomeScreen: React.FC<VisionHomeScreenProps> = ({
  onNavigateToWardrobe,
  onNavigateToDiscover,
  onNavigateToProfile,
}) => {
  const bentoItems = [
    {
      id: 'inspiration',
      title: "Today's Inspiration",
      subtitle: 'Curated just for you',
      icon: 'sparkles',
  gradient: [DesignSystem.colors.sage[300], DesignSystem.colors.sage[100]],
      size: 'hero' as const,
      onPress: () => logInDev('Today\'s Inspiration pressed'),
    },
    {
      id: 'wardrobe',
      title: 'Quick Style',
      icon: 'flash',
  gradient: [DesignSystem.colors.sage[100], DesignSystem.colors.gold[100]],
      size: 'small' as const,
      onPress: () => onNavigateToWardrobe?.(),
    },
    {
      id: 'discover',
      title: 'Weather Perfect',
      subtitle: '72°F, Sunny',
      icon: 'sunny',
  gradient: [DesignSystem.colors.gold[400], DesignSystem.colors.gold[100]],
      size: 'small' as const,
      onPress: () => onNavigateToDiscover?.(),
    },
    {
      id: 'insights',
      title: 'Wardrobe Insights',
      subtitle: 'Discover hidden gems',
      icon: 'analytics',
  gradient: [DesignSystem.colors.gold[100], DesignSystem.colors.neutral.pearl],
      size: 'medium' as const,
      onPress: () => logInDev('Wardrobe Insights pressed'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          DesignSystem.colors.gold[100],
          DesignSystem.colors.neutral.mist,
        ]}
        style={styles.backgroundGradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <VisionHomeHeader 
            userName="Beautiful"
            onProfilePress={() => onNavigateToProfile?.()}
          />
          <BentoGrid items={bentoItems} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  backgroundGradient: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: DesignSystem.spacing.sanctuary,
  },
});

export default VisionHomeScreen;