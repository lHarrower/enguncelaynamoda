// Motion & Interaction Refinement Demo
// Showcasing the graceful arc physics and synchronized tab animations

import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import SwipeableCard from '@/components/discovery/SwipeableCard';
import ElegantTabs from '@/components/luxury/ElegantTabs';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev } from '@/utils/consoleSuppress';

const { width, height } = Dimensions.get('window');

// Sample product data for demonstration
const sampleProducts = [
  {
    id: '1',
    title: 'Cashmere Blend Sweater',
    brand: 'Brunello Cucinelli',
    price: 890,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    boutique: 'Madison Avenue',
    category: 'Knitwear',
    colors: ['Beige', 'Navy'],
    style: ['Minimalist', 'Luxury'],
  },
  {
    id: '2',
    title: 'Silk Midi Dress',
    brand: 'The Row',
    price: 1450,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    boutique: 'Bergdorf Goodman',
    category: 'Dresses',
    colors: ['Black', 'Ivory'],
    style: ['Elegant', 'Timeless'],
  },
  {
    id: '3',
    title: 'Leather Ankle Boots',
    brand: 'Saint Laurent',
    price: 995,
    originalPrice: 1295,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    boutique: 'Saks Fifth Avenue',
    category: 'Shoes',
    colors: ['Black', 'Brown'],
    style: ['Edgy', 'Classic'],
  },
];

// Tab content components
const SwipeDemo = () => (
  <View style={styles.demoContainer}>
    <Text style={styles.demoTitle}>Graceful Arc Physics</Text>
    <Text style={styles.demoDescription}>
      Experience the refined swipe interaction with controlled arc trajectory and subtle rotation
    </Text>
    <View style={styles.cardContainer}>
      {sampleProducts[0] && (
        <SwipeableCard
          item={sampleProducts[0]}
          onSwipeLeft={(item) => logInDev('Disliked:', item.title)}
          onSwipeRight={(item) => logInDev('Liked:', item.title)}
          onLongPress={(item) => logInDev('Long pressed:', item.title)}
        />
      )}
    </View>
  </View>
);

const TabDemo = () => (
  <View style={styles.demoContainer}>
    <Text style={styles.demoTitle}>Synchronized Tab Animation</Text>
    <Text style={styles.demoDescription}>
      Notice the perfect 1-to-1 synchronization between content scroll and indicator movement
    </Text>
    <View style={styles.tabDemoContent}>
      <View style={styles.physicsExplanation}>
        <Text style={styles.physicsTitle}>Physics Improvements:</Text>
        <Text style={styles.physicsPoint}>• X-axis primary control</Text>
        <Text style={styles.physicsPoint}>• Y follows inverse parabolic curve</Text>
        <Text style={styles.physicsPoint}>• Rotation capped at 7 degrees</Text>
        <Text style={styles.physicsPoint}>• Physics-based flick with decay</Text>
        <Text style={styles.physicsPoint}>• Synchronized spring animations</Text>
      </View>
    </View>
  </View>
);

const PhysicsDemo = () => (
  <View style={styles.demoContainer}>
    <Text style={styles.demoTitle}>Motion Principles</Text>
    <Text style={styles.demoDescription}>
      The refined physics create a luxury experience through controlled, predictable motion
    </Text>
    <View style={styles.principlesContainer}>
      <View style={styles.principleCard}>
        <Text style={styles.principleTitle}>Graceful Arc</Text>
        <Text style={styles.principleText}>Y = -0.0008 × X²{'\n'}Creates upward trajectory</Text>
      </View>
      <View style={styles.principleCard}>
        <Text style={styles.principleTitle}>Controlled Rotation</Text>
        <Text style={styles.principleText}>Max 7° rotation{'\n'}Eliminates wobbliness</Text>
      </View>
      <View style={styles.principleCard}>
        <Text style={styles.principleTitle}>Physics Flick</Text>
        <Text style={styles.principleText}>Decay animation{'\n'}Natural momentum</Text>
      </View>
    </View>
  </View>
);

const MotionRefinementDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('swipe');

  const tabs = [
    {
      id: 'swipe',
      label: 'Swipe Physics',
      content: <SwipeDemo />,
    },
    {
      id: 'tabs',
      label: 'Tab Sync',
      content: <TabDemo />,
    },
    {
      id: 'physics',
      label: 'Principles',
      content: <PhysicsDemo />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DesignSystem.colors.text.primary} />

      {/* Header */}
      <LinearGradient
        colors={[DesignSystem.colors.text.primary, DesignSystem.colors.text.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Motion Refinement</Text>
        <Text style={styles.headerSubtitle}>Graceful Physics & Perfect Synchronization</Text>
      </LinearGradient>

      {/* Refined ElegantTabs with synchronized motion */}
      <View style={styles.tabsWrapper}>
        <ElegantTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
          showContent={true}
          style={styles.tabs}
          contentStyle={styles.tabContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },

  demoContainer: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },

  demoDescription: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.lg,
  },

  demoTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },

  header: {
    borderBottomColor: DesignSystem.colors.sage[600],
    borderBottomWidth: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xxxl,
  },

  headerSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    opacity: 0.8,
  },

  headerTitle: {
    ...DesignSystem.typography.scale.h1,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },

  physicsExplanation: {
    backgroundColor: DesignSystem.colors.sage[100],
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing.lg,
  },

  physicsPoint: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 22,
    marginBottom: DesignSystem.spacing.sm,
  },

  physicsTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.md,
  },

  principleCard: {
    backgroundColor: DesignSystem.colors.sage[100],
    borderLeftColor: DesignSystem.colors.sage[500],
    borderLeftWidth: 4,
    borderRadius: DesignSystem.radius.md,
    padding: DesignSystem.spacing.lg,
  },

  principleText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 20,
  },

  principleTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },

  principlesContainer: {
    flex: 1,
    gap: DesignSystem.spacing.md,
  },

  tabContent: {
    backgroundColor: DesignSystem.colors.background.secondary,
  },

  tabDemoContent: {
    flex: 1,
    justifyContent: 'center',
  },

  tabs: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderBottomColor: DesignSystem.colors.sage[100],
    borderBottomWidth: 1,
  },

  tabsWrapper: {
    backgroundColor: DesignSystem.colors.background.secondary,
    flex: 1,
  },
});

export default MotionRefinementDemo;
