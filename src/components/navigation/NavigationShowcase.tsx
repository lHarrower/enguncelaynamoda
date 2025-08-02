/**
 * Navigation Showcase
 * 
 * A showcase component demonstrating the floating tab bar
 * with different content sections and scroll behavior.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { FloatingTabBar, DEFAULT_TABS, TabItem } from '@/components/navigation/FloatingTabBar';
import { ProductCardShowcase } from '@/components/home/ProductCardShowcase';
import { EditorialShowcase } from '@/components/home/EditorialShowcase';
import {
  ORIGINAL_COLORS,
  ORIGINAL_TYPOGRAPHY,
  ORIGINAL_SPACING,
} from '@/components/auth/originalLoginStyles';

// Sample content for different tabs
const TAB_CONTENT = {
  home: {
    title: 'Anasayfa',
    subtitle: 'Kişisel sığınağınıza hoş geldiniz',
    component: 'home',
  },
  search: {
    title: 'Arama',
    subtitle: 'Stilinizi keşfedin',
    component: 'search',
  },
  favorites: {
    title: 'Favorilerim',
    subtitle: 'Beğendiğiniz ürünler',
    component: 'favorites',
  },
  profile: {
    title: 'Profilim',
    subtitle: 'Hesap ayarları ve tercihler',
    component: 'profile',
  },
};

export const NavigationShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showLabels, setShowLabels] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    
    // Show different alerts based on tab
    const content = TAB_CONTENT[tabId as keyof typeof TAB_CONTENT];
    if (content) {
      Alert.alert(
        content.title,
        `${content.subtitle} sekmesine geçildi.`,
        [{ text: 'Tamam' }]
      );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Bugünün Öne Çıkanları</Text>
            <ProductCardShowcase />
            <View style={styles.spacer} />
            <EditorialShowcase />
          </View>
        );
      
      case 'search':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Arama</Text>
            <Text style={styles.sectionDescription}>
              Burada arama özelliği bulunacak. Ürünleri, markaları ve stilleri arayabileceksiniz.
            </Text>
            {/* Placeholder content */}
            {Array.from({ length: 10 }, (_, i) => (
              <View key={i} style={styles.placeholderItem}>
                <Text style={styles.placeholderText}>Arama Sonucu {i + 1}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'favorites':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Favorilerim</Text>
            <Text style={styles.sectionDescription}>
              Beğendiğiniz ürünler burada görünecek. Kalp ikonuna tıklayarak ürünleri favorilerinize ekleyebilirsiniz.
            </Text>
            {/* Placeholder content */}
            {Array.from({ length: 8 }, (_, i) => (
              <View key={i} style={styles.placeholderItem}>
                <Text style={styles.placeholderText}>Favori Ürün {i + 1}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'profile':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Profilim</Text>
            <Text style={styles.sectionDescription}>
              Hesap bilgileriniz, tercihleriniz ve ayarlarınız burada yer alacak.
            </Text>
            {/* Placeholder content */}
            {Array.from({ length: 6 }, (_, i) => (
              <View key={i} style={styles.placeholderItem}>
                <Text style={styles.placeholderText}>Profil Ayarı {i + 1}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {TAB_CONTENT[activeTab as keyof typeof TAB_CONTENT]?.title || 'AynaModa'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {TAB_CONTENT[activeTab as keyof typeof TAB_CONTENT]?.subtitle || ''}
          </Text>
        </View>

        {/* Content */}
        {renderContent()}

        {/* Bottom Spacer for Tab Bar */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Floating Tab Bar */}
      <FloatingTabBar
        tabs={DEFAULT_TABS}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        showLabels={showLabels}
        hideOnScroll={false} // Set to true to enable hide on scroll
        scrollY={scrollY}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ORIGINAL_COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingTop: 60, // Account for status bar
    paddingBottom: 24,
    alignItems: 'center',
  },

  headerTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },

  headerSubtitle: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    textAlign: 'center',
  },

  contentSection: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
  },

  sectionTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 24,
    marginBottom: 12,
  },

  sectionDescription: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },

  placeholderItem: {
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    borderRadius: ORIGINAL_BORDER_RADIUS.input,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ORIGINAL_COLORS.inputBorder,
  },

  placeholderText: {
    ...ORIGINAL_TYPOGRAPHY.input,
    textAlign: 'center',
  },

  spacer: {
    height: 40,
  },

  bottomSpacer: {
    height: 120, // Space for floating tab bar
  },
});

export default NavigationShowcase;