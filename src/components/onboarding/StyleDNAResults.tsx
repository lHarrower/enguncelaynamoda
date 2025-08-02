// Style DNA Results Component
// Displays the AI-generated style profile in a beautiful, engaging format

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StyleDNAResultsProps {
  styleDNA: {
    stylePersonality: {
      primary: string;
      secondary: string;
      description: string;
    };
    colorPalette: {
      primary: string[];
      accent: string[];
      neutral: string[];
    };
    stylePreferences: {
      formality: 'casual' | 'business' | 'formal' | 'mixed';
      energy: 'calm' | 'bold' | 'creative' | 'classic';
      silhouette: 'fitted' | 'relaxed' | 'structured' | 'flowing';
    };
    recommendations: {
      strengths: string[];
      suggestions: string[];
      avoidances: string[];
    };
    confidence: number;
  };
  onContinue: () => void;
}

export const StyleDNAResults: React.FC<StyleDNAResultsProps> = ({
  styleDNA,
  onContinue,
}) => {
  const { stylePersonality, colorPalette, stylePreferences, recommendations, confidence } = styleDNA;

  const renderColorPalette = (colors: string[], title: string) => {
    if (colors.length === 0) return null;
    
    return (
      <View style={styles.colorSection}>
        <Text style={styles.colorSectionTitle}>{title}</Text>
        <View style={styles.colorRow}>
          {colors.map((color, index) => (
            <View
              key={index}
              style={[
                styles.colorSwatch,
                { backgroundColor: color.toLowerCase() === 'white' ? '#FFFFFF' : color }
              ]}
            >
              {color.toLowerCase() === 'white' && (
                <View style={styles.whiteBorder} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPreferenceCard = (title: string, value: string, icon: string) => (
    <BlurView intensity={20} style={styles.preferenceCard}>
      <View style={styles.preferenceHeader}>
        <Ionicons name={icon as any} size={24} color={DesignSystem.colors.sage[700]} />
        <Text style={styles.preferenceTitle}>{title}</Text>
      </View>
      <Text style={styles.preferenceValue}>{value}</Text>
    </BlurView>
  );

  const renderRecommendationSection = (title: string, items: string[], icon: string, color: string) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.recommendationSection}>
        <View style={styles.recommendationHeader}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={[styles.recommendationTitle, { color }]}>{title}</Text>
        </View>
        {items.map((item, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={[styles.recommendationDot, { backgroundColor: color }]} />
            <Text style={styles.recommendationText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return DesignSystem.colors.success;
    if (confidence >= 0.6) return DesignSystem.colors.gold[500];
    return DesignSystem.colors.sage[500];
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Good Confidence';
    return 'Moderate Confidence';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.background.primary, DesignSystem.colors.sage[50]]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Style DNA</Text>
            <Text style={styles.subtitle}>Discover your unique style personality</Text>
            
            {/* Confidence Badge */}
            <View style={[styles.confidenceBadge, { borderColor: getConfidenceColor(confidence) }]}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={getConfidenceColor(confidence)} 
              />
              <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence) }]}>
                {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
              </Text>
            </View>
          </View>

          {/* Style Personality */}
          <BlurView intensity={30} style={styles.personalityCard}>
            <View style={styles.personalityHeader}>
              <Ionicons name="sparkles" size={28} color={DesignSystem.colors.gold[500]} />
              <Text style={styles.personalityPrimary}>{stylePersonality.primary}</Text>
            </View>
            <Text style={styles.personalitySecondary}>{stylePersonality.secondary}</Text>
            <Text style={styles.personalityDescription}>{stylePersonality.description}</Text>
          </BlurView>

          {/* Color Palette */}
          <BlurView intensity={20} style={styles.colorPaletteCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="color-palette" size={24} color={DesignSystem.colors.sage[700]} />
              <Text style={styles.cardTitle}>Your Color Palette</Text>
            </View>
            
            {renderColorPalette(colorPalette.primary, 'Primary Colors')}
            {renderColorPalette(colorPalette.accent, 'Accent Colors')}
            {renderColorPalette(colorPalette.neutral, 'Neutral Colors')}
          </BlurView>

          {/* Style Preferences */}
          <View style={styles.preferencesContainer}>
            <Text style={styles.sectionTitle}>Style Preferences</Text>
            <View style={styles.preferencesGrid}>
              {renderPreferenceCard(
                'Formality',
                stylePreferences.formality.charAt(0).toUpperCase() + stylePreferences.formality.slice(1),
                'business'
              )}
              {renderPreferenceCard(
                'Energy',
                stylePreferences.energy.charAt(0).toUpperCase() + stylePreferences.energy.slice(1),
                'flash'
              )}
              {renderPreferenceCard(
                'Silhouette',
                stylePreferences.silhouette.charAt(0).toUpperCase() + stylePreferences.silhouette.slice(1),
                'shirt'
              )}
            </View>
          </View>

          {/* Recommendations */}
          <BlurView intensity={20} style={styles.recommendationsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={24} color={DesignSystem.colors.sage[700]} />
              <Text style={styles.cardTitle}>Personal Recommendations</Text>
            </View>
            
            {renderRecommendationSection(
              'Your Strengths',
              recommendations.strengths,
              'star',
              DesignSystem.colors.success
            )}
            
            {renderRecommendationSection(
              'Style Suggestions',
              recommendations.suggestions,
              'arrow-up-circle',
              DesignSystem.colors.gold[500]
            )}
            
            {renderRecommendationSection(
              'Consider Avoiding',
              recommendations.avoidances,
              'information-circle',
              DesignSystem.colors.sage[500]
            )}
          </BlurView>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <LinearGradient
              colors={[DesignSystem.colors.sage[500], DesignSystem.colors.sage[800]]}
              style={styles.continueGradient}
            >
              <Text style={styles.continueButtonText}>Continue to Survey</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: DesignSystem.typography.headings.fontFamily,
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: DesignSystem.typography.body.fontFamily,
    fontWeight: '600',
  },
  personalityCard: {
    ...DesignSystem.effects.glassmorphism,
    padding: 24,
    marginBottom: 24,
    borderRadius: 20,
  },
  personalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  personalityPrimary: {
    fontSize: 24,
    fontFamily: DesignSystem.typography.headings.fontFamily,
    color: DesignSystem.colors.text.primary,
    flex: 1,
  },
  personalitySecondary: {
    fontSize: 18,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.gold[500],
    marginBottom: 12,
    fontWeight: '600',
  },
  personalityDescription: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 24,
  },
  colorPaletteCard: {
    ...DesignSystem.effects.glassmorphism,
    padding: 20,
    marginBottom: 24,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: DesignSystem.typography.headings.fontFamily,
    color: DesignSystem.colors.text.primary,
  },
  colorSection: {
    marginBottom: 16,
  },
  colorSectionTitle: {
    fontSize: 14,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'relative',
  },
  whiteBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
  },
  preferencesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: DesignSystem.typography.headings.fontFamily,
    color: DesignSystem.colors.text.primary,
    marginBottom: 16,
  },
  preferencesGrid: {
    gap: 12,
  },
  preferenceCard: {
    ...DesignSystem.effects.glassmorphism,
    padding: 16,
    borderRadius: 12,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  preferenceTitle: {
    fontSize: 14,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '600',
  },
  preferenceValue: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  recommendationsCard: {
    ...DesignSystem.effects.glassmorphism,
    padding: 20,
    marginBottom: 32,
    borderRadius: 16,
  },
  recommendationSection: {
    marginBottom: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.body.fontFamily,
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  recommendationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 20,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...DesignSystem.effects.shadow,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.body.fontFamily,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});