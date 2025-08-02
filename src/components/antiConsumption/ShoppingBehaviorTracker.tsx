import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { antiConsumptionService, ShoppingBehaviorData } from '@/services/antiConsumptionService';
import { DesignSystem } from '@/theme/DesignSystem';

interface ShoppingBehaviorTrackerProps {
  userId: string;
  onBehaviorTracked?: (data: ShoppingBehaviorData) => void;
}

export const ShoppingBehaviorTracker: React.FC<ShoppingBehaviorTrackerProps> = ({
  userId,
  onBehaviorTracked,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [behaviorData, setBehaviorData] = useState<ShoppingBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBehaviorData();
  }, [userId]);

  const loadBehaviorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await antiConsumptionService.trackShoppingBehavior(userId);
      setBehaviorData(data);
      onBehaviorTracked?.(data);
    } catch (err) {
      setError('Failed to load shopping behavior data');
      console.error('Error loading shopping behavior data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStreakMessage = (days: number): string => {
    if (days === 0) return "Ready for a fresh start!";
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} strong!`;
    if (days < 30) return `${days} days of mindful choices!`;
    if (days < 90) return `${Math.floor(days / 7)} weeks of conscious living!`;
    return `${Math.floor(days / 30)} months of sustainable style!`;
  };

  const getReductionColor = (percentage: number): string => {
    if (percentage > 50) return DesignSystem.colors.success[500];
    if (percentage > 20) return DesignSystem.colors.warning[500];
    if (percentage > 0) return DesignSystem.colors.primary[500];
    return DesignSystem.colors.error[500];
  };

  const getReductionIcon = (percentage: number): string => {
    if (percentage > 50) return 'leaf';
    if (percentage > 20) return 'trending-down';
    if (percentage > 0) return 'remove';
    return 'trending-up';
  };

  const showCelebration = () => {
    if (!behaviorData) return;

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
      message = 'Every mindful choice counts. You\'re building a more sustainable relationship with fashion.';
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
          <TouchableOpacity style={styles.retryButton} onPress={loadBehaviorData}>
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
          <TouchableOpacity style={styles.celebrateButton} onPress={showCelebration}>
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
              name={reductionIcon} 
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
              <Ionicons name="calendar-outline" size={20} color={DesignSystem.colors.primary[500]} />
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
                Excellent progress! You're successfully reducing impulse purchases.
              </Text>
            </View>
          )}
          
          {behaviorData.streakDays > 14 && (
            <View style={styles.insightItem}>
              <Ionicons name="checkmark-circle" size={16} color={DesignSystem.colors.primary[500]} />
              <Text style={styles.insightText}>
                You're building strong mindful shopping habits. Keep it up!
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
              <Ionicons name="information-circle" size={16} color={DesignSystem.colors.primary[500]} />
              <Text style={styles.insightText}>
                Consider using the "Shop Your Closet First" feature before making purchases.
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

const createStyles = (colors: any) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
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
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: colors.text.secondary,
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
    backgroundColor: `${colors.semantic.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  streakContainer: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  streakContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakDays: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.semantic.success,
    marginBottom: 8,
  },
  streakLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  streakMessage: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
  celebrateButton: {
    backgroundColor: colors.semantic.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  celebrateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  comparisonContainer: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonCard: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  comparisonLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  comparisonArrow: {
    marginHorizontal: 20,
  },
  reductionContainer: {
    alignItems: 'center',
  },
  reductionPercentage: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  reductionLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  savingsContainer: {
    backgroundColor: `${colors.semantic.success}20`,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.semantic.success,
    marginLeft: 8,
  },
  savingsAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.semantic.success,
    marginBottom: 8,
  },
  savingsDescription: {
    fontSize: 14,
    color: colors.semantic.success,
    textAlign: 'center',
  },
  achievementsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    backgroundColor: colors.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    marginRight: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    marginLeft: 6,
  },
  insightsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  insightsList: {
    marginTop: 0,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  lastPurchaseContainer: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  lastPurchaseLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  lastPurchaseDate: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
});