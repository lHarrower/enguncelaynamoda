import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import { antiConsumptionService, RediscoveryChallenge as RediscoveryChallengeType } from '../../services/antiConsumptionService';
import { WardrobeItem } from '../../types';

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
  const [challenge, setChallenge] = useState<RediscoveryChallengeType | null>(initialChallenge || null);
  const [loading, setLoading] = useState(!initialChallenge);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialChallenge) {
      createNewChallenge();
    }
  }, [userId, initialChallenge]);

  const createNewChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const newChallenge = await antiConsumptionService.createRediscoveryChallenge(userId);
      setChallenge(newChallenge);
    } catch (err) {
      setError('Failed to create challenge');
      console.error('Error creating rediscovery challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemWorn = (item: WardrobeItem) => {
    Alert.alert(
      'Mark as Worn',
      `Did you wear this ${item.category.toLowerCase()} today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, I wore it!', 
          onPress: () => markItemAsWorn(item.id),
          style: 'default'
        },
      ]
    );
  };

  const markItemAsWorn = (itemId: string) => {
    if (!challenge) return;

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
      [{ text: 'Amazing!', style: 'default' }]
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
        return APP_THEME_V2.colors.primary;
      case 'color_exploration':
        return APP_THEME_V2.colors.warning;
      case 'style_mixing':
        return APP_THEME_V2.colors.success;
      default:
        return APP_THEME_V2.colors.primary;
    }
  };

  const getProgressPercentage = (): number => {
    if (!challenge) return 0;
    return (challenge.progress / challenge.totalItems) * 100;
  };

  const getDaysRemaining = (): number => {
    if (!challenge) return 0;
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
          <Ionicons name="alert-circle-outline" size={48} color={APP_THEME_V2.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={createNewChallenge}>
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
          <Ionicons name="checkmark-circle-outline" size={48} color={APP_THEME_V2.colors.success} />
          <Text style={styles.noChallengeTitle}>All Caught Up!</Text>
          <Text style={styles.noChallengeText}>
            You're doing great with your wardrobe utilization. Keep up the good work!
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
          <Ionicons name={challengeIcon} size={24} color={challengeColor} />
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
                backgroundColor: challengeColor
              }
            ]} 
          />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}% Complete
        </Text>
      </View>

      {!isCompleted && (
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={APP_THEME_V2.colors.textSecondary} />
          <Text style={styles.timeText}>
            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedContainer}>
          <Ionicons name="trophy-outline" size={20} color={APP_THEME_V2.colors.success} />
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
                  isCompleted && styles.itemCardCompleted
                ]}
                onPress={() => !isWorn && !isCompleted && handleItemWorn(item)}
                disabled={isWorn || isCompleted}
              >
                <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
                {isWorn && (
                  <View style={styles.wornOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={[
                    styles.itemCategory,
                    isWorn && styles.itemCategoryWorn
                  ]}>
                    {item.category}
                  </Text>
                  <View style={styles.itemColors}>
                    {item.colors.slice(0, 3).map((color, colorIndex) => (
                      <View
                        key={colorIndex}
                        style={[
                          styles.colorDot, 
                          { backgroundColor: color.toLowerCase() },
                          isWorn && styles.colorDotWorn
                        ]}
                      />
                    ))}
                  </View>
                  {item.tags.length > 0 && (
                    <Text style={[
                      styles.itemTags,
                      isWorn && styles.itemTagsWorn
                    ]}>
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
            Great progress! You're rediscovering the gems in your closet. 
            Keep going to unlock your reward!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_THEME_V2.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: APP_THEME_V2.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: APP_THEME_V2.colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: APP_THEME_V2.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noChallengeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noChallengeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: APP_THEME_V2.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noChallengeText: {
    fontSize: 16,
    color: APP_THEME_V2.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: APP_THEME_V2.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: APP_THEME_V2.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME_V2.colors.textPrimary,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_THEME_V2.colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: APP_THEME_V2.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: APP_THEME_V2.colors.textSecondary,
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: APP_THEME_V2.colors.textSecondary,
    marginLeft: 4,
  },
  completedContainer: {
    backgroundColor: `${APP_THEME_V2.colors.success}20`,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME_V2.colors.success,
    marginTop: 8,
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: APP_THEME_V2.colors.success,
    textAlign: 'center',
  },
  itemsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_THEME_V2.colors.textPrimary,
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: APP_THEME_V2.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  itemCardWorn: {
    opacity: 0.7,
  },
  itemCardCompleted: {
    borderWidth: 2,
    borderColor: APP_THEME_V2.colors.success,
  },
  itemImage: {
    width: '100%',
    height: 120,
    backgroundColor: APP_THEME_V2.colors.border,
  },
  wornOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: APP_THEME_V2.colors.success,
    borderRadius: 12,
    padding: 4,
  },
  itemInfo: {
    padding: 12,
  },
  itemCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_THEME_V2.colors.textPrimary,
    marginBottom: 4,
  },
  itemCategoryWorn: {
    color: APP_THEME_V2.colors.textSecondary,
  },
  itemColors: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.border,
  },
  colorDotWorn: {
    opacity: 0.6,
  },
  itemTags: {
    fontSize: 12,
    color: APP_THEME_V2.colors.textSecondary,
  },
  itemTagsWorn: {
    color: APP_THEME_V2.colors.textSecondary,
    opacity: 0.6,
  },
  encouragementContainer: {
    backgroundColor: APP_THEME_V2.colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  encouragementText: {
    fontSize: 16,
    color: APP_THEME_V2.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
});