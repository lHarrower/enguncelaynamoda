import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { efficiencyScoreService, EfficiencyScore } from '@/services/efficiencyScoreService';
import { useAuth } from '@/hooks/useAuth';
import { logInDev } from '@/utils/consoleSuppress';

const { width } = Dimensions.get('window');

interface EfficiencyScoreDashboardProps {
  onGoalPress?: () => void;
  onInsightPress?: (insight: string) => void;
}

export const EfficiencyScoreDashboard: React.FC<EfficiencyScoreDashboardProps> = ({
  onGoalPress,
  onInsightPress
}) => {
  const { user } = useAuth();
  const [efficiencyScore, setEfficiencyScore] = useState<EfficiencyScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadEfficiencyScore();
    }
  }, [user?.id]);

  const loadEfficiencyScore = async () => {
    try {
      setLoading(true);
      setError(null);
      const score = await efficiencyScoreService.calculateEfficiencyScore(user!.id);
      setEfficiencyScore(score);
      
      // Store the score for historical tracking
      await efficiencyScoreService.storeEfficiencyScore(user!.id, score);
    } catch (err) {
      logInDev('Failed to load efficiency score:', err);
      setError('Failed to load efficiency score');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreGradient = (score: number): readonly [string, string] => {
    if (score >= 80) return ['#4CAF50', '#66BB6A'] as const;
    if (score >= 60) return ['#FF9800', '#FFB74D'] as const;
    return ['#F44336', '#EF5350'] as const;
  };

  const getTrendIcon = (trajectory: string): string => {
    switch (trajectory) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trajectory: string): string => {
    switch (trajectory) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderOverallScore = () => {
    if (!efficiencyScore) return null;

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
              <Ionicons
                name={getTrendIcon(trends.trajectory) as any}
                size={16}
                color="white"
              />
              <Text style={styles.trendText}>
                {trends.monthlyChange > 0 ? '+' : ''}{trends.monthlyChange} this month
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderCategoryScores = () => {
    if (!efficiencyScore) return null;

    const categories = [
      { key: 'utilization', label: 'Utilization', icon: 'shirt-outline' },
      { key: 'costEfficiency', label: 'Cost Efficiency', icon: 'cash-outline' },
      { key: 'sustainability', label: 'Sustainability', icon: 'leaf-outline' },
      { key: 'versatility', label: 'Versatility', icon: 'shuffle-outline' },
      { key: 'curation', label: 'Curation', icon: 'star-outline' }
    ];

    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => {
            const score = efficiencyScore.breakdown[category.key as keyof typeof efficiencyScore.breakdown];
            const isSelected = selectedCategory === category.key;
            
            return (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : category.key)}
              >
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={category.icon as any}
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
                        backgroundColor: getScoreColor(score)
                      }
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
    if (!efficiencyScore) return null;

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
    if (!efficiencyScore) return null;

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
    <TouchableOpacity style={styles.goalsButton} onPress={onGoalPress}>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadEfficiencyScore}>
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  overallScoreContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  overallScoreGradient: {
    padding: 24
  },
  overallScoreContent: {
    alignItems: 'center'
  },
  overallScoreLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9
  },
  overallScoreValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  trendText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.9
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16
  },
  categoriesContainer: {
    margin: 20,
    marginTop: 0
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: '#6366F1'
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B'
  },
  categoryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 2
  },
  insightsContainer: {
    margin: 20,
    marginTop: 0
  },
  insightSection: {
    marginBottom: 20
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  insightSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8
  },
  insightItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  insightText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20
  },
  benchmarksContainer: {
    margin: 20,
    marginTop: 0
  },
  benchmarkCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  benchmarkItem: {
    alignItems: 'center'
  },
  benchmarkLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4
  },
  benchmarkValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4
  },
  benchmarkSubtext: {
    fontSize: 12,
    color: '#94A3B8'
  },
  goalsButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  goalsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  goalsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8
  }
});

export default EfficiencyScoreDashboard;