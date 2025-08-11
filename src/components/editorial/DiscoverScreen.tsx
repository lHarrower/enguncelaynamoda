import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { DesignSystem } from '@/theme/DesignSystem';
import { SwipeableCardStack } from './SwipeableCardStack';
import { dailyStylePicks } from '@/data/editorialContent';

export const DiscoverScreen: React.FC = () => {
  const handleSwipeLeft = (item: any) => {
    Alert.alert('Saved for Later', `${item.title} has been saved to your wishlist`);
  };

  const handleSwipeRight = (item: any) => {
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
        <Text style={styles.instructions}>
          Swipe right to add to cart, left to save for later
        </Text>
        
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
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  header: {
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  instructions: {
  ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  actionHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 60,
    marginTop: 40,
  },
  hintItem: {
    alignItems: 'center',
  },
  hintIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  saveHint: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[300],
  },
  cartHint: {
    backgroundColor: DesignSystem.colors.gold[100],
    borderColor: DesignSystem.colors.gold[300],
  },
  hintEmoji: {
    fontSize: 20,
  },
  hintText: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
  },
});