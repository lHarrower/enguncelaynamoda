import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';

const { width, height } = Dimensions.get('window');

interface StyleDNAQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    id: string;
    text: string;
    personality: 'calm_strength' | 'creative_spark' | 'warm_approachable' | 'bold_magnetic';
    icon: string;
  }[];
}

const STYLE_DNA_QUESTIONS: StyleDNAQuestion[] = [
  {
    id: 'social_energy',
    question: 'Bir partiye gittiğinizde kendinizi nasıl hissedersiniz?',
    description: 'Sosyal enerjinizi anlamamıza yardımcı olun',
    options: [
      {
        id: 'calm_observer',
        text: 'Sakin bir köşede, derin sohbetler yaparım',
        personality: 'calm_strength',
        icon: 'leaf-outline',
      },
      {
        id: 'creative_connector',
        text: 'İlginç insanlarla yaratıcı konuşmalar başlatırım',
        personality: 'creative_spark',
        icon: 'color-palette-outline',
      },
      {
        id: 'warm_host',
        text: 'Herkesi tanıştırır, sıcak bir atmosfer yaratırım',
        personality: 'warm_approachable',
        icon: 'heart-outline',
      },
      {
        id: 'magnetic_center',
        text: 'Doğal olarak dikkat çeker, enerjimi paylaşırım',
        personality: 'bold_magnetic',
        icon: 'flash-outline',
      },
    ],
  },
  {
    id: 'decision_making',
    question: 'Önemli kararlar alırken hangi yaklaşımı benimsersiniz?',
    description: 'Karar verme tarzınız stilinizi yansıtır',
    options: [
      {
        id: 'thoughtful_analysis',
        text: 'Derinlemesine düşünür, tüm seçenekleri değerlendiririm',
        personality: 'calm_strength',
        icon: 'library-outline',
      },
      {
        id: 'intuitive_creative',
        text: 'İçgüdülerime güvenir, yaratıcı çözümler ararım',
        personality: 'creative_spark',
        icon: 'bulb-outline',
      },
      {
        id: 'collaborative_warm',
        text: 'Sevdiklerimle konuşur, ortak akılla hareket ederim',
        personality: 'warm_approachable',
        icon: 'people-outline',
      },
      {
        id: 'confident_bold',
        text: 'Hızlı karar verir, cesaretle ileri atılırım',
        personality: 'bold_magnetic',
        icon: 'rocket-outline',
      },
    ],
  },
  {
    id: 'ideal_weekend',
    question: 'Mükemmel hafta sonunuz nasıl geçer?',
    description: 'Yaşam tarzınız stil DNA\'nızın anahtarı',
    options: [
      {
        id: 'peaceful_retreat',
        text: 'Doğada yürüyüş, kitap okuma, meditasyon',
        personality: 'calm_strength',
        icon: 'flower-outline',
      },
      {
        id: 'creative_exploration',
        text: 'Sanat galerileri, atölyeler, yeni deneyimler',
        personality: 'creative_spark',
        icon: 'brush-outline',
      },
      {
        id: 'social_gathering',
        text: 'Arkadaşlarla buluşma, aile zamanı, sıcak sohbetler',
        personality: 'warm_approachable',
        icon: 'cafe-outline',
      },
      {
        id: 'adventure_seeking',
        text: 'Yeni yerler keşfetme, heyecan verici aktiviteler',
        personality: 'bold_magnetic',
        icon: 'airplane-outline',
      },
    ],
  },
  {
    id: 'work_approach',
    question: 'İş hayatında kendinizi nasıl tanımlarsınız?',
    description: 'Profesyonel kimliğiniz stil tercihlerinizi şekillendirir',
    options: [
      {
        id: 'strategic_thinker',
        text: 'Stratejik düşünen, güvenilir lider',
        personality: 'calm_strength',
        icon: 'chess-outline',
      },
      {
        id: 'innovative_creator',
        text: 'Yenilikçi, sınırları zorlayan yaratıcı',
        personality: 'creative_spark',
        icon: 'construct-outline',
      },
      {
        id: 'team_builder',
        text: 'Takım ruhu yaratan, destekleyici mentor',
        personality: 'warm_approachable',
        icon: 'hand-left-outline',
      },
      {
        id: 'visionary_leader',
        text: 'Vizyoner, ilham veren değişim ajanı',
        personality: 'bold_magnetic',
        icon: 'eye-outline',
      },
    ],
  },
  {
    id: 'personal_values',
    question: 'Hayatta en çok neye değer verirsiniz?',
    description: 'Değerleriniz stil DNA\'nızın temeli',
    options: [
      {
        id: 'authenticity_depth',
        text: 'Otantiklik ve derin bağlantılar',
        personality: 'calm_strength',
        icon: 'shield-checkmark-outline',
      },
      {
        id: 'creativity_expression',
        text: 'Yaratıcılık ve kendini ifade etme',
        personality: 'creative_spark',
        icon: 'musical-notes-outline',
      },
      {
        id: 'harmony_connection',
        text: 'Uyum ve anlamlı ilişkiler',
        personality: 'warm_approachable',
        icon: 'heart-circle-outline',
      },
      {
        id: 'impact_achievement',
        text: 'Etki yaratma ve başarı',
        personality: 'bold_magnetic',
        icon: 'trophy-outline',
      },
    ],
  },
];

interface StyleDNATestProps {
  onComplete: (results: { personality: string; answers: any[] }) => void;
  onBack?: () => void;
}

export default function StyleDNATest({ onComplete, onBack }: StyleDNATestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleOptionSelect = (option: any) => {
    if (isTransitioning) return;

    setSelectedOption(option.id);
    
    // Haptic feedback
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scale animation for selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Wait a moment then proceed
    setTimeout(() => {
      proceedToNext(option);
    }, 600);
  };

  const proceedToNext = (selectedAnswer: any) => {
    setIsTransitioning(true);
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < STYLE_DNA_QUESTIONS.length - 1) {
      // Slide transition to next question
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        slideAnim.setValue(width);
        
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
        });
      });
    } else {
      // Calculate personality type
      const personalityScores = {
        calm_strength: 0,
        creative_spark: 0,
        warm_approachable: 0,
        bold_magnetic: 0,
      };

      newAnswers.forEach(answer => {
        personalityScores[answer.personality]++;
      });

      const dominantPersonality = Object.entries(personalityScores)
        .sort(([,a], [,b]) => b - a)[0][0];

      // Complete the test
      setTimeout(() => {
        onComplete({
          personality: dominantPersonality,
          answers: newAnswers,
        });
      }, 800);
    }
  };

  const question = STYLE_DNA_QUESTIONS[currentQuestion];
  const progress = (currentQuestion + 1) / STYLE_DNA_QUESTIONS.length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          DesignSystem.colors.background.primary,
          DesignSystem.colors.background.secondary,
        ]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={DesignSystem.colors.text.primary} 
              />
            </TouchableOpacity>
          )}
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestion + 1} / {STYLE_DNA_QUESTIONS.length}
            </Text>
          </View>
        </View>

        {/* Question Content */}
        <Animated.View 
          style={[
            styles.questionContainer,
            {
              transform: [{ translateX: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.questionHeader}>
            <Text style={styles.questionTitle}>{question.question}</Text>
            <Text style={styles.questionDescription}>{question.description}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedOption === option.id && styles.selectedOption,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={isTransitioning}
              >
                <BlurView intensity={20} style={styles.optionBlur}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionIcon}>
                      <Ionicons 
                        name={option.icon as any} 
                        size={24} 
                        color={selectedOption === option.id 
                          ? DesignSystem.colors.primary.main 
                          : DesignSystem.colors.text.secondary
                        } 
                      />
                    </View>
                    <Text style={[
                      styles.optionText,
                      selectedOption === option.id && styles.selectedOptionText
                    ]}>
                      {option.text}
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <Animated.View 
            style={[
              styles.floatingCircle,
              styles.circle1,
              { transform: [{ scale: scaleAnim }] }
            ]} 
          />
          <Animated.View 
            style={[
              styles.floatingCircle,
              styles.circle2,
              { transform: [{ scale: scaleAnim }] }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: DesignSystem.colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary.main,
    borderRadius: 2,
  },
  progressText: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: 8,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionHeader: {
    marginBottom: 40,
  },
  questionTitle: {
    ...DesignSystem.typography.h2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  questionDescription: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: DesignSystem.colors.primary.main,
  },
  optionBlur: {
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignSystem.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: DesignSystem.colors.primary.main,
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
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: DesignSystem.colors.primary.main,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: DesignSystem.colors.secondary.main,
    bottom: -75,
    left: -75,
  },
});