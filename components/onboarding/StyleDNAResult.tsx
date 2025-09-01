import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');

interface StylePersonality {
  id: string;
  name: string;
  description: string;
  traits: string[];
  colors: string[];
  styleKeywords: string[];
  icon: string;
  gradient: string[];
}

const STYLE_PERSONALITIES: Record<string, StylePersonality> = {
  calm_strength: {
    id: 'calm_strength',
    name: 'Sakin Güç',
    description: 'Zarafet ve güvenin mükemmel uyumu. Siz, sessiz ama etkili bir lidersiniz.',
    traits: [
      'Zamansız zarafet',
      'Güvenilir karizma',
      'Minimalist sofistikasyon',
      'Doğal otoriteye sahip'
    ],
    colors: ['Nötr tonlar', 'Toprak renkleri', 'Derin maviler', 'Klasik beyaz'],
    styleKeywords: ['Minimalist', 'Klasik', 'Sofistike', 'Zamansız'],
    icon: 'leaf-outline',
    gradient: ['#2C3E50', '#34495E', '#5D6D7E']
  },
  creative_spark: {
    id: 'creative_spark',
    name: 'Yaratıcı Kıvılcım',
    description: 'Sanat ve moda sizin ifade aracınız. Benzersiz tarzınızla ilham veriyorsunuz.',
    traits: [
      'Artistik vizyon',
      'Cesur kombinasyonlar',
      'Özgün perspektif',
      'Yaratıcı problem çözme'
    ],
    colors: ['Canlı renkler', 'Sanatsal desenler', 'Beklenmedik kombinasyonlar', 'Vintage tonları'],
    styleKeywords: ['Artistik', 'Özgün', 'Cesur', 'Yaratıcı'],
    icon: 'color-palette-outline',
    gradient: ['#8E44AD', '#9B59B6', '#AF7AC5']
  },
  warm_approachable: {
    id: 'warm_approachable',
    name: 'Sıcak Yaklaşım',
    description: 'Doğal çekiciliğiniz ve sıcaklığınızla herkesi kendinize çekiyorsunuz.',
    traits: [
      'Doğal çekicilik',
      'Samimi enerji',
      'Uyumlu kombinasyonlar',
      'Rahat sofistikasyon'
    ],
    colors: ['Sıcak tonlar', 'Pastel renkler', 'Doğal nüanslar', 'Yumuşak kontrastlar'],
    styleKeywords: ['Sıcak', 'Rahat', 'Doğal', 'Uyumlu'],
    icon: 'heart-outline',
    gradient: ['#E67E22', '#F39C12', '#F7DC6F']
  },
  bold_magnetic: {
    id: 'bold_magnetic',
    name: 'Cesur Manyetizma',
    description: 'Güçlü enerjiniz ve cesur seçimlerinizle her ortamda dikkat çekiyorsunuz.',
    traits: [
      'Güçlü karizma',
      'Cesur seçimler',
      'Trend belirleyici',
      'Manyetik çekicilik'
    ],
    colors: ['Güçlü kontrastlar', 'Canlı renkler', 'Metalik detaylar', 'Dramatik tonlar'],
    styleKeywords: ['Cesur', 'Güçlü', 'Dramatik', 'Etkileyici'],
    icon: 'flash-outline',
    gradient: ['#C0392B', '#E74C3C', '#EC7063']
  }
};

interface StyleDNAResultProps {
  personality: string;
  onContinue: () => void;
  onRetake?: () => void;
}

export default function StyleDNAResult({ personality, onContinue, onRetake }: StyleDNAResultProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const personalityData = STYLE_PERSONALITIES[personality];

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous rotation for the icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!personalityData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={personalityData.gradient}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.congratsText}>Tebrikler!</Text>
            <Text style={styles.subtitle}>Stil DNA'nız keşfedildi</Text>
          </View>

          {/* Personality Card */}
          <BlurView intensity={20} style={styles.personalityCard}>
            <View style={styles.cardContent}>
              {/* Icon */}
              <Animated.View 
                style={[
                  styles.iconContainer,
                  { transform: [{ rotate: rotateInterpolate }] }
                ]}
              >
                <Ionicons 
                  name={personalityData.icon as any} 
                  size={48} 
                  color={DesignSystem.colors.background.primary} 
                />
              </Animated.View>

              {/* Personality Info */}
              <Text style={styles.personalityName}>{personalityData.name}</Text>
              <Text style={styles.personalityDescription}>{personalityData.description}</Text>

              {/* Traits */}
              <View style={styles.traitsContainer}>
                <Text style={styles.sectionTitle}>Stil Özellikleriniz</Text>
                {personalityData.traits.map((trait, index) => (
                  <View key={index} style={styles.traitItem}>
                    <View style={styles.traitDot} />
                    <Text style={styles.traitText}>{trait}</Text>
                  </View>
                ))}
              </View>

              {/* Style Keywords */}
              <View style={styles.keywordsContainer}>
                <Text style={styles.sectionTitle}>Stil Anahtar Kelimeleriniz</Text>
                <View style={styles.keywordsList}>
                  {personalityData.styleKeywords.map((keyword, index) => (
                    <View key={index} style={styles.keywordChip}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Color Palette */}
              <View style={styles.colorsContainer}>
                <Text style={styles.sectionTitle}>Renk Paletiniz</Text>
                <View style={styles.colorsList}>
                  {personalityData.colors.map((color, index) => (
                    <Text key={index} style={styles.colorText}>• {color}</Text>
                  ))}
                </View>
              </View>
            </View>
          </BlurView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={onContinue}
            >
              <Text style={styles.primaryButtonText}>Gardırobuma Geç</Text>
              <Ionicons name="arrow-forward" size={20} color={DesignSystem.colors.background.primary} />
            </TouchableOpacity>

            {onRetake && (
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={onRetake}
              >
                <Text style={styles.secondaryButtonText}>Testi Tekrar Al</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View 
            style={[
              styles.floatingCircle,
              styles.circle1,
              { transform: [{ rotate: rotateInterpolate }] }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle,
              styles.circle2,
              { transform: [{ rotate: rotateInterpolate }] }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle,
              styles.circle3,
              { transform: [{ rotate: rotateInterpolate }] }
            ]} 
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  congratsText: {
    ...DesignSystem.typography.h1,
    color: DesignSystem.colors.background.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.background.primary,
    opacity: 0.9,
  },
  personalityCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  personalityName: {
    ...DesignSystem.typography.h2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  personalityDescription: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  traitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    ...DesignSystem.typography.subtitle,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  traitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DesignSystem.colors.primary.main,
    marginRight: 12,
  },
  traitText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
  },
  keywordsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: DesignSystem.colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.background.primary,
    fontWeight: '600',
  },
  colorsContainer: {
    width: '100%',
  },
  colorsList: {
    gap: 4,
  },
  colorText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.background.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DesignSystem.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...DesignSystem.typography.button,
    color: DesignSystem.colors.background.primary,
    fontWeight: '600',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  circle1: {
    width: 120,
    height: 120,
    top: 100,
    right: -60,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 200,
    left: -40,
  },
  circle3: {
    width: 60,
    height: 60,
    top: 300,
    left: 50,
  },
});