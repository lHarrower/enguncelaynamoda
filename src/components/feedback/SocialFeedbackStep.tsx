import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/theme/DesignSystem';
import { SocialFeedback } from '@/types/aynaMirror';

interface SocialFeedbackStepProps {
  socialFeedback?: SocialFeedback;
  onSocialFeedback: (compliments: number, reactions: string[], context: string) => void;
  occasion: string;
  onOccasionChange: (occasion: string) => void;
}

const COMMON_OCCASIONS = [
  { label: 'Work', icon: 'briefcase-outline', color: '#4ECDC4' },
  { label: 'Social Event', icon: 'people-outline', color: '#FF6B6B' },
  { label: 'Date', icon: 'heart-outline', color: '#F1948A' },
  { label: 'Casual Day', icon: 'home-outline', color: '#85C1E9' },
  { label: 'Special Occasion', icon: 'star-outline', color: '#F7DC6F' },
  { label: 'Shopping', icon: 'bag-outline', color: '#BB8FCE' },
  { label: 'Travel', icon: 'airplane-outline', color: '#45B7D1' },
  { label: 'Exercise', icon: 'fitness-outline', color: '#58D68D' },
];

const POSITIVE_REACTIONS = [
  { label: 'Compliments', emoji: '💬', description: 'Someone said something nice' },
  { label: 'Double-takes', emoji: '👀', description: 'People looked twice' },
  { label: 'Smiles', emoji: '😊', description: 'Got friendly smiles' },
  { label: 'Questions', emoji: '❓', description: 'Asked where you got it' },
  { label: 'Photos', emoji: '📸', description: 'Someone wanted a photo' },
  { label: 'Confidence boost', emoji: '✨', description: 'Felt extra confident' },
];

export const SocialFeedbackStep: React.FC<SocialFeedbackStepProps> = ({
  socialFeedback,
  onSocialFeedback,
  occasion,
  onOccasionChange,
}) => {
  const [complimentsCount, setComplimentsCount] = useState(socialFeedback?.complimentsReceived || 0);
  const [selectedReactions, setSelectedReactions] = useState<string[]>(
    socialFeedback?.positiveReactions || []
  );
  const [socialContext, setSocialContext] = useState(socialFeedback?.socialContext || '');
  const [showCustomOccasion, setShowCustomOccasion] = useState(false);

  const animationValue = useRef(new Animated.Value(1)).current;
  const complimentAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Update parent component when local state changes
    onSocialFeedback(complimentsCount, selectedReactions, socialContext);
  }, [complimentsCount, selectedReactions, socialContext]);

  useEffect(() => {
    // Animate compliment counter changes
    if (complimentsCount > 0) {
      Animated.sequence([
        Animated.timing(complimentAnimation, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(complimentAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [complimentsCount]);

  const handleOccasionSelect = (selectedOccasion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOccasionChange(selectedOccasion);
    setShowCustomOccasion(false);
  };

  const handleComplimentChange = (increment: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCount = increment 
      ? Math.min(complimentsCount + 1, 20) 
      : Math.max(complimentsCount - 1, 0);
    setComplimentsCount(newCount);
  };

  const handleReactionToggle = (reaction: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReactions(prev => 
      prev.includes(reaction)
        ? prev.filter(r => r !== reaction)
        : [...prev, reaction]
    );
  };

  const getComplimentMessage = () => {
    if (complimentsCount === 0) return "No compliments yet - that's okay!";
    if (complimentsCount === 1) return "One compliment - nice!";
    if (complimentsCount <= 3) return `${complimentsCount} compliments - you're glowing!`;
    if (complimentsCount <= 5) return `${complimentsCount} compliments - you're on fire! 🔥`;
    return `${complimentsCount} compliments - absolutely stunning! ✨`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Occasion Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What was the occasion?</Text>
        <Text style={styles.sectionSubtitle}>Optional - helps us learn your style preferences</Text>
        
        <View style={styles.occasionsGrid}>
          {COMMON_OCCASIONS.map((occ) => {
            const isSelected = occasion === occ.label;
            
            return (
              <TouchableOpacity
                key={occ.label}
                onPress={() => handleOccasionSelect(occ.label)}
                style={[
                  styles.occasionButton,
                  isSelected && [styles.occasionButtonSelected, { borderColor: occ.color }],
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.occasionIcon, { backgroundColor: occ.color + '20' }]}>
                  <Ionicons name={occ.icon as any} size={20} color={occ.color} />
                </View>
                <Text style={[styles.occasionLabel, isSelected && { color: occ.color }]}>
                  {occ.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity
            onPress={() => setShowCustomOccasion(true)}
            style={[
              styles.occasionButton,
              showCustomOccasion && styles.occasionButtonSelected,
            ]}
            activeOpacity={0.7}
          >
            <View style={[styles.occasionIcon, { backgroundColor: DesignSystem.colors.sage[500] + '20' }]}>
          <Ionicons name="add-outline" size={20} color={DesignSystem.colors.sage[500]} />
            </View>
            <Text style={styles.occasionLabel}>Other</Text>
          </TouchableOpacity>
        </View>

        {showCustomOccasion && (
          <View style={styles.customOccasionContainer}>
            <TextInput
              style={styles.customOccasionInput}
              placeholder="Enter custom occasion..."
              value={occasion}
              onChangeText={onOccasionChange}
              placeholderTextColor={DesignSystem.colors.text.tertiary}
            />
          </View>
        )}
      </View>

      {/* Compliments Counter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Did you receive any compliments?</Text>
        
        <Animated.View
          style={[
            styles.complimentCounter,
            {
              transform: [{ scale: complimentAnimation }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleComplimentChange(false)}
            style={[styles.counterButton, complimentsCount === 0 && styles.counterButtonDisabled]}
            disabled={complimentsCount === 0}
          >
            <Ionicons name="remove" size={24} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.counterDisplay}>
            <Text style={styles.counterNumber}>{complimentsCount}</Text>
            <Text style={styles.counterLabel}>compliments</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleComplimentChange(true)}
            style={styles.counterButton}
          >
            <Ionicons name="add" size={24} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.complimentMessage}>{getComplimentMessage()}</Text>
      </View>

      {/* Positive Reactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What kind of positive reactions?</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply</Text>
        
        <View style={styles.reactionsGrid}>
          {POSITIVE_REACTIONS.map((reaction) => {
            const isSelected = selectedReactions.includes(reaction.label);
            
            return (
              <TouchableOpacity
                key={reaction.label}
                onPress={() => handleReactionToggle(reaction.label)}
                style={[
                  styles.reactionButton,
                  isSelected && styles.reactionButtonSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={[styles.reactionLabel, isSelected && styles.reactionLabelSelected]}>
                  {reaction.label}
                </Text>
                <Text style={styles.reactionDescription}>{reaction.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Additional Context */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Any additional details?</Text>
        <Text style={styles.sectionSubtitle}>Optional - share more about your experience</Text>
        
        <TextInput
          style={styles.contextInput}
          placeholder="e.g., 'My colleague loved my jacket' or 'Felt confident all day'"
          value={socialContext}
          onChangeText={setSocialContext}
          multiline
          numberOfLines={3}
          placeholderTextColor={DesignSystem.colors.text.tertiary}
        />
      </View>

      {/* Summary */}
      {(complimentsCount > 0 || selectedReactions.length > 0 || socialContext.length > 0) && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Social Experience ✨</Text>
          {complimentsCount > 0 && (
            <Text style={styles.summaryItem}>• {complimentsCount} compliment{complimentsCount > 1 ? 's' : ''}</Text>
          )}
          {selectedReactions.length > 0 && (
            <Text style={styles.summaryItem}>• {selectedReactions.join(', ')}</Text>
          )}
          {occasion && (
            <Text style={styles.summaryItem}>• Occasion: {occasion}</Text>
          )}
          {socialContext && (
            <Text style={styles.summaryItem}>• "{socialContext}"</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  occasionButton: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  occasionButtonSelected: {
    borderWidth: 2,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  occasionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  occasionLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  customOccasionContainer: {
    marginTop: 16,
  },
  customOccasionInput: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
  },
  complimentCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 16,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignSystem.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.3,
  },
  counterDisplay: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  counterNumber: {
  ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.sage[500],
    fontWeight: '700',
  },
  counterLabel: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginTop: -4,
  },
  complimentMessage: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  reactionButton: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '45%',
    minWidth: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reactionButtonSelected: {
    borderColor: DesignSystem.colors.sage[500],
    backgroundColor: DesignSystem.colors.sage[500] + '10',
  },
  reactionEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  reactionLabel: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  reactionLabelSelected: {
    color: DesignSystem.colors.sage[500],
  },
  reactionDescription: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  contextInput: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summaryContainer: {
    backgroundColor: DesignSystem.colors.sage[500] + '10',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  summaryTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.sage[500],
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryItem: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
});