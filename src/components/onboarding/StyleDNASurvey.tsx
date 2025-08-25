import * as React from 'react';
const { useState, useRef } = React;
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IoniconsName } from '@/types/icons';
import { warnInDev } from '@/utils/consoleSuppress';

import { DesignSystem } from '../../theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StyleDNAQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    value: string;
    color?: string;
    image?: any;
  }>;
}

const STYLE_DNA_QUESTIONS: StyleDNAQuestion[] = [
  {
    id: 'color_preference',
    question: 'Hangi renk paleti seni daha çok çekiyor?',
    options: [
      { id: 'warm', text: 'Sıcak Tonlar', value: 'warm', color: '#FF6B6B' },
      { id: 'cool', text: 'Soğuk Tonlar', value: 'cool', color: '#4ECDC4' },
      { id: 'neutral', text: 'Nötr Tonlar', value: 'neutral', color: '#95A5A6' },
      { id: 'bold', text: 'Cesur Renkler', value: 'bold', color: '#9B59B6' },
    ],
  },
  {
    id: 'style_preference',
    question: 'Hangi stil daha çok sana uygun?',
    options: [
      { id: 'minimalist', text: 'Minimalist', value: 'minimalist' },
      { id: 'bohemian', text: 'Bohem', value: 'bohemian' },
      { id: 'classic', text: 'Klasik', value: 'classic' },
      { id: 'edgy', text: 'Cesur', value: 'edgy' },
    ],
  },
  {
    id: 'occasion_preference',
    question: 'En çok hangi durumlar için kıyafet seçiyorsun?',
    options: [
      { id: 'casual', text: 'Günlük', value: 'casual' },
      { id: 'work', text: 'İş', value: 'work' },
      { id: 'evening', text: 'Gece', value: 'evening' },
      { id: 'special', text: 'Özel Etkinlik', value: 'special' },
    ],
  },
  {
    id: 'fit_preference',
    question: 'Hangi kesim seni daha rahat hissettiriyor?',
    options: [
      { id: 'loose', text: 'Bol', value: 'loose' },
      { id: 'fitted', text: 'Vücuda Oturan', value: 'fitted' },
      { id: 'structured', text: 'Yapısal', value: 'structured' },
      { id: 'flowy', text: 'Akışkan', value: 'flowy' },
    ],
  },
  {
    id: 'texture_preference',
    question: 'Hangi kumaş dokusunu tercih ediyorsun?',
    options: [
      { id: 'smooth', text: 'Pürüzsüz', value: 'smooth' },
      { id: 'textured', text: 'Dokulu', value: 'textured' },
      { id: 'soft', text: 'Yumuşak', value: 'soft' },
      { id: 'structured', text: 'Sert', value: 'structured' },
    ],
  },
];

interface StyleDNASurveyProps {
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

const StyleDNASurvey: React.FC<StyleDNASurveyProps> = ({ onComplete, onSkip }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const progressValue = useSharedValue(0);
  const slideValue = useSharedValue(0);

  const currentQuestion = STYLE_DNA_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / STYLE_DNA_QUESTIONS.length;

  React.useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 300 });
  }, [currentQuestionIndex, progress, progressValue]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOption(optionId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      handleNext(value);
    }, 200);
  };

  const handleNext = (value: string) => {
    if (!currentQuestion) {
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < STYLE_DNA_QUESTIONS.length - 1) {
      slideValue.value = withSpring(-screenWidth, {
        damping: 20,
        stiffness: 90,
      });

      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        slideValue.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }, 150);
    } else {
      onComplete(newAnswers);
    }
  };

  const renderColorOption = (option: StyleDNAQuestion['options'][0]) => {
    const isSelected = selectedOption === option.id;

    return React.createElement(
      TouchableOpacity,
      {
        key: option.id,
        style: [
          styles.colorOption,
          { backgroundColor: option.color },
          isSelected && styles.selectedOption,
        ],
        onPress: () => handleOptionSelect(option.id, option.value),
        activeOpacity: 0.8,
      },
      React.createElement(Text, { style: styles.colorOptionText }, option.text),
      isSelected &&
        React.createElement(Ionicons, {
          name: 'checkmark-circle' as IoniconsName,
          size: 24,
          color: 'white',
          style: styles.checkIcon,
        }),
    );
  };

  const renderStandardOption = (option: StyleDNAQuestion['options'][0]) => {
    const isSelected = selectedOption === option.id;

    return React.createElement(
      TouchableOpacity,
      {
        key: option.id,
        style: [styles.standardOption, isSelected && styles.selectedStandardOption],
        onPress: () => handleOptionSelect(option.id, option.value),
        activeOpacity: 0.8,
      },
      React.createElement(
        Text,
        {
          style: [styles.standardOptionText, isSelected && styles.selectedStandardOptionText],
        },
        option.text,
      ),
      isSelected &&
        React.createElement(Ionicons, {
          name: 'checkmark-circle' as IoniconsName,
          size: 20,
          color: DesignSystem.colors.primary[500],
        }),
    );
  };

  return React.createElement(
    LinearGradient,
    {
      colors: [DesignSystem.colors.surface.primary, DesignSystem.colors.surface.secondary],
      style: styles.container,
    },
    React.createElement(
      View,
      { style: styles.header },
      React.createElement(
        View,
        { style: styles.progressContainer },
        React.createElement(
          View,
          { style: styles.progressBackground },
          React.createElement(Animated.View, { style: [styles.progressBar, progressStyle] }),
        ),
        React.createElement(
          Text,
          { style: styles.progressText },
          `${currentQuestionIndex + 1} / ${STYLE_DNA_QUESTIONS.length}`,
        ),
      ),
      React.createElement(
        TouchableOpacity,
        { onPress: onSkip, style: styles.skipButton },
        React.createElement(Text, { style: styles.skipText }, 'Atla'),
      ),
    ),
    React.createElement(
      ScrollView,
      {
        style: styles.content,
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.scrollContent,
      },
      React.createElement(
        View,
        { style: styles.questionContainer },
        React.createElement(Text, { style: styles.questionText }, currentQuestion?.question || ''),
        React.createElement(
          View,
          { style: styles.optionsContainer },
          currentQuestion?.options?.map((option) =>
            currentQuestion.id === 'color_preference'
              ? renderColorOption(option)
              : renderStandardOption(option),
          ) || [],
        ),
      ),
      React.createElement(
        View,
        { style: styles.decorativeElements },
        React.createElement(View, { style: [styles.decorativeCircle, styles.topLeft] }),
        React.createElement(View, { style: [styles.decorativeCircle, styles.bottomRight] }),
      ),
    ),
  );
};

const createStyles = (styleObj: Record<string, any>) => {
  try {
    return StyleSheet.create(styleObj);
  } catch (error) {
    warnInDev('StyleSheet.create failed, using fallback styles:', error);
    // Return a safe fallback with basic styles
    return {
      container: { flex: 1 },
      gradient: { flex: 1 },
      scrollView: { flex: 1 },
      content: { padding: 20 },
      ...styleObj,
    };
  }
};

const styles = createStyles({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressBackground: {
    height: 4,
    backgroundColor: DesignSystem.colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: DesignSystem.colors.text.secondary,
    marginTop: 8,
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  questionText: {
    fontSize: 28,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  optionsContainer: {
    gap: 16,
  },
  colorOption: {
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedOption: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  colorOptionText: {
    fontSize: 18,
    fontFamily: DesignSystem.typography.fontFamily.heading,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  standardOption: {
    height: 60,
    borderRadius: 12,
    backgroundColor: DesignSystem.colors.surface.primary,
    borderWidth: 2,
    borderColor: DesignSystem.colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  selectedStandardOption: {
    borderColor: DesignSystem.colors.primary[500],
    backgroundColor: DesignSystem.colors.primary[100],
  },
  standardOptionText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  selectedStandardOptionText: {
    color: DesignSystem.colors.primary[500],
    fontFamily: DesignSystem.typography.fontFamily.heading,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: DesignSystem.colors.primary[100],
    opacity: 0.1,
  },
  topLeft: {
    top: -50,
    left: -50,
  },
  bottomRight: {
    bottom: -50,
    right: -50,
  },
});

export default StyleDNASurvey;
