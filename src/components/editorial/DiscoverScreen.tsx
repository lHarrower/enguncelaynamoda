import React from 'react';
import { Alert, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { dailyStylePicks } from '@/data/editorialContent';
import { DesignSystem } from '@/theme/DesignSystem';

import { SwipeableCardStack } from './SwipeableCardStack';

export const DiscoverScreen: React.FC = () => {
  const handleSwipeLeft = (item: { title: string }) => {
    Alert.alert('Saved for Later', `${item.title} has been saved to your wishlist`);
  };

  const handleSwipeRight = (item: { title: string }) => {
    Alert.alert('Added to Cart', `${item.title} has been added to your cart`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Swipe to find your perfect pieces</Text>
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
              <Text style={styles.hintEmoji}>💜</Text>
            </View>
            <Text style={styles.hintText}>Save for Later</Text>
          </View>

          <View style={styles.hintItem}>
            <View style={[styles.hintIcon, styles.cartHint]}>
              <Text style={styles.hintEmoji}>🛍️</Text>
            </View>
            <Text style={styles.hintText}>Add to Cart</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
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
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: 20,
  },
  hintEmoji: {
    fontSize: 20,
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
  instructions: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 40,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  saveHint: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[300],
  },
  subtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
  },
});
