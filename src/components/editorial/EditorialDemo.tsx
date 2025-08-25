import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { EditorialHomeScreen } from '@/components/editorial/EditorialHomeScreen';
import { SwipeableCardStack } from '@/components/editorial/SwipeableCardStack';
import { DailyStylePick, dailyStylePicks } from '@/data/editorialContent';
import { DesignSystem } from '@/theme/DesignSystem';

type DemoMode = 'home' | 'swipe';

export const EditorialDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState<DemoMode>('home');

  const handleSwipeLeft = (item: DailyStylePick) => {
    Alert.alert('Saved for Later', `${item.title} has been saved to your wishlist!`);
  };

  const handleSwipeRight = (item: DailyStylePick) => {
    Alert.alert('Added to Cart', `${item.title} has been added to your cart!`);
  };

  if (demoMode === 'home') {
    return <EditorialHomeScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setDemoMode('home')}
          accessibilityRole="button"
          accessibilityLabel="Go back to home"
          accessibilityHint="Returns to the editorial home screen"
        >
          <Ionicons name="arrow-back" size={24} color={DesignSystem.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Swipe to Discover</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instructions}>Swipe right to add to cart, left to save for later</Text>

        <SwipeableCardStack
          items={dailyStylePicks}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />

        <View style={styles.actionHints}>
          <View style={styles.hintItem}>
            <View style={[styles.hintIcon, styles.saveHint]}>
              <Ionicons name="bookmark-outline" size={20} color={DesignSystem.colors.sage[600]} />
            </View>
            <Text style={styles.hintText}>Save for Later</Text>
          </View>

          <View style={styles.hintItem}>
            <View style={[styles.hintIcon, styles.cartHint]}>
              <Ionicons name="bag-outline" size={20} color={DesignSystem.colors.gold[600]} />
            </View>
            <Text style={styles.hintText}>Add to Cart</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Demo wrapper component with mode switcher
export const EditorialDemoWrapper: React.FC = () => {
  const [demoMode, setDemoMode] = useState<DemoMode>('home');

  return (
    <View style={styles.wrapper}>
      {demoMode === 'home' ? (
        <View style={styles.homeWrapper}>
          <EditorialHomeScreen />
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setDemoMode('swipe')}
            accessibilityRole="button"
            accessibilityLabel="Switch to swipe mode"
            accessibilityHint="Opens the swipe to discover interface"
          >
            <Ionicons name="swap-horizontal" size={24} color={DesignSystem.colors.text.inverse} />
          </TouchableOpacity>
        </View>
      ) : (
        <EditorialDemo />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingHorizontal: 60,
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  cartHint: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderColor: DesignSystem.colors.gold[300],
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 20,
  },
  floatingButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 100,
    width: 56,
    ...DesignSystem.elevation.medium,
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: 20,
  },
  headerTitle: {
    ...DesignSystem.typography.scale.h1,
    color: DesignSystem.colors.text.primary,
  },
  hintIcon: {
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 2,
    height: 50,
    justifyContent: 'center',
    marginBottom: 8,
    width: 50,
  },
  hintItem: {
    alignItems: 'center',
  },
  hintText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
  homeWrapper: {
    flex: 1,
    position: 'relative',
  },
  instructions: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 40,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  saveHint: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[200],
  },
  wrapper: {
    flex: 1,
  },
});
