import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface StyleDNAQuestion {
  id: string;
  question: string;
  subtitle: string;
  type: 'color' | 'style' | 'mood' | 'occasion';
  options: {
    id: string;
    label: string;
    value: string;
    visual?: string;
    colors?: string[];
    description?: string;
  }[];
}

const STYLE_DNA_QUESTIONS: StyleDNAQuestion[] = [
  {
    id: 'color_palette',
    question: 'Which color palette speaks to your soul?',
    subtitle: 'Colors reveal the essence of your style DNA',
    type: 'color',
    options: [
      {
        id: 'warm_earth',
        label: 'Warm Earth',
        value: 'warm_earth',
        colors: ['#D4A574', '#B8956A', '#8B7355', '#6B5B47'],
        description: 'Grounded, natural, confident'
      },
      {
        id: 'cool_serenity',
        label: 'Cool Serenity',
        value: 'cool_serenity',
        colors: ['#7BA7BC', '#9BB5C4', '#B8CDD9', '#D4E4EA'],
        description: 'Calm, sophisticated, peaceful'
      },
      {
        id: 'bold_power',
        label: 'Bold Power',
        value: 'bold_power',
        colors: ['#2C3E50', '#E74C3C', '#F39C12', '#FFFFFF'],
        description: 'Strong, decisive, impactful'
      },
      {
        id: 'soft_elegance',
        label: 'Soft Elegance',
        value: 'soft_elegance',
        colors: ['#F8E8E7', '#E6D7D3', '#D4C4BF', '#C2B2AB'],
        description: 'Gentle, refined, graceful'
      }
    ]
  },
  {
    id: 'sunday_coffee',
    question: 'Your perfect Sunday coffee moment?',
    subtitle: 'How you relax reveals your authentic style',
    type: 'mood',
    options: [
      {
        id: 'cozy_home',
        label: 'Cozy at Home',
        value: 'cozy_home',
        visual: '🏠☕',
        description: 'Soft knits, comfortable elegance'
      },
      {
        id: 'chic_cafe',
        label: 'Chic Café',
        value: 'chic_cafe',
        visual: '☕✨',
        description: 'Effortless sophistication'
      },
      {
        id: 'nature_walk',
        label: 'Nature Walk',
        value: 'nature_walk',
        visual: '🌿☕',
        description: 'Natural, grounded style'
      },
      {
        id: 'rooftop_view',
        label: 'Rooftop View',
        value: 'rooftop_view',
        visual: '🏙️☕',
        description: 'Urban, confident edge'
      }
    ]
  },
  {
    id: 'style_energy',
    question: 'What energy do you want to radiate?',
    subtitle: 'Your inner light shapes your outer expression',
    type: 'mood',
    options: [
      {
        id: 'calm_strength',
        label: 'Calm Strength',
        value: 'calm_strength',
        description: 'Quiet confidence that commands respect'
      },
      {
        id: 'creative_spark',
        label: 'Creative Spark',
        value: 'creative_spark',
        description: 'Artistic flair with unique touches'
      },
      {
        id: 'warm_approachable',
        label: 'Warm & Approachable',
        value: 'warm_approachable',
        description: 'Inviting elegance that draws people in'
      },
      {
        id: 'bold_magnetic',
        label: 'Bold & Magnetic',
        value: 'bold_magnetic',
        description: 'Striking presence that turns heads'
      }
    ]
  },
  {
    id: 'special_occasion',
    question: 'For a special evening, you choose...',
    subtitle: 'Your celebration style reveals your aspirations',
    type: 'occasion',
    options: [
      {
        id: 'timeless_classic',
        label: 'Timeless Classic',
        value: 'timeless_classic',
        description: 'Elegant pieces that never go out of style'
      },
      {
        id: 'modern_edge',
        label: 'Modern Edge',
        value: 'modern_edge',
        description: 'Contemporary cuts with unexpected details'
      },
      {
        id: 'romantic_feminine',
        label: 'Romantic Feminine',
        value: 'romantic_feminine',
        description: 'Flowing fabrics and delicate touches'
      },
      {
        id: 'power_statement',
        label: 'Power Statement',
        value: 'power_statement',
        description: 'Bold pieces that command attention'
      }
    ]
  },
  {
    id: 'texture_preference',
    question: 'Which texture calls to you?',
    subtitle: 'Touch reveals the soul of your style',
    type: 'style',
    options: [
      {
        id: 'soft_luxe',
        label: 'Soft Luxe',
        value: 'soft_luxe',
        description: 'Cashmere, silk, flowing fabrics'
      },
      {
        id: 'structured_sharp',
        label: 'Structured Sharp',
        value: 'structured_sharp',
        description: 'Crisp cotton, tailored lines'
      },
      {
        id: 'natural_organic',
        label: 'Natural Organic',
        value: 'natural_organic',
        description: 'Linen, cotton, earthy textures'
      },
      {
        id: 'rich_dramatic',
        label: 'Rich Dramatic',
        value: 'rich_dramatic',
        description: 'Velvet, leather, statement textures'
      }
    ]
  }
];

interface StyleDNASurveyProps {
  onComplete: (styleDNA: any) => void;
}

export default function StyleDNASurvey({ onComplete }: StyleDNASurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = STYLE_DNA_QUESTIONS[currentStep];
  const progress = (currentStep + 1) / STYLE_DNA_QUESTIONS.length;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleOptionSelect = (option: any) => {
    setSelectedOption(option.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Auto-advance after selection
    setTimeout(() => {
      handleNext(option);
    }, 800);
  };

  const handleNext = (selectedOptionData: any) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOptionData
    };
    setAnswers(newAnswers);

    if (currentStep < STYLE_DNA_QUESTIONS.length - 1) {
      // Animate to next question
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        setSelectedOption(null);
        slideAnim.setValue(0);
      });
    } else {
      // Survey complete
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onComplete(newAnswers);
    }
  };

  const renderColorOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.colorOption,
        selectedOption === option.id && styles.selectedOption
      ]}
      onPress={() => handleOptionSelect(option)}
      activeOpacity={0.8}
    >
      <View style={styles.colorPalette}>
        {option.colors.map((color: string, index: number) => (
          <View
            key={index}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              index === 0 && styles.firstSwatch,
              index === option.colors.length - 1 && styles.lastSwatch
            ]}
          />
        ))}
      </View>
      <Text style={styles.optionLabel}>{option.label}</Text>
      <Text style={styles.optionDescription}>{option.description}</Text>
    </TouchableOpacity>
  );

  const renderStandardOption = (option: any) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.standardOption,
        selectedOption === option.id && styles.selectedOption
      ]}
      onPress={() => handleOptionSelect(option)}
      activeOpacity={0.8}
    >
      {option.visual && (
        <Text style={styles.optionVisual}>{option.visual}</Text>
      )}
      <Text style={styles.optionLabel}>{option.label}</Text>
      <Text style={styles.optionDescription}>{option.description}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F8F6F0', '#FFFFFF', '#F8F6F0']}
      style={styles.container}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {STYLE_DNA_QUESTIONS.length}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.questionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Question Header */}
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
          <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
        </View>

        {/* Options */}
        <ScrollView
          style={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.optionsContent}
        >
          {currentQuestion.type === 'color'
            ? currentQuestion.options.map(renderColorOption)
            : currentQuestion.options.map(renderStandardOption)
          }
        </ScrollView>
      </Animated.View>

      {/* Decorative Elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.decorativeCircle, styles.topLeft]} />
        <View style={[styles.decorativeCircle, styles.bottomRight]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 40,
  },
  colorOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  standardOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedOption: {
    borderColor: '#D4A574',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    transform: [{ scale: 1.02 }],
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  colorSwatch: {
    width: 40,
    height: 40,
  },
  firstSwatch: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastSwatch: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  optionVisual: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#2C3E50',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 20,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
  },
  topLeft: {
    top: -60,
    left: -60,
  },
  bottomRight: {
    bottom: -60,
    right: -60,
  },
});