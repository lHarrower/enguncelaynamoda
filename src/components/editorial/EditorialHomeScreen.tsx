import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { DiscoverScreen } from '@/components/editorial/DiscoverScreen';
import { EditorialStoryCard } from '@/components/editorial/EditorialStoryCard';
import { FloatingNavBar } from '@/components/editorial/FloatingNavBar';
import { ProfileScreen } from '@/components/editorial/ProfileScreen';
import { StylePickCard } from '@/components/editorial/StylePickCard';
import { WardrobeScreen } from '@/components/editorial/WardrobeScreen';
import { WeeklyColorCard } from '@/components/editorial/WeeklyColorCard';
import { dailyStylePicks, editorialStories, weeklyColorStories } from '@/data/editorialContent';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev } from '@/utils/consoleSuppress';

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
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolate.CLAMP);

    const translateY = interpolate(scrollY.value, [0, 100], [0, -20], Extrapolate.CLAMP);

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
              {renderSectionHeader('Weekly Color', "This week's color inspiration")}
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
                      onPress={() => logInDev('Color story pressed:', story.id)}
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
                      onPress={() => logInDev('Style pick pressed:', pick.id)}
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
                      onPress={() => logInDev('Editorial story pressed:', story.id)}
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

      <FloatingNavBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomSpacing: {
    height: 100,
  },
  cardContainer: {
    marginRight: DesignSystem.spacing.md,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  greeting: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.body.medium.fontSize,
    marginBottom: 4,
  },
  header: {
    paddingBottom: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 20,
  },
  headerSubtitle: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.body.medium.fontSize,
    lineHeight: 24,
    maxWidth: '80%',
  },
  headerTitle: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    fontSize: DesignSystem.typography.heading.h1.fontSize,
    lineHeight: 44,
    marginBottom: 8,
  },
  horizontalScroll: {
    paddingLeft: DesignSystem.spacing.lg,
    paddingRight: DesignSystem.spacing.lg,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: DesignSystem.spacing.xxl,
  },
  sectionHeader: {
    marginBottom: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  sectionSubtitle: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: DesignSystem.typography.body.medium.fontSize,
    lineHeight: 22,
  },
  sectionTitle: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    fontSize: DesignSystem.typography.heading.h2.fontSize,
    lineHeight: 32,
    marginBottom: 4,
  },
  verticalCards: {
    alignItems: 'center',
  },
});
