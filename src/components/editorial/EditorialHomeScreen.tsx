import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { DesignSystem } from '@/theme/DesignSystem';
import { FloatingNavBar } from '@/components/editorial/FloatingNavBar';
import { WeeklyColorCard } from '@/components/editorial/WeeklyColorCard';
import { StylePickCard } from '@/components/editorial/StylePickCard';
import { EditorialStoryCard } from '@/components/editorial/EditorialStoryCard';
import { DiscoverScreen } from '@/components/editorial/DiscoverScreen';
import { WardrobeScreen } from '@/components/editorial/WardrobeScreen';
import { ProfileScreen } from '@/components/editorial/ProfileScreen';
import {
  weeklyColorStories,
  dailyStylePicks,
  editorialStories,
} from '@/data/editorialContent';

const { width: screenWidth } = Dimensions.get('window');

export const EditorialHomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -20],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverScreen />;
      case 'wardrobe':
        return <WardrobeScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
              <Text style={styles.greeting}>Good Morning</Text>
              <Text style={styles.headerTitle}>Editorial</Text>
              <Text style={styles.headerSubtitle}>
                Curated stories and discoveries for the mindful wardrobe
              </Text>
            </Animated.View>

            {/* Weekly Color Section */}
            <View style={styles.section}>
              {renderSectionHeader('Weekly Color', 'This week\'s color inspiration')}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                decelerationRate="fast"
                snapToInterval={screenWidth * 0.8 + 16}
                snapToAlignment="start"
              >
                {weeklyColorStories.map((story) => (
                  <View key={story.id} style={styles.cardContainer}>
                    <WeeklyColorCard
                      story={story}
                      onPress={() => console.log('Color story pressed:', story.id)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Daily Style Picks Section */}
            <View style={styles.section}>
              {renderSectionHeader('Daily Style Picks', 'Handpicked pieces for today')}
              <View style={styles.verticalCards}>
                {dailyStylePicks.map((pick) => (
                  <View key={pick.id} style={styles.cardContainer}>
                    <StylePickCard
                      pick={pick}
                      onPress={() => console.log('Style pick pressed:', pick.id)}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Editorial Stories Section */}
            <View style={styles.section}>
              {renderSectionHeader('Editorial Stories', 'Thoughtful reads on fashion and style')}
              <View style={styles.verticalCards}>
                {editorialStories.map((story) => (
                  <View key={story.id} style={styles.cardContainer}>
                    <EditorialStoryCard
                      story={story}
                      onPress={() => console.log('Editorial story pressed:', story.id)}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Bottom spacing for floating nav */}
            <View style={styles.bottomSpacing} />
          </Animated.ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {renderContent()}

      <FloatingNavBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 20,
    paddingBottom: DesignSystem.spacing.xl,
  },
  greeting: {
    fontSize: DesignSystem.typography.body.fontSize,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: DesignSystem.typography.h1.fontSize,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    lineHeight: 44,
  },
  headerSubtitle: {
    fontSize: DesignSystem.typography.body.fontSize,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    maxWidth: '80%',
  },
  section: {
    marginBottom: DesignSystem.spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.h2.fontSize,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
    lineHeight: 32,
  },
  sectionSubtitle: {
    fontSize: DesignSystem.typography.body.fontSize,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
  },
  horizontalScroll: {
    paddingLeft: DesignSystem.spacing.lg,
    paddingRight: DesignSystem.spacing.lg,
  },
  verticalCards: {
    alignItems: 'center',
  },
  cardContainer: {
    marginRight: DesignSystem.spacing.md,
  },
  bottomSpacing: {
    height: 100,
  },
});