import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EDITORIAL_THEME } from '../../constants/EditorialTheme';
import { EditorialHomeScreen } from './EditorialHomeScreen';
import { SwipeableCardStack } from './SwipeableCardStack';
import { dailyStylePicks } from '../../data/editorialContent';

type DemoMode = 'home' | 'swipe';

export const EditorialDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState<DemoMode>('home');

  const handleSwipeLeft = (item: any) => {
    Alert.alert('Saved for Later', `${item.title} has been saved to your wishlist`);
  };

  const handleSwipeRight = (item: any) => {
    Alert.alert('Added to Cart', `${item.title} has been added to your cart`);
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
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={EDITORIAL_THEME.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Swipe to Discover</Text>
        <View style={styles.placeholder} />
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
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={EDITORIAL_THEME.colors.lilac[600]}
              />
            </View>
            <Text style={styles.hintText}>Save for Later</Text>
          </View>
          
          <View style={styles.hintItem}>
            <View style={[styles.hintIcon, styles.cartHint]}>
              <Ionicons
                name="bag-outline"
                size={20}
                color={EDITORIAL_THEME.colors.gold[600]}
              />
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
          >
            <Ionicons
              name="swap-horizontal"
              size={24}
              color={EDITORIAL_THEME.colors.white}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <EditorialDemo />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  homeWrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: EDITORIAL_THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EDITORIAL_THEME.layout.containerPadding,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes.xl,
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.text.primary,
  },
  placeholder: {
    width: 40,
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
  hintText: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.sm,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
  },
  floatingButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: EDITORIAL_THEME.colors.lilac[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...EDITORIAL_THEME.shadows.medium,
    zIndex: 1000,
  },
});