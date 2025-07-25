// Motion & Interaction Refinement Demo
// Showcasing the graceful arc physics and synchronized tab animations

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeableCard from '../discovery/SwipeableCard';
import ElegantTabs from '../luxury/ElegantTabs';
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import { LuxuryMaterials, LuxuryTypography, LuxurySpacing } from '../../theme/AppThemeV2';

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
      <SwipeableCard
        item={sampleProducts[0]}
        onSwipeLeft={(item) => console.log('Disliked:', item.title)}
        onSwipeRight={(item) => console.log('Liked:', item.title)}
        onLongPress={(item) => console.log('Long pressed:', item.title)}
      />
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
        <Text style={styles.principleText}>
          Y = -0.0008 × X²{'\n'}Creates upward trajectory
        </Text>
      </View>
      <View style={styles.principleCard}>
        <Text style={styles.principleTitle}>Controlled Rotation</Text>
        <Text style={styles.principleText}>
          Max 7° rotation{'\n'}Eliminates wobbliness
        </Text>
      </View>
      <View style={styles.principleCard}>
        <Text style={styles.principleTitle}>Physics Flick</Text>
        <Text style={styles.principleText}>
          Decay animation{'\n'}Natural momentum
        </Text>
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
      <StatusBar barStyle="light-content" backgroundColor={ULTRA_PREMIUM_THEME.colors.obsidian[900]} />
      
      {/* Header */}
      <LinearGradient
        colors={[
          ULTRA_PREMIUM_THEME.colors.obsidian[900],
          ULTRA_PREMIUM_THEME.colors.obsidian[800],
        ]}
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
  container: {
    flex: 1,
    backgroundColor: ULTRA_PREMIUM_THEME.colors.obsidian[900],
  },
  
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: ULTRA_PREMIUM_THEME.colors.obsidian[700],
  },
  
  headerTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h1,
    color: ULTRA_PREMIUM_THEME.colors.champagne[400],
    marginBottom: 8,
  },
  
  headerSubtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body2,
    color: ULTRA_PREMIUM_THEME.colors.champagne[600],
    opacity: 0.8,
  },
  
  tabsWrapper: {
    flex: 1,
    backgroundColor: LuxuryMaterials.colors.whisperWhite,
  },
  
  tabs: {
    backgroundColor: LuxuryMaterials.colors.whisperWhite,
    borderBottomWidth: 1,
    borderBottomColor: LuxuryMaterials.colors.lightGray,
  },
  
  tabContent: {
    backgroundColor: LuxuryMaterials.colors.whisperWhite,
  },
  
  demoContainer: {
    flex: 1,
    padding: LuxurySpacing.lg,
  },
  
  demoTitle: {
    ...LuxuryTypography.h2,
    color: LuxuryMaterials.colors.inkGray,
    marginBottom: LuxurySpacing.sm,
  },
  
  demoDescription: {
    ...LuxuryTypography.body,
    color: LuxuryMaterials.colors.charcoal,
    marginBottom: LuxurySpacing.lg,
    lineHeight: 24,
  },
  
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  
  tabDemoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  physicsExplanation: {
    backgroundColor: LuxuryMaterials.colors.lightGray,
    borderRadius: 16,
    padding: LuxurySpacing.lg,
  },
  
  physicsTitle: {
    ...LuxuryTypography.h3,
    color: LuxuryMaterials.colors.inkGray,
    marginBottom: LuxurySpacing.md,
  },
  
  physicsPoint: {
    ...LuxuryTypography.body,
    color: LuxuryMaterials.colors.charcoal,
    marginBottom: LuxurySpacing.sm,
    lineHeight: 22,
  },
  
  principlesContainer: {
    flex: 1,
    gap: LuxurySpacing.md,
  },
  
  principleCard: {
    backgroundColor: LuxuryMaterials.colors.lightGray,
    borderRadius: 12,
    padding: LuxurySpacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: LuxuryMaterials.colors.liquidGold,
  },
  
  principleTitle: {
    ...LuxuryTypography.h4,
    color: LuxuryMaterials.colors.inkGray,
    marginBottom: LuxurySpacing.sm,
  },
  
  principleText: {
    ...LuxuryTypography.body,
    color: LuxuryMaterials.colors.charcoal,
    lineHeight: 20,
  },
});

export default MotionRefinementDemo;