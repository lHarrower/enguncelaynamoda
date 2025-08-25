// AI Naming Demo Page
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { NamingPreferences } from '@/components/naming/NamingPreferences';
import { useAINaming } from '@/hooks/useAINaming';
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem } from '@/types/aynaMirror';
import { errorInDev } from '@/utils/consoleSuppress';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <View style={{ display: value !== index ? 'none' : 'flex' }} {...other}>
      {value === index && <View style={{ padding: DesignSystem.spacing.lg }}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    borderRadius: DesignSystem.borderRadius.md,
  },
  activeTabText: {
    color: DesignSystem.colors.primary[500],
    fontWeight: '600',
  },
  callToActionButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  callToActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  callToActionContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    borderRadius: DesignSystem.borderRadius.lg,
    margin: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.xl,
  },
  callToActionDescription: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  callToActionTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  cardContent: {
    padding: DesignSystem.spacing.md,
  },
  colorChip: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: 2,
  },
  colorChipText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  demoItemCard: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.lg,
    flex: 1,
    marginHorizontal: DesignSystem.spacing.xs,
    ...DesignSystem.elevation.soft,
  },
  demoItemsList: {
    gap: DesignSystem.spacing.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  emptyHistoryText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.error[100],
    borderColor: DesignSystem.colors.error[300],
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    margin: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.md,
  },
  errorText: {
    color: DesignSystem.colors.error[600],
    fontSize: 14,
  },
  featureCard: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    padding: DesignSystem.spacing.lg,
    ...DesignSystem.elevation.soft,
  },
  featureCardTitle: {
    color: DesignSystem.colors.primary[500],
    fontSize: 16,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.md,
  },
  featureContent: {
    alignItems: 'center',
  },
  featureDescription: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  featureIcon: {
    marginBottom: DesignSystem.spacing.md,
  },
  featureList: {
    gap: DesignSystem.spacing.sm,
  },
  featureListItem: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  featureTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.lg,
  },
  featuresGrid: {
    gap: DesignSystem.spacing.md,
  },
  generateButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  generatedNameBox: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    borderColor: DesignSystem.colors.primary[500] + '30',
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    padding: DesignSystem.spacing.sm,
  },
  generatedNameContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  generatedNameLabel: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 12,
    marginBottom: DesignSystem.spacing.xs,
  },
  generatedNameText: {
    color: DesignSystem.colors.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
  },
  historyItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemSubtitle: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 12,
  },
  historyItemTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: DesignSystem.spacing.xs,
  },
  imageContainer: {
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    height: 150,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
  infoAlert: {
    alignItems: 'flex-start',
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    borderColor: DesignSystem.colors.primary[500] + '30',
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.md,
  },
  infoText: {
    color: DesignSystem.colors.text.secondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  itemButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  itemButtonOutlined: {
    backgroundColor: 'transparent',
    borderColor: DesignSystem.colors.primary[500],
    borderWidth: 1,
  },
  itemButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  itemButtonTextOutlined: {
    color: DesignSystem.colors.primary[500],
  },
  itemCategory: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 12,
    marginBottom: DesignSystem.spacing.xs,
  },
  itemInfo: {
    marginBottom: DesignSystem.spacing.md,
  },
  placeholderContainer: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  placeholderText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  separator: {
    backgroundColor: DesignSystem.colors.border.primary,
    height: 1,
    marginHorizontal: DesignSystem.spacing.lg,
  },
  subtitle: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 18,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.md,
  },
  tabContent: {
    padding: DesignSystem.spacing.lg,
  },
  tabDescription: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.lg,
  },
  tabHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.lg,
  },
  tabText: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 14,
  },
  tabTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.sm,
  },
  tabsContainer: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.lg,
    marginHorizontal: DesignSystem.spacing.lg,
    ...DesignSystem.elevation.soft,
  },
  tabsHeader: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    flexDirection: 'row',
  },
  title: {
    color: DesignSystem.colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
  },
});

// Sample wardrobe items for demo
const DEMO_ITEMS: Partial<WardrobeItem>[] = [
  {
    id: 'demo-1',
    imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
    category: 'tops',
    colors: ['White', 'Blue'],
    brand: 'Uniqlo',
    subcategory: 'T-shirt',
  },
  {
    id: 'demo-2',
    imageUri: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop',
    category: 'bottoms',
    colors: ['Blue', 'Indigo'],
    brand: "Levi's",
    subcategory: 'Jeans',
  },
  {
    id: 'demo-3',
    imageUri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
    category: 'shoes',
    colors: ['White', 'Black'],
    brand: 'Nike',
    subcategory: 'Sneakers',
  },
  {
    id: 'demo-4',
    imageUri: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    category: 'dresses',
    colors: ['Black'],
    brand: 'Zara',
    subcategory: 'Evening dress',
  },
];

export default function AINamingDemoPage() {
  const {
    generateName,
    preferences,

    isGenerating,
    error,
  } = useAINaming();

  const [activeTab, setActiveTab] = useState<any>(0);
  const [selectedItem, setSelectedItem] = useState<Partial<WardrobeItem> | null>(null);
  const [generatedNames, setGeneratedNames] = useState<Record<string, string>>({});
  const [showPreferences, setShowPreferences] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateName = async (item: Partial<WardrobeItem>) => {
    if (!item.imageUri) {
      return;
    }

    try {
      const response = await generateName({
        imageUri: item.imageUri,
        category: item.category!,
        colors: item.colors || [],
        brand: item.brand,
        subcategory: item.subcategory,
      });

      if (response?.aiGeneratedName) {
        setGeneratedNames((prev) => ({
          ...prev,
          [item.id!]: response.aiGeneratedName,
        }));
      }
    } catch (err) {
      errorInDev('Failed to generate name:', err instanceof Error ? err : String(err));
    }
  };

  const handleBulkGenerate = async () => {
    for (const item of DEMO_ITEMS) {
      await handleGenerateName(item);
      // Add small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 0 ? (
        <FlatList
          data={DEMO_ITEMS}
          numColumns={2}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <View style={styles.demoItemCard}>
              <View style={styles.imageContainer}>
                {/* Note: In React Native, we'd use Image component with source prop */}
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image" size={40} color={DesignSystem.colors.text.secondary} />
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCategory}>
                    {item.category} • {item.brand}
                  </Text>
                  <View style={styles.colorsContainer}>
                    {item.colors?.map((color, index) => (
                      <View key={index} style={styles.colorChip}>
                        <Text style={styles.colorChipText}>{color}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {generatedNames[item.id!] ? (
                  <View style={styles.generatedNameContainer}>
                    <Text style={styles.generatedNameLabel}>AI Generated Name:</Text>
                    <View style={styles.generatedNameBox}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={DesignSystem.colors.primary['500']}
                      />
                      <Text style={styles.generatedNameText}>{generatedNames[item.id!]}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>Click to generate AI name</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.itemButton, generatedNames[item.id!] && styles.itemButtonOutlined]}
                  onPress={() => handleGenerateName(item)}
                  disabled={isGenerating}
                >
                  <Ionicons
                    name={generatedNames[item.id!] ? 'refresh' : 'sparkles'}
                    size={16}
                    color={generatedNames[item.id!] ? DesignSystem.colors.primary['500'] : 'white'}
                  />
                  <Text
                    style={[
                      styles.itemButtonText,
                      generatedNames[item.id!] && styles.itemButtonTextOutlined,
                    ]}
                  >
                    {generatedNames[item.id!] ? 'Regenerate' : 'Generate Name'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.demoItemsList}
          ListHeaderComponent={() => (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>AI-Powered Wardrobe Naming</Text>
                <Text style={styles.subtitle}>
                  Automatically generate intelligent names for your wardrobe items using AI
                </Text>

                <View style={styles.infoAlert}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={DesignSystem.colors.primary['500']}
                  />
                  <Text style={styles.infoText}>
                    This demo showcases the AI naming system that analyzes wardrobe item images and
                    generates contextual names based on visual features, colors, brands, and user
                    preferences.
                  </Text>
                </View>
              </View>

              {/* Feature Overview */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Ionicons
                      name="sparkles"
                      size={48}
                      color={DesignSystem.colors.primary['500']}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureTitle}>Smart Analysis</Text>
                    <Text style={styles.featureDescription}>
                      AI analyzes images to detect colors, patterns, styles, and visual features
                    </Text>
                  </View>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Ionicons
                      name="settings"
                      size={48}
                      color={DesignSystem.colors.primary['500']}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureTitle}>Customizable Styles</Text>
                    <Text style={styles.featureDescription}>
                      Choose from different naming styles: descriptive, creative, minimal, or
                      brand-focused
                    </Text>
                  </View>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Ionicons
                      name="time"
                      size={48}
                      color={DesignSystem.colors.primary['500']}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureTitle}>Manual Override</Text>
                    <Text style={styles.featureDescription}>
                      Always maintain control with the ability to override AI suggestions with
                      custom names
                    </Text>
                  </View>
                </View>
              </View>

              {/* Demo Tabs Header + Live Demo controls */}
              <View style={styles.tabsContainer}>
                <View style={styles.tabsHeader}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 0 && styles.activeTab]}
                    onPress={() => setActiveTab(0)}
                  >
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={
                        activeTab === 0
                          ? DesignSystem.colors.primary['500']
                          : DesignSystem.colors.text.secondary
                      }
                    />
                    <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
                      Live Demo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 1 && styles.activeTab]}
                    onPress={() => setActiveTab(1)}
                  >
                    <Ionicons
                      name="settings"
                      size={20}
                      color={
                        activeTab === 1
                          ? DesignSystem.colors.primary['500']
                          : DesignSystem.colors.text.secondary
                      }
                    />
                    <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
                      Preferences
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 2 && styles.activeTab]}
                    onPress={() => setActiveTab(2)}
                  >
                    <Ionicons
                      name="time"
                      size={20}
                      color={
                        activeTab === 2
                          ? DesignSystem.colors.primary['500']
                          : DesignSystem.colors.text.secondary
                      }
                    />
                    <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>
                      History
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 3 && styles.activeTab]}
                    onPress={() => setActiveTab(3)}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={
                        activeTab === 3
                          ? DesignSystem.colors.primary['500']
                          : DesignSystem.colors.text.secondary
                      }
                    />
                    <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>
                      Features
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Live Demo Tab header (controls) */}
                <View style={styles.tabContent}>
                  <View style={styles.tabHeader}>
                    <Text style={styles.tabTitle}>Try AI Naming on Sample Items</Text>
                    <TouchableOpacity
                      style={[styles.generateButton, isGenerating && styles.disabledButton]}
                      onPress={handleBulkGenerate}
                      disabled={isGenerating}
                    >
                      <Ionicons name="sparkles" size={20} color="white" />
                      <Text style={styles.generateButtonText}>
                        {isGenerating ? 'Generating...' : 'Generate All Names'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
          ListFooterComponent={() => (
            <>
              {/* Call to Action */}
              <View style={styles.callToActionContainer}>
                <Ionicons name="bulb" size={48} color={DesignSystem.colors.primary['500']} />
                <Text style={styles.callToActionTitle}>
                  Ready to organize your wardrobe with AI?
                </Text>
                <Text style={styles.callToActionDescription}>
                  Start using AI-powered naming to automatically organize and categorize your
                  clothing items.
                </Text>
                <TouchableOpacity style={styles.callToActionButton}>
                  <Ionicons name="sparkles" size={20} color="white" />
                  <Text style={styles.callToActionButtonText}>Go to My Wardrobe</Text>
                </TouchableOpacity>
              </View>

              {/* Error Display */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={DesignSystem.colors.error['600']}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </>
          )}
        />
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI-Powered Wardrobe Naming</Text>
            <Text style={styles.subtitle}>
              Automatically generate intelligent names for your wardrobe items using AI
            </Text>

            <View style={styles.infoAlert}>
              <Ionicons
                name="information-circle"
                size={20}
                color={DesignSystem.colors.primary['500']}
              />
              <Text style={styles.infoText}>
                This demo showcases the AI naming system that analyzes wardrobe item images and
                generates contextual names based on visual features, colors, brands, and user
                preferences.
              </Text>
            </View>
          </View>

          {/* Feature Overview */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Ionicons
                  name="sparkles"
                  size={48}
                  color={DesignSystem.colors.primary['500']}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureTitle}>Smart Analysis</Text>
                <Text style={styles.featureDescription}>
                  AI analyzes images to detect colors, patterns, styles, and visual features
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Ionicons
                  name="settings"
                  size={48}
                  color={DesignSystem.colors.primary['500']}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureTitle}>Customizable Styles</Text>
                <Text style={styles.featureDescription}>
                  Choose from different naming styles: descriptive, creative, minimal, or
                  brand-focused
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Ionicons
                  name="time"
                  size={48}
                  color={DesignSystem.colors.primary['500']}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureTitle}>Manual Override</Text>
                <Text style={styles.featureDescription}>
                  Always maintain control with the ability to override AI suggestions with custom
                  names
                </Text>
              </View>
            </View>
          </View>

          {/* Demo Tabs */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabsHeader}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 0 && styles.activeTab]}
                onPress={() => setActiveTab(0)}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={
                    activeTab === 0
                      ? DesignSystem.colors.primary['500']
                      : DesignSystem.colors.text.secondary
                  }
                />
                <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
                  Live Demo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 1 && styles.activeTab]}
                onPress={() => setActiveTab(1)}
              >
                <Ionicons
                  name="settings"
                  size={20}
                  color={
                    activeTab === 1
                      ? DesignSystem.colors.primary['500']
                      : DesignSystem.colors.text.secondary
                  }
                />
                <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
                  Preferences
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 2 && styles.activeTab]}
                onPress={() => setActiveTab(2)}
              >
                <Ionicons
                  name="time"
                  size={20}
                  color={
                    activeTab === 2
                      ? DesignSystem.colors.primary['500']
                      : DesignSystem.colors.text.secondary
                  }
                />
                <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>
                  History
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 3 && styles.activeTab]}
                onPress={() => setActiveTab(3)}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={
                    activeTab === 3
                      ? DesignSystem.colors.primary['500']
                      : DesignSystem.colors.text.secondary
                  }
                />
                <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>
                  Features
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preferences Tab */}
            {activeTab === 1 && (
              <View style={styles.tabContent}>
                <Text style={styles.tabTitle}>Naming Preferences</Text>
                <Text style={styles.tabDescription}>
                  Customize how AI generates names for your wardrobe items.
                </Text>

                <NamingPreferences />
              </View>
            )}

            {/* History Tab */}
            {activeTab === 2 && (
              <View style={styles.tabContent}>
                <Text style={styles.tabTitle}>Naming History</Text>
                <Text style={styles.tabDescription}>
                  Track all naming changes and AI suggestions.
                </Text>

                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>Naming history feature coming soon!</Text>
                </View>
              </View>
            )}

            {/* Features Tab */}
            {activeTab === 3 && (
              <View style={styles.tabContent}>
                <Text style={styles.tabTitle}>AI Naming Features</Text>

                <View style={styles.featuresGrid}>
                  <View style={styles.featureCard}>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureCardTitle}>🎨 Visual Analysis</Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureListItem}>• Color detection and naming</Text>
                        <Text style={styles.featureListItem}>
                          • Pattern recognition (stripes, dots, etc.)
                        </Text>
                        <Text style={styles.featureListItem}>
                          • Texture analysis (smooth, textured, etc.)
                        </Text>
                        <Text style={styles.featureListItem}>
                          • Style classification (casual, formal, etc.)
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.featureCard}>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureCardTitle}>🏷️ Smart Naming</Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureListItem}>• Context-aware suggestions</Text>
                        <Text style={styles.featureListItem}>• Brand and category integration</Text>
                        <Text style={styles.featureListItem}>• Multiple naming style options</Text>
                        <Text style={styles.featureListItem}>• Confidence scoring</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.featureCard}>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureCardTitle}>⚙️ Customization</Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureListItem}>
                          • Personalized naming preferences
                        </Text>
                        <Text style={styles.featureListItem}>• Manual override capability</Text>
                        <Text style={styles.featureListItem}>• Bulk naming operations</Text>
                        <Text style={styles.featureListItem}>• Naming history tracking</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.featureCard}>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureCardTitle}>🔄 Integration</Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureListItem}>• Seamless wardrobe integration</Text>
                        <Text style={styles.featureListItem}>• Real-time name generation</Text>
                        <Text style={styles.featureListItem}>• Search and filter by AI names</Text>
                        <Text style={styles.featureListItem}>• Export and backup support</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Call to Action */}
          <View style={styles.callToActionContainer}>
            <Ionicons name="bulb" size={48} color={DesignSystem.colors.primary['500']} />
            <Text style={styles.callToActionTitle}>Ready to organize your wardrobe with AI?</Text>
            <Text style={styles.callToActionDescription}>
              Start using AI-powered naming to automatically organize and categorize your clothing
              items.
            </Text>
            <TouchableOpacity style={styles.callToActionButton}>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.callToActionButtonText}>Go to My Wardrobe</Text>
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={DesignSystem.colors.error['600']} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
