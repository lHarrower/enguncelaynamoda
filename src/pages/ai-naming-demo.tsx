// AI Naming Demo Page
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { AINameGenerator } from '@/components/naming/AINameGenerator';
import { NamingPreferences } from '@/components/naming/NamingPreferences';
import { useAINaming } from '@/hooks/useAINaming';
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
    <View
      style={{ display: value !== index ? 'none' : 'flex' }}
      {...other}
    >
      {value === index && (
        <View style={{ padding: DesignSystem.spacing.lg }}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: DesignSystem.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[500] + '30',
    alignItems: 'flex-start',
    gap: DesignSystem.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 20,
  },
  featuresContainer: {
    padding: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.md,
  },
  featureCard: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
    ...DesignSystem.elevation.soft,
  },
  featureContent: {
    alignItems: 'center',
  },
  featureIcon: {
    marginBottom: DesignSystem.spacing.md,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  tabsContainer: {
    backgroundColor: DesignSystem.colors.background.elevated,
    marginHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    ...DesignSystem.elevation.soft,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.xs,
  },
  activeTab: {
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    borderRadius: DesignSystem.borderRadius.md,
  },
  tabText: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
  },
  activeTabText: {
    color: DesignSystem.colors.primary[500],
    fontWeight: '600',
  },
  tabContent: {
    padding: DesignSystem.spacing.lg,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  tabDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.lg,
    lineHeight: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  demoItemsList: {
    gap: DesignSystem.spacing.md,
  },
  demoItemCard: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: DesignSystem.borderRadius.lg,
    marginHorizontal: DesignSystem.spacing.xs,
    ...DesignSystem.elevation.soft,
  },
  imageContainer: {
    height: 150,
    borderTopLeftRadius: DesignSystem.borderRadius.lg,
    borderTopRightRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: DesignSystem.spacing.md,
  },
  itemInfo: {
    marginBottom: DesignSystem.spacing.md,
  },
  itemCategory: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.xs,
  },
  colorChip: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.primary,
    borderRadius: DesignSystem.borderRadius.sm,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: 2,
  },
  colorChipText: {
    fontSize: 10,
    color: DesignSystem.colors.text.secondary,
  },
  generatedNameContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  generatedNameLabel: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  generatedNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[500] + '30',
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.xs,
  },
  generatedNameText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
  },
  placeholderContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  placeholderText: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
  },
  itemButtonOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[500],
  },
  itemButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  itemButtonTextOutlined: {
    color: DesignSystem.colors.primary[500],
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.md,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  historyItemSubtitle: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: DesignSystem.colors.border.primary,
    marginHorizontal: DesignSystem.spacing.lg,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.md,
    lineHeight: 20,
  },
  featuresGrid: {
    gap: DesignSystem.spacing.md,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.primary[500],
    marginBottom: DesignSystem.spacing.md,
  },
  featureList: {
    gap: DesignSystem.spacing.sm,
  },
  featureListItem: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 20,
  },
  callToActionContainer: {
    backgroundColor: DesignSystem.colors.primary[500] + '10',
    margin: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.xl,
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: 'center',
  },
  callToActionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
  },
  callToActionDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.lg,
  },
  callToActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary[500],
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.sm,
  },
  callToActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.error[100],
    borderWidth: 1,
    borderColor: DesignSystem.colors.error[300],
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.md,
    margin: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: DesignSystem.colors.error[600],
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
    subcategory: 'T-shirt'
  },
  {
    id: 'demo-2',
    imageUri: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop',
    category: 'bottoms',
    colors: ['Blue', 'Indigo'],
    brand: 'Levi\'s',
    subcategory: 'Jeans'
  },
  {
    id: 'demo-3',
    imageUri: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop',
    category: 'shoes',
    colors: ['White', 'Black'],
    brand: 'Nike',
    subcategory: 'Sneakers'
  },
  {
    id: 'demo-4',
    imageUri: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
    category: 'dresses',
    colors: ['Black'],
    brand: 'Zara',
    subcategory: 'Evening dress'
  }
];

export default function AINamingDemoPage() {
  const { 
    generateName, 
    preferences, 
 
    isGenerating, 
    error 
  } = useAINaming();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Partial<WardrobeItem> | null>(null);
  const [generatedNames, setGeneratedNames] = useState<Record<string, string>>({});
  const [showPreferences, setShowPreferences] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateName = async (item: Partial<WardrobeItem>) => {
    if (!item.imageUri) return;
    
    try {
      const response = await generateName({
        imageUri: item.imageUri,
        category: item.category!,
        colors: item.colors || [],
        brand: item.brand,
        subcategory: item.subcategory
      });
      
      if (response?.aiGeneratedName) {
        setGeneratedNames(prev => ({
          ...prev,
          [item.id!]: response.aiGeneratedName
        }));
      }
    } catch (err) {
      errorInDev('Failed to generate name:', err);
    }
  };

  const handleBulkGenerate = async () => {
    for (const item of DEMO_ITEMS) {
      await handleGenerateName(item);
      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            AI-Powered Wardrobe Naming
          </Text>
          <Text style={styles.subtitle}>
            Automatically generate intelligent names for your wardrobe items using AI
          </Text>
          
          <View style={styles.infoAlert}>
            <Ionicons name="information-circle" size={20} color={DesignSystem.colors.primary[500]} />
            <Text style={styles.infoText}>
              This demo showcases the AI naming system that analyzes wardrobe item images and generates 
              contextual names based on visual features, colors, brands, and user preferences.
            </Text>
          </View>
        </View>

        {/* Feature Overview */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Ionicons name="sparkles" size={48} color={DesignSystem.colors.primary[500]} style={styles.featureIcon} />
              <Text style={styles.featureTitle}>
                Smart Analysis
              </Text>
              <Text style={styles.featureDescription}>
                AI analyzes images to detect colors, patterns, styles, and visual features
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Ionicons name="settings" size={48} color={DesignSystem.colors.primary[500]} style={styles.featureIcon} />
              <Text style={styles.featureTitle}>
                Customizable Styles
              </Text>
              <Text style={styles.featureDescription}>
                Choose from different naming styles: descriptive, creative, minimal, or brand-focused
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <Ionicons name="time" size={48} color={DesignSystem.colors.primary[500]} style={styles.featureIcon} />
              <Text style={styles.featureTitle}>
                Manual Override
              </Text>
              <Text style={styles.featureDescription}>
                Always maintain control with the ability to override AI suggestions with custom names
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
              <Ionicons name="sparkles" size={20} color={activeTab === 0 ? DesignSystem.colors.primary[500] : DesignSystem.colors.text.secondary} />
              <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Live Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 1 && styles.activeTab]}
              onPress={() => setActiveTab(1)}
            >
              <Ionicons name="settings" size={20} color={activeTab === 1 ? DesignSystem.colors.primary[500] : DesignSystem.colors.text.secondary} />
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 2 && styles.activeTab]}
              onPress={() => setActiveTab(2)}
            >
              <Ionicons name="time" size={20} color={activeTab === 2 ? DesignSystem.colors.primary[500] : DesignSystem.colors.text.secondary} />
              <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 3 && styles.activeTab]}
              onPress={() => setActiveTab(3)}
            >
              <Ionicons name="information-circle" size={20} color={activeTab === 3 ? DesignSystem.colors.primary[500] : DesignSystem.colors.text.secondary} />
              <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>Features</Text>
            </TouchableOpacity>
          </View>

          {/* Live Demo Tab */}
          {activeTab === 0 && (
            <View style={styles.tabContent}>
              <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>
                  Try AI Naming on Sample Items
                </Text>
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
                          <Text style={styles.generatedNameLabel}>
                            AI Generated Name:
                          </Text>
                          <View style={styles.generatedNameBox}>
                            <Ionicons name="checkmark-circle" size={16} color={DesignSystem.colors.primary[500]} />
                            <Text style={styles.generatedNameText}>
                              {generatedNames[item.id!]}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.placeholderContainer}>
                          <Text style={styles.placeholderText}>
                            Click to generate AI name
                          </Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={[styles.itemButton, generatedNames[item.id!] && styles.itemButtonOutlined]}
                        onPress={() => handleGenerateName(item)}
                        disabled={isGenerating}
                      >
                        <Ionicons 
                          name={generatedNames[item.id!] ? "refresh" : "sparkles"} 
                          size={16} 
                          color={generatedNames[item.id!] ? DesignSystem.colors.primary[500] : "white"} 
                        />
                        <Text style={[styles.itemButtonText, generatedNames[item.id!] && styles.itemButtonTextOutlined]}>
                          {generatedNames[item.id!] ? 'Regenerate' : 'Generate Name'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.demoItemsList}
              />
            </View>
          )}

          {/* Preferences Tab */}
          {activeTab === 1 && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>
                Naming Preferences
              </Text>
              <Text style={styles.tabDescription}>
                Customize how AI generates names for your wardrobe items.
              </Text>
              
              <NamingPreferences />
            </View>
          )}

          {/* History Tab */}
          {activeTab === 2 && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>
                Naming History
              </Text>
              <Text style={styles.tabDescription}>
                Track all naming changes and AI suggestions.
              </Text>
              
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                  Naming history feature coming soon!
                </Text>
              </View>
            </View>
          )}

          {/* Features Tab */}
          {activeTab === 3 && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>
                AI Naming Features
              </Text>
              
              <View style={styles.featuresGrid}>
                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureCardTitle}>
                      🎨 Visual Analysis
                    </Text>
                    <View style={styles.featureList}>
                      <Text style={styles.featureListItem}>• Color detection and naming</Text>
                      <Text style={styles.featureListItem}>• Pattern recognition (stripes, dots, etc.)</Text>
                      <Text style={styles.featureListItem}>• Texture analysis (smooth, textured, etc.)</Text>
                      <Text style={styles.featureListItem}>• Style classification (casual, formal, etc.)</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureCardTitle}>
                      🏷️ Smart Naming
                    </Text>
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
                    <Text style={styles.featureCardTitle}>
                      ⚙️ Customization
                    </Text>
                    <View style={styles.featureList}>
                      <Text style={styles.featureListItem}>• Personalized naming preferences</Text>
                      <Text style={styles.featureListItem}>• Manual override capability</Text>
                      <Text style={styles.featureListItem}>• Bulk naming operations</Text>
                      <Text style={styles.featureListItem}>• Naming history tracking</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureCardTitle}>
                      🔄 Integration
                    </Text>
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
          <Ionicons name="bulb" size={48} color={DesignSystem.colors.primary[500]} />
          <Text style={styles.callToActionTitle}>
            Ready to organize your wardrobe with AI?
          </Text>
          <Text style={styles.callToActionDescription}>
            Start using AI-powered naming to automatically organize and categorize your clothing items.
          </Text>
          <TouchableOpacity style={styles.callToActionButton}>
            <Ionicons name="sparkles" size={20} color="white" />
            <Text style={styles.callToActionButtonText}>
              Go to My Wardrobe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={DesignSystem.colors.error[600]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}