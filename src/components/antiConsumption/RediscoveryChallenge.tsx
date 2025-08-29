import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import {
  antiConsumptionService,
  RediscoveryChallenge as RediscoveryChallengeType,
} from '@/services/antiConsumptionService';
import { WardrobeItem } from '@/services/wardrobeService';
import { DesignSystem } from '@/theme/DesignSystem';
import { logger } from '@/utils/logger';

interface RediscoveryChallengeProps {
  userId: string;
  challenge?: RediscoveryChallengeType;
  onChallengeComplete?: (challenge: RediscoveryChallengeType) => void;
  onItemWorn?: (itemId: string) => void;
}

export const RediscoveryChallenge: React.FC<RediscoveryChallengeProps> = ({
  userId,
  challenge: initialChallenge,
  onChallengeComplete,
  onItemWorn,
}) => {
  const { colors: themeColors } = useSafeTheme();
  const styles = createStyles(themeColors);
  const [challenge, setChallenge] = useState<RediscoveryChallengeType | null>(
    initialChallenge || null,
  );
  const [loading, setLoading] = useState(!initialChallenge);
  const [error, setError] = useState<string | null>(null);

  const createNewChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const newChallenge = await antiConsumptionService.createRediscoveryChallenge(userId);
      setChallenge(newChallenge);
    } catch (err) {
      setError('Failed to create challenge');
      logger.error('Error creating rediscovery challenge', { error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialChallenge) {
      void createNewChallenge();
    }
  }, [userId, initialChallenge, createNewChallenge]);

  const handleItemWorn = (item: WardrobeItem) => {
    Alert.alert('Mark as Worn', `Did you wear this ${item.category.toLowerCase()} today?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, I wore it!',
        onPress: () => markItemAsWorn(item.id),
        style: 'default',
      },
    ]);
  };

  const markItemAsWorn = (itemId: string) => {
    if (!challenge) {
      return;
    }

    const newProgress = challenge.progress + 1;
    const updatedChallenge = {
      ...challenge,
      progress: newProgress,
      completedAt: newProgress >= challenge.totalItems ? new Date() : undefined,
    };

    setChallenge(updatedChallenge);
    onItemWorn?.(itemId);

    if (newProgress >= challenge.totalItems) {
      showCompletionCelebration();
      onChallengeComplete?.(updatedChallenge);
    }
  };

  const showCompletionCelebration = () => {
    Alert.alert(
      '🎉 Challenge Complete!',
      `Congratulations! You've completed the "${challenge?.title}" challenge. ${challenge?.reward}`,
      [{ text: 'Amazing!', style: 'default' }],
    );
  };

  const getChallengeIcon = (type: RediscoveryChallengeType['challengeType']): string => {
    switch (type) {
      case 'neglected_items':
        return 'shirt-outline';
      case 'color_exploration':
        return 'color-palette-outline';
      case 'style_mixing':
        return 'shuffle-outline';
      default:
        return 'star-outline';
    }
  };

  const getChallengeColor = (type: RediscoveryChallengeType['challengeType']): string => {
    switch (type) {
      case 'neglected_items':
        return DesignSystem.colors.primary[500] || '#007AFF';
      case 'color_exploration':
        return DesignSystem.colors.warning[500];
      case 'style_mixing':
        return DesignSystem.colors.success[500];
      default:
        return DesignSystem.colors.primary[500] || '#007AFF';
    }
  };

  const getProgressPercentage = (): number => {
    if (!challenge) {
      return 0;
    }
    return (challenge.progress / challenge.totalItems) * 100;
  };

  const getDaysRemaining = (): number => {
    if (!challenge) {
      return 0;
    }
    const now = new Date();
    const expiresAt = new Date(challenge.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Creating your rediscovery challenge...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={DesignSystem.colors.error[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void createNewChallenge()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Tap to create a new rediscovery challenge"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.container}>
        <View style={styles.noChallengeContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={48}
            color={DesignSystem.colors.success[500]}
          />
          <Text style={styles.noChallengeTitle}>All Caught Up!</Text>
          <Text style={styles.noChallengeText}>
            You&apos;re doing great with your wardrobe utilization. Keep up the good work!
          </Text>
        </View>
      </View>
    );
  }

  const challengeColor = getChallengeColor(challenge.challengeType);
  const challengeIcon = getChallengeIcon(challenge.challengeType);
  const progressPercentage = getProgressPercentage();
  const daysRemaining = getDaysRemaining();
  const isCompleted = challenge.completedAt !== undefined;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${challengeColor}20` }]}>
          <Ionicons
            name={challengeIcon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={challengeColor}
          />
        </View>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>
            {challenge.progress} / {challenge.totalItems}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: challengeColor,
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}% Complete</Text>
      </View>

      {!isCompleted && (
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={DesignSystem.colors.neutral[600]} />
          <Text style={styles.timeText}>
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedContainer}>
          <Ionicons name="trophy-outline" size={20} color={DesignSystem.colors.success[500]} />
          <Text style={styles.completedText}>Challenge Completed!</Text>
          <Text style={styles.rewardText}>{challenge.reward}</Text>
        </View>
      )}

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Challenge Items</Text>
        <View style={styles.itemsGrid}>
          {challenge.targetItems.map((item, index) => {
            const isWorn = index < challenge.progress;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  isWorn && styles.itemCardWorn,
                  isCompleted && styles.itemCardCompleted,
                ]}
                onPress={() => !isWorn && !isCompleted && handleItemWorn(item)}
                disabled={isWorn || isCompleted}
                accessibilityRole="button"
                accessibilityLabel={`${item.category} item${isWorn ? ' - already worn' : ''}`}
                accessibilityHint={
                  isWorn || isCompleted ? 'Item already completed' : 'Tap to mark this item as worn'
                }
                accessibilityState={{ disabled: isWorn || isCompleted }}
              >
                {'imageUri' in item ? (
                  <Image
                    source={{ uri: (item as WardrobeItem & { imageUri: string }).imageUri }}
                    style={styles.itemImage}
                  />
                ) : null}
                {isWorn && (
                  <View style={styles.wornOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemCategory, isWorn && styles.itemCategoryWorn]}>
                    {item.category}
                  </Text>
                  <View style={styles.itemColors}>
                    {item.colors.slice(0, 3).map((color, colorIndex) => (
                      <View
                        key={colorIndex}
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor:
                              typeof color === 'string' ? color.toLowerCase() : themeColors.border,
                          },
                          isWorn && styles.colorDotWorn,
                        ]}
                      />
                    ))}
                  </View>
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <Text style={[styles.itemTags, isWorn && styles.itemTagsWorn]}>
                      {item.tags.slice(0, 2).join(', ')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!isCompleted && challenge.progress > 0 && (
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Great progress! You&apos;re rediscovering the gems in your closet. Keep going to unlock
            your reward!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof useSafeTheme>['colors']) =>
  StyleSheet.create({
    colorDot: {
      borderColor: colors.border,
      borderRadius: 6,
      borderWidth: 1,
      height: 12,
      marginRight: 4,
      width: 12,
    },
    colorDotWorn: {
      opacity: 0.6,
    },
    completedContainer: {
      alignItems: 'center',
      backgroundColor: `${colors.semantic.success}20`,
      borderRadius: 12,
      marginBottom: 20,
      marginHorizontal: 20,
      padding: 16,
    },

    completedText: {
      color: '#22C55E',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
      marginTop: 8,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    encouragementContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 20,
      marginHorizontal: 20,
      padding: 16,
    },
    encouragementText: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    errorContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24,
      marginTop: 16,
      textAlign: 'center',
    },
    header: {
      alignItems: 'center',
      padding: 20,
    },
    iconContainer: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      marginBottom: 12,
      width: 48,
    },
    itemCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      position: 'relative',
      width: '48%',
    },
    itemCardCompleted: {
      borderColor: '#22C55E',
      borderWidth: 2,
    },
    itemCardWorn: {
      opacity: 0.7,
    },
    itemCategory: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    itemCategoryWorn: {
      color: colors.textSecondary,
    },
    itemColors: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    itemImage: {
      backgroundColor: colors.border,
      height: 120,
      width: '100%',
    },
    itemInfo: {
      padding: 12,
    },
    itemTags: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    itemTagsWorn: {
      color: colors.textSecondary,
      opacity: 0.6,
    },
    itemsContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },
    itemsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    itemsTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    noChallengeContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    noChallengeText: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    noChallengeTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 16,
    },
    progressBar: {
      backgroundColor: colors.border,
      borderRadius: 4,
      height: 8,
      marginBottom: 8,
      overflow: 'hidden',
    },
    progressContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },
    progressFill: {
      borderRadius: 4,
      height: '100%',
    },
    progressHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    progressPercentage: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    progressText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    retryButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    rewardText: {
      color: colors.semantic.success,
      fontSize: 14,
      textAlign: 'center',
    },
    timeContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    timeText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginLeft: 4,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    wornOverlay: {
      backgroundColor: '#22C55E',
      borderRadius: 12,
      padding: 4,
      position: 'absolute',
      right: 8,
      top: 8,
    },
  });
