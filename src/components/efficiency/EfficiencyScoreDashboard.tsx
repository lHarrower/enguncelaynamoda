import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { EfficiencyScore, efficiencyScoreService } from '@/services/efficiencyScoreService';
import { IoniconsName } from '@/types/icons';
import { logInDev } from '@/utils/consoleSuppress';

const { width } = Dimensions.get('window');

interface EfficiencyScoreDashboardProps {
  onGoalPress?: () => void;
  onInsightPress?: (insight: string) => void;
}

export const EfficiencyScoreDashboard: React.FC<EfficiencyScoreDashboardProps> = ({
  onGoalPress,
  onInsightPress,
}) => {
  const { user } = useAuth();
  const [efficiencyScore, setEfficiencyScore] = useState<EfficiencyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadEfficiencyScore = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const score = await efficiencyScoreService.calculateEfficiencyScore(user.id);
      setEfficiencyScore(score);

      // Store the score for historical tracking
      await efficiencyScoreService.storeEfficiencyScore(user.id, score);
    } catch (err) {
      logInDev('Failed to load efficiency score:', err instanceof Error ? err : String(err));
      setError('Failed to load efficiency score');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadEfficiencyScore();
  }, [loadEfficiencyScore]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) {
      return '#4CAF50';
    } // Green
    if (score >= 60) {
      return '#FF9800';
    } // Orange
    return '#F44336'; // Red
  };

  const getScoreGradient = (score: number): readonly [string, string] => {
    if (score >= 80) {
      return ['#4CAF50', '#66BB6A'] as const;
    }
    if (score >= 60) {
      return ['#FF9800', '#FFB74D'] as const;
    }
    return ['#F44336', '#EF5350'] as const;
  };

  const getTrendIcon = (trajectory: string): IoniconsName => {
    switch (trajectory) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trajectory: string): string => {
    switch (trajectory) {
      case 'improving':
        return '#4CAF50';
      case 'declining':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderOverallScore = () => {
    if (!efficiencyScore) {
      return null;
    }

    const { overall, trends } = efficiencyScore;
    const scoreColor = getScoreColor(overall);
    const gradient = getScoreGradient(overall);

    return (
      <View style={styles.overallScoreContainer}>
        <LinearGradient
          colors={gradient}
          style={styles.overallScoreGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.overallScoreContent}>
            <Text style={styles.overallScoreLabel}>Efficiency Score</Text>
            <Text style={styles.overallScoreValue}>{overall}</Text>
            <View style={styles.trendContainer}>
              <Ionicons name={getTrendIcon(trends.trajectory)} size={16} color="white" />
              <Text style={styles.trendText}>
                {trends.monthlyChange > 0 ? '+' : ''}
                {trends.monthlyChange} this month
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderCategoryScores = () => {
    if (!efficiencyScore) {
      return null;
    }

    const categories = [
      { key: 'utilization', label: 'Utilization', icon: 'shirt-outline' },
      { key: 'costEfficiency', label: 'Cost Efficiency', icon: 'cash-outline' },
      { key: 'sustainability', label: 'Sustainability', icon: 'leaf-outline' },
      { key: 'versatility', label: 'Versatility', icon: 'shuffle-outline' },
      { key: 'curation', label: 'Curation', icon: 'star-outline' },
    ];

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => {
            const score =
              efficiencyScore.breakdown[category.key as keyof typeof efficiencyScore.breakdown];
            const isSelected = selectedCategory === category.key;

            return (
              <TouchableOpacity
                key={category.key}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => setSelectedCategory(isSelected ? null : category.key)}
                accessibilityRole="button"
                accessibilityLabel={`${category.label} category with score ${score}`}
                accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} ${category.label} category`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={category.icon as IoniconsName}
                    size={20}
                    color={getScoreColor(score)}
                  />
                  <Text style={styles.categoryScore}>{score}</Text>
                </View>
                <Text style={styles.categoryLabel}>{category.label}</Text>
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgress,
                      {
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score),
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    if (!efficiencyScore) {
      return null;
    }

    const { insights } = efficiencyScore;

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Insights & Recommendations</Text>

        {insights.strengths.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.insightSectionTitle}>Strengths</Text>
            </View>
            {insights.strengths.map((strength, index) => (
              <TouchableOpacity
                key={index}
                style={styles.insightItem}
                onPress={() => onInsightPress?.(strength)}
                accessibilityRole="button"
                accessibilityLabel={`Strength insight: ${strength}`}
                accessibilityHint="Tap to view more details about this strength"
              >
                <Text style={styles.insightText}>{strength}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {insights.improvements.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="arrow-up-circle" size={20} color="#FF9800" />
              <Text style={styles.insightSectionTitle}>Areas for Improvement</Text>
            </View>
            {insights.improvements.map((improvement, index) => (
              <TouchableOpacity
                key={index}
                style={styles.insightItem}
                onPress={() => onInsightPress?.(improvement)}
                accessibilityRole="button"
                accessibilityLabel={`Improvement area: ${improvement}`}
                accessibilityHint="Tap to view more details about this improvement area"
              >
                <Text style={styles.insightText}>{improvement}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {insights.recommendations.length > 0 && (
          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={20} color="#2196F3" />
              <Text style={styles.insightSectionTitle}>Recommendations</Text>
            </View>
            {insights.recommendations.map((recommendation, index) => (
              <TouchableOpacity
                key={index}
                style={styles.insightItem}
                onPress={() => onInsightPress?.(recommendation)}
                accessibilityRole="button"
                accessibilityLabel={`Recommendation: ${recommendation}`}
                accessibilityHint="Tap to view more details about this recommendation"
              >
                <Text style={styles.insightText}>{recommendation}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderBenchmarks = () => {
    if (!efficiencyScore) {
      return null;
    }

    const { benchmarks } = efficiencyScore;

    return (
      <View style={styles.benchmarksContainer}>
        <Text style={styles.sectionTitle}>Your Performance</Text>
        <View style={styles.benchmarkCard}>
          <View style={styles.benchmarkItem}>
            <Text style={styles.benchmarkLabel}>Your Percentile</Text>
            <Text style={styles.benchmarkValue}>{benchmarks.userPercentile}th</Text>
            <Text style={styles.benchmarkSubtext}>
              Better than {benchmarks.userPercentile}% of users
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderGoalsButton = () => (
    <TouchableOpacity
      style={styles.goalsButton}
      onPress={onGoalPress}
      accessibilityRole="button"
      accessibilityLabel="Set efficiency goals"
      accessibilityHint="Tap to create and manage your efficiency goals"
    >
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.goalsButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Ionicons name="flag" size={20} color="white" />
        <Text style={styles.goalsButtonText}>Set Efficiency Goals</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Calculating your efficiency score...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadEfficiencyScore}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          accessibilityHint="Tap to retry loading your efficiency score"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOverallScore()}
      {renderCategoryScores()}
      {renderInsights()}
      {renderBenchmarks()}
      {renderGoalsButton()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  benchmarkCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  benchmarkItem: {
    alignItems: 'center',
  },
  benchmarkLabel: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 4,
  },
  benchmarkSubtext: {
    color: '#94A3B8',
    fontSize: 12,
  },
  benchmarkValue: {
    color: '#6366F1',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benchmarksContainer: {
    margin: 20,
    marginTop: 0,
  },
  categoriesContainer: {
    margin: 20,
    marginTop: 0,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    width: (width - 60) / 2,
  },
  categoryCardSelected: {
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  categoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryLabel: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 8,
  },
  categoryProgress: {
    borderRadius: 2,
    height: '100%',
  },
  categoryProgressBar: {
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
  },
  categoryScore: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  goalsButton: {
    borderRadius: 12,
    elevation: 3,
    margin: 20,
    marginTop: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  goalsButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  goalsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  insightItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  insightSection: {
    marginBottom: 20,
  },
  insightSectionTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  insightsContainer: {
    margin: 20,
    marginTop: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  overallScoreContainer: {
    borderRadius: 16,
    elevation: 4,
    margin: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overallScoreContent: {
    alignItems: 'center',
  },
  overallScoreGradient: {
    padding: 24,
  },
  overallScoreLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  overallScoreValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trendContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  trendText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.9,
  },
});

export default EfficiencyScoreDashboard;
