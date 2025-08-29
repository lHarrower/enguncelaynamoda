import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import { antiConsumptionService, ShoppingBehaviorData } from '@/services/antiConsumptionService';
import { DesignSystem } from '@/theme/DesignSystem';
import { errorInDev } from '@/utils/consoleSuppress';

interface ShoppingBehaviorTrackerProps {
  userId: string;
  onBehaviorTracked?: (data: ShoppingBehaviorData) => void;
}

export const ShoppingBehaviorTracker: React.FC<ShoppingBehaviorTrackerProps> = ({
  userId,
  onBehaviorTracked,
}) => {
  const theme = useSafeTheme();
  const styles = createStyles(DesignSystem.colors);
  const [behaviorData, setBehaviorData] = useState<ShoppingBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBehaviorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await antiConsumptionService.trackShoppingBehavior(userId);
      setBehaviorData(data);
      onBehaviorTracked?.(data);
    } catch (err) {
      setError('Failed to load shopping behavior data');
      errorInDev('Error loading shopping behavior data:', err instanceof Error ? err : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadBehaviorData();
  }, [loadBehaviorData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStreakMessage = (days: number): string => {
    if (days === 0) {
      return 'Ready for a fresh start!';
    }
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} strong!`;
    }
    if (days < 30) {
      return `${days} days of mindful choices!`;
    }
    if (days < 90) {
      return `${Math.floor(days / 7)} weeks of conscious living!`;
    }
    return `${Math.floor(days / 30)} months of sustainable style!`;
  };

  const getReductionColor = (percentage: number): string => {
    if (percentage > 50) {
      return DesignSystem.colors.success[500] || '#16A34A';
    }
    if (percentage > 20) {
      return DesignSystem.colors.warning[500] || '#F59E0B';
    }
    if (percentage > 0) {
      return DesignSystem.colors.primary[500] || '#007AFF';
    }
    return DesignSystem.colors.error[500] || '#DC2626';
  };

  const getReductionIcon = (percentage: number): string => {
    if (percentage > 50) {
      return 'leaf';
    }
    if (percentage > 20) {
      return 'trending-down';
    }
    if (percentage > 0) {
      return 'remove';
    }
    return 'trending-up';
  };

  const showCelebration = () => {
    if (!behaviorData) {
      return;
    }

    let message = '';
    let title = '';

    if (behaviorData.reductionPercentage > 50) {
      title = '🌟 Sustainability Champion!';
      message = `You've reduced shopping by ${Math.round(behaviorData.reductionPercentage)}%! You're making a real impact on both your wallet and the planet.`;
    } else if (behaviorData.streakDays > 30) {
      title = '🎉 One Month Strong!';
      message = `${behaviorData.streakDays} days without shopping! You're building amazing mindful habits.`;
    } else if (behaviorData.totalSavings > 100) {
      title = '💰 Money Saved!';
      message = `You've saved ${formatCurrency(behaviorData.totalSavings)} by shopping your closet first!`;
    } else {
      title = '✨ Keep Going!';
      message =
        "Every mindful choice counts. You're building a more sustainable relationship with fashion.";
    }

    Alert.alert(title, message, [{ text: 'Amazing!', style: 'default' }]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Tracking your shopping behavior...</Text>
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
            onPress={() => void loadBehaviorData()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Retry loading shopping behavior data"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!behaviorData) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Ionicons name="bag-outline" size={48} color={DesignSystem.colors.neutral[600]} />
          <Text style={styles.noDataTitle}>No Shopping Data</Text>
          <Text style={styles.noDataText}>
            Start tracking your purchases to see your mindful shopping progress!
          </Text>
        </View>
      </View>
    );
  }

  const reductionColor = getReductionColor(behaviorData.reductionPercentage);
  const reductionIcon = getReductionIcon(behaviorData.reductionPercentage);
  const streakMessage = getStreakMessage(behaviorData.streakDays);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={24} color={DesignSystem.colors.success[500]} />
        </View>
        <Text style={styles.title}>Mindful Shopping</Text>
        <Text style={styles.subtitle}>Your sustainable fashion journey</Text>
      </View>

      {/* Streak Counter */}
      <View style={styles.streakContainer}>
        <View style={styles.streakContent}>
          <Text style={styles.streakDays}>{behaviorData.streakDays}</Text>
          <Text style={styles.streakLabel}>Days Without Shopping</Text>
          <Text style={styles.streakMessage}>{streakMessage}</Text>
        </View>
        {behaviorData.streakDays > 7 && (
          <TouchableOpacity
            style={styles.celebrateButton}
            onPress={showCelebration}
            accessibilityRole="button"
            accessibilityLabel="Celebrate achievement"
            accessibilityHint="Show celebration message for your shopping streak"
          >
            <Ionicons name="sparkles" size={16} color="white" />
            <Text style={styles.celebrateButtonText}>Celebrate</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Monthly Comparison */}
      <View style={styles.comparisonContainer}>
        <Text style={styles.sectionTitle}>This Month vs Last Month</Text>

        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonValue}>{behaviorData.monthlyPurchases}</Text>
            <Text style={styles.comparisonLabel}>This Month</Text>
          </View>

          <View style={styles.comparisonArrow}>
            <Ionicons
              name={reductionIcon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={reductionColor}
            />
          </View>

          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonValue}>{behaviorData.previousMonthPurchases}</Text>
            <Text style={styles.comparisonLabel}>Last Month</Text>
          </View>
        </View>

        <View style={styles.reductionContainer}>
          <Text style={[styles.reductionPercentage, { color: reductionColor }]}>
            {behaviorData.reductionPercentage > 0 ? '-' : '+'}
            {Math.abs(Math.round(behaviorData.reductionPercentage))}%
          </Text>
          <Text style={styles.reductionLabel}>
            {behaviorData.reductionPercentage > 0 ? 'Reduction' : 'Increase'}
          </Text>
        </View>
      </View>

      {/* Savings */}
      {behaviorData.totalSavings > 0 && (
        <View style={styles.savingsContainer}>
          <View style={styles.savingsHeader}>
            <Ionicons name="wallet-outline" size={20} color={DesignSystem.colors.success[500]} />
            <Text style={styles.savingsTitle}>Money Saved</Text>
          </View>
          <Text style={styles.savingsAmount}>{formatCurrency(behaviorData.totalSavings)}</Text>
          <Text style={styles.savingsDescription}>
            By shopping your closet first and making mindful choices
          </Text>
        </View>
      )}

      {/* Achievements */}
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsList}>
          {behaviorData.streakDays >= 7 && (
            <View style={styles.achievementItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={DesignSystem.colors.primary[500]}
              />
              <Text style={styles.achievementText}>7-Day Mindful Streak</Text>
            </View>
          )}

          {behaviorData.streakDays >= 30 && (
            <View style={styles.achievementItem}>
              <Ionicons name="trophy-outline" size={20} color={DesignSystem.colors.warning[500]} />
              <Text style={styles.achievementText}>30-Day Champion</Text>
            </View>
          )}

          {behaviorData.reductionPercentage > 25 && (
            <View style={styles.achievementItem}>
              <Ionicons name="leaf" size={20} color={DesignSystem.colors.success[500]} />
              <Text style={styles.achievementText}>Eco Warrior</Text>
            </View>
          )}

          {behaviorData.totalSavings > 100 && (
            <View style={styles.achievementItem}>
              <Ionicons name="wallet" size={20} color={DesignSystem.colors.error[500]} />
              <Text style={styles.achievementText}>Money Saver</Text>
            </View>
          )}

          {behaviorData.streakDays >= 90 && (
            <View style={styles.achievementItem}>
              <Ionicons name="star" size={20} color={DesignSystem.colors.warning[500]} />
              <Text style={styles.achievementText}>Lifestyle Master</Text>
            </View>
          )}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightsList}>
          {behaviorData.reductionPercentage > 20 && (
            <View style={styles.insightItem}>
              <Ionicons name="trending-down" size={16} color={DesignSystem.colors.success[500]} />
              <Text style={styles.insightText}>
                Excellent progress! You&apos;re successfully reducing impulse purchases.
              </Text>
            </View>
          )}

          {behaviorData.streakDays > 14 && (
            <View style={styles.insightItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={DesignSystem.colors.primary[500]}
              />
              <Text style={styles.insightText}>
                You&apos;re building strong mindful shopping habits. Keep it up!
              </Text>
            </View>
          )}

          {behaviorData.monthlyPurchases === 0 && (
            <View style={styles.insightItem}>
              <Ionicons name="star" size={16} color={DesignSystem.colors.warning[500]} />
              <Text style={styles.insightText}>
                Perfect month! You found everything you needed in your existing wardrobe.
              </Text>
            </View>
          )}

          {behaviorData.reductionPercentage < 0 && (
            <View style={styles.insightItem}>
              <Ionicons
                name="information-circle"
                size={16}
                color={DesignSystem.colors.primary[500]}
              />
              <Text style={styles.insightText}>
                Consider using the &quot;Shop Your Closet First&quot; feature before making
                purchases.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Last Purchase Info */}
      {behaviorData.lastPurchaseDate && (
        <View style={styles.lastPurchaseContainer}>
          <Text style={styles.lastPurchaseLabel}>Last Purchase</Text>
          <Text style={styles.lastPurchaseDate}>
            {new Date(behaviorData.lastPurchaseDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: typeof DesignSystem.colors) =>
  StyleSheet.create({
    achievementItem: {
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 20,
      flexDirection: 'row',
      marginBottom: 8,
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    achievementText: {
      color: colors.text.primary,
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 6,
    },
    achievementsContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },

    achievementsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    celebrateButton: {
      alignItems: 'center',
      backgroundColor: colors.semantic.success,
      borderRadius: 20,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    celebrateButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    comparisonArrow: {
      marginHorizontal: 20,
    },
    comparisonCard: {
      alignItems: 'center',
      flex: 1,
    },
    comparisonContainer: {
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      marginBottom: 20,
      marginHorizontal: 20,
      padding: 20,
    },
    comparisonGrid: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    comparisonLabel: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    comparisonValue: {
      color: colors.text.primary,
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 4,
    },
    container: {
      backgroundColor: colors.background.primary,
      flex: 1,
    },
    errorContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    errorText: {
      color: colors.text.secondary,
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
      backgroundColor: `${colors.semantic.success}20`,
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      marginBottom: 12,
      width: 48,
    },
    insightItem: {
      alignItems: 'flex-start',
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      flexDirection: 'row',
      marginBottom: 12,
      padding: 16,
    },
    insightText: {
      color: colors.text.primary,
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      marginLeft: 12,
    },
    insightsContainer: {
      marginBottom: 20,
      marginHorizontal: 20,
    },
    insightsList: {
      marginTop: 0,
    },
    lastPurchaseContainer: {
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginBottom: 40,
      marginHorizontal: 20,
      padding: 16,
    },
    lastPurchaseDate: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '500',
    },
    lastPurchaseLabel: {
      color: colors.text.secondary,
      fontSize: 14,
      marginBottom: 4,
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    loadingText: {
      color: colors.text.secondary,
      fontSize: 16,
      textAlign: 'center',
    },
    noDataContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    noDataText: {
      color: colors.text.secondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    noDataTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 16,
    },
    reductionContainer: {
      alignItems: 'center',
    },
    reductionLabel: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    reductionPercentage: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    retryButton: {
      backgroundColor: colors.primary[500],
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    savingsAmount: {
      color: colors.semantic.success,
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
    },
    savingsContainer: {
      alignItems: 'center',
      backgroundColor: `${colors.semantic.success}20`,
      borderRadius: 16,
      marginBottom: 20,
      marginHorizontal: 20,
      padding: 20,
    },
    savingsDescription: {
      color: colors.semantic.success,
      fontSize: 14,
      textAlign: 'center',
    },
    savingsHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 8,
    },
    savingsTitle: {
      color: colors.semantic.success,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
    },
    streakContainer: {
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      marginBottom: 20,
      marginHorizontal: 20,
      padding: 24,
    },
    streakContent: {
      alignItems: 'center',
      marginBottom: 16,
    },
    streakDays: {
      color: colors.semantic.success,
      fontSize: 48,
      fontWeight: '700',
      marginBottom: 8,
    },
    streakLabel: {
      color: colors.text.secondary,
      fontSize: 16,
      marginBottom: 4,
    },
    streakMessage: {
      color: colors.text.primary,
      fontSize: 14,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: 16,
    },
    title: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
  });
