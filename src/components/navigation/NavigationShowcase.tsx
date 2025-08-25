/**
 * Navigation Showcase
 *
 * A showcase component demonstrating the floating tab bar
 * with different content sections and scroll behavior.
 */

import React, { useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, View } from 'react-native';

import {
  ORIGINAL_COLORS,
  ORIGINAL_SPACING,
  ORIGINAL_TYPOGRAPHY,
} from '@/components/auth/originalLoginStyles';
import { EditorialShowcase } from '@/components/home/EditorialShowcase';
import { ProductCardShowcase } from '@/components/home/ProductCardShowcase';
import { DEFAULT_TABS, FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { DesignSystem } from '@/theme/DesignSystem';

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
      Alert.alert(content.title, `${content.subtitle} sekmesine geçildi.`, [{ text: 'Tamam' }]);
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
            {/* Sample search results */}
            {[
              'Beyaz Gömlek',
              'Siyah Pantolon',
              'Denim Ceket',
              'Kırmızı Elbise',
              'Spor Ayakkabı',
              'Vintage Tişört',
              'Klasik Blazer',
              'Yün Kazak',
            ].map((item, i) => (
              <View key={i} style={styles.placeholderItem}>
                <Text style={styles.placeholderText}>{item}</Text>
              </View>
            ))}
          </View>
        );

      case 'favorites':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Favorilerim</Text>
            <Text style={styles.sectionDescription}>
              Beğendiğiniz ürünler burada görünecek. Kalp ikonuna tıklayarak ürünleri favorilerinize
              ekleyebilirsiniz.
            </Text>
            {/* Sample favorite items */}
            {[
              'Sevdiğim Denim Ceket',
              'Konforlu Sneaker',
              'Klasik Beyaz Gömlek',
              'Favori Elbisem',
              'Rahat Kazak',
              'Şık Pantolon',
            ].map((item, i) => (
              <View key={i} style={styles.placeholderItem}>
                <Text style={styles.placeholderText}>{item}</Text>
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
            {/* Sample profile settings */}
            {[
              'Hesap Bilgileri',
              'Stil Tercihleri',
              'Bildirim Ayarları',
              'Gizlilik Ayarları',
              'Dil Seçimi',
              'Yardım & Destek',
            ].map((item, i) => (
              <View key={i} style={styles.placeholderItem}>
                <Text style={styles.placeholderText}>{item}</Text>
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
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
  bottomSpacer: {
    height: 120, // Space for floating tab bar
  },

  container: {
    backgroundColor: ORIGINAL_COLORS.background,
    flex: 1,
  },

  contentSection: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
  },

  header: {
    paddingHorizontal: ORIGINAL_SPACING.containerHorizontal,
    paddingTop: 60, // Account for status bar
    paddingBottom: 24,
    alignItems: 'center',
  },

  headerSubtitle: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    textAlign: 'center',
  },

  headerTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },

  placeholderItem: {
    backgroundColor: ORIGINAL_COLORS.inputBackground,
    borderColor: ORIGINAL_COLORS.inputBorder,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    marginBottom: 12,
    padding: 20,
  },

  placeholderText: {
    ...ORIGINAL_TYPOGRAPHY.input,
    textAlign: 'center',
  },

  scrollContent: {
    flexGrow: 1,
  },

  scrollView: {
    flex: 1,
  },

  sectionDescription: {
    ...ORIGINAL_TYPOGRAPHY.subtitle,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },

  sectionTitle: {
    ...ORIGINAL_TYPOGRAPHY.title,
    fontSize: 24,
    marginBottom: 12,
  },

  spacer: {
    height: 40,
  },
});

export default NavigationShowcase;
