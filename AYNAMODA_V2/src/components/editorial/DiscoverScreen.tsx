import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { EDITORIAL_THEME } from '../../constants/EditorialTheme';
import { SwipeableCardStack } from './SwipeableCardStack';
import { dailyStylePicks } from '../../data/editorialContent';

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
    backgroundColor: EDITORIAL_THEME.colors.background,
  },
  header: {
    paddingHorizontal: EDITORIAL_THEME.layout.containerPadding,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes['4xl'],
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.text.primary,
    marginBottom: 8,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  instructions: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
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
    backgroundColor: EDITORIAL_THEME.colors.lilac[50],
    borderColor: EDITORIAL_THEME.colors.lilac[200],
  },
  cartHint: {
    backgroundColor: EDITORIAL_THEME.colors.gold[50],
    borderColor: EDITORIAL_THEME.colors.gold[200],
  },
  hintEmoji: {
    fontSize: 20,
  },
  hintText: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.sm,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
  },
});