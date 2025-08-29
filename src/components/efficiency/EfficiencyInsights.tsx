import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Replaced react-native-chart-kit with Victory wrapper
import PieChartWrapper from '@/components/charts/LineChart';
import { useEfficiencyScore } from '@/hooks/useEfficiencyScore';
import { EfficiencyMetrics, EfficiencyScore } from '@/services/efficiencyScoreService';
import { IoniconsName } from '@/types/icons';

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6366F1',
  },
};

interface EfficiencyInsightsProps {
  score?: EfficiencyScore;
  metrics?: EfficiencyMetrics;
  onActionPress?: (action: string, data?: Record<string, unknown>) => void;
}

export const EfficiencyInsights: React.FC<EfficiencyInsightsProps> = ({
  score,
  metrics,
  onActionPress,
}) => {
  const { efficiencyScore, refreshScore, getScoreColor, getGradeFromScore, getPerformanceLevel } =
    useEfficiencyScore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'trends' | 'breakdown' | 'recommendations'
  >('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const currentScore = score || efficiencyScore;
  const currentMetrics = metrics; // Hook does not expose metrics; rely on prop when provided
  const trends: Array<{ date: string; score: number; category?: string }> = []; // Timeseries trends not provided by hook; show empty state

  useEffect(() => {
    if (!currentScore || !currentMetrics) {
      refreshScore();
    }
  }, [currentScore, currentMetrics, refreshScore]);

  const getInsightIcon = (type: string): IoniconsName => {
    switch (type) {
      case 'utilization':
        return 'shirt-outline';
      case 'cost_efficiency':
        return 'cash-outline';
      case 'sustainability':
        return 'leaf-outline';
      case 'versatility':
        return 'shuffle-outline';
      case 'curation':
        return 'star-outline';
      case 'trend_up':
        return 'trending-up-outline';
      case 'trend_down':
        return 'trending-down-outline';
      case 'warning':
        return 'warning-outline';
      case 'success':
        return 'checkmark-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getInsightColor = (type: string): string => {
    switch (type) {
      case 'trend_up':
      case 'success':
        return '#10B981';
      case 'trend_down':
      case 'warning':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const renderOverviewTab = () => {
    if (!currentScore || !currentMetrics) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      );
    }

    const categoryData = [
      { name: 'Utilization', score: currentScore.breakdown.utilization, color: '#6366F1' },
      { name: 'Cost Efficiency', score: currentScore.breakdown.costEfficiency, color: '#10B981' },
      { name: 'Sustainability', score: currentScore.breakdown.sustainability, color: '#F59E0B' },
      { name: 'Versatility', score: currentScore.breakdown.versatility, color: '#EF4444' },
      { name: 'Curation', score: currentScore.breakdown.curation, color: '#8B5CF6' },
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Overall Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.scoreGradient}>
            <Text style={styles.scoreTitle}>Overall Efficiency</Text>
            <Text style={styles.scoreValue}>{currentScore.overall}</Text>
            <Text style={styles.scoreGrade}>{getGradeFromScore(currentScore.overall)}</Text>
            <Text style={styles.scoreLevel}>{getPerformanceLevel(currentScore.overall)}</Text>
          </LinearGradient>
        </View>

        {/* Category Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryGrid}>
            {categoryData.map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Ionicons
                    name={getInsightIcon(category.name.toLowerCase().replace(' ', '_'))}
                    size={20}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={[styles.categoryScore, { color: category.color }]}>
                  {category.score}
                </Text>
                <View style={styles.categoryProgress}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: '100%',
                        transform: [{ scaleX: category.score / 100 }],
                        backgroundColor: category.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* Key Metrics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          {currentMetrics ? (
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {Math.round(currentMetrics.wardrobeUtilization.utilizationRate)}%
                </Text>
                <Text style={styles.metricLabel}>Wardrobe Utilization</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  ${currentMetrics.costEfficiency.averageCostPerWear.toFixed(2)}
                </Text>
                <Text style={styles.metricLabel}>Avg Cost Per Wear</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {Math.round(currentMetrics.versatility.averageOutfitsPerItem)}
                </Text>
                <Text style={styles.metricLabel}>Avg Outfits per Item</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {Math.round(currentMetrics.sustainability.careCompliance * 100)}%
                </Text>
                <Text style={styles.metricLabel}>Care Compliance</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#64748B' }}>Metrics unavailable.</Text>
          )}
        </View>

        {/* Quick Insights */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Insights</Text>
          {(() => {
            const quick: Array<{ title: string; type: string }> = [];
            const strengths = currentScore.insights?.strengths || [];
            const improvements = currentScore.insights?.improvements || [];
            const recommendations = currentScore.insights?.recommendations || [];
            strengths.slice(0, 1).forEach((s: string) => quick.push({ title: s, type: 'success' }));
            improvements
              .slice(0, 1)
              .forEach((s: string) => quick.push({ title: s, type: 'warning' }));
            recommendations
              .slice(0, 1)
              .forEach((s: string) => quick.push({ title: s, type: 'info' }));
            return quick.slice(0, 3).map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Ionicons
                    name={getInsightIcon(insight.type)}
                    size={20}
                    color={getInsightColor(insight.type)}
                  />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
              </View>
            ));
          })()}
        </View>
      </ScrollView>
    );
  };

  const renderTrendsTab = () => {
    if (!currentScore) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="trending-up-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Trend Data</Text>
          <Text style={styles.emptyStateText}>
            Use AYNAMODA for a few weeks to see your efficiency trends
          </Text>
        </View>
      );
    }

    const isImproving = currentScore.trends.trajectory === 'improving';
    const isDeclining = currentScore.trends.trajectory === 'declining';

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trend Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Monthly Change</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: currentScore.trends.monthlyChange >= 0 ? '#10B981' : '#EF4444' },
                ]}
              >
                {currentScore.trends.monthlyChange >= 0 ? '+' : ''}
                {currentScore.trends.monthlyChange}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Yearly Change</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: currentScore.trends.yearlyChange >= 0 ? '#10B981' : '#EF4444' },
                ]}
              >
                {currentScore.trends.yearlyChange >= 0 ? '+' : ''}
                {currentScore.trends.yearlyChange}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Trajectory</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name={
                    isImproving
                      ? 'trending-up-outline'
                      : isDeclining
                        ? 'trending-down-outline'
                        : 'remove-outline'
                  }
                  size={20}
                  color={isImproving ? '#10B981' : isDeclining ? '#EF4444' : '#64748B'}
                />
                <Text style={[styles.metricValue, { marginLeft: 8 }]}>
                  {currentScore.trends.trajectory.charAt(0).toUpperCase() +
                    currentScore.trends.trajectory.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderBreakdownTab = () => {
    if (!currentScore) {
      return null;
    }

    const breakdownData = [
      {
        name: 'Utilization',
        score: currentScore.breakdown.utilization,
        color: '#6366F1',
        legendFontColor: '#1E293B',
        legendFontSize: 12,
      },
      {
        name: 'Cost Efficiency',
        score: currentScore.breakdown.costEfficiency,
        color: '#10B981',
        legendFontColor: '#1E293B',
        legendFontSize: 12,
      },
      {
        name: 'Sustainability',
        score: currentScore.breakdown.sustainability,
        color: '#F59E0B',
        legendFontColor: '#1E293B',
        legendFontSize: 12,
      },
      {
        name: 'Versatility',
        score: currentScore.breakdown.versatility,
        color: '#EF4444',
        legendFontColor: '#1E293B',
        legendFontSize: 12,
      },
      {
        name: 'Curation',
        score: currentScore.breakdown.curation,
        color: '#8B5CF6',
        legendFontColor: '#1E293B',
        legendFontSize: 12,
      },
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Breakdown Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Score Breakdown</Text>
          <PieChartWrapper
            data={breakdownData.map((d) => ({ name: d.name, score: d.score, color: d.color }))}
            width={width - 40}
            height={220}
            accessibilityLabel="Score breakdown chart"
          />
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Detailed Analysis</Text>
          {Object.entries(currentScore.breakdown as Record<string, number>).map(
            ([key, value], index) => {
              const categoryName =
                key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
              const color = breakdownData[index]?.color || '#6366F1';
              const numValue = value;

              return (
                <View key={key} style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <View style={styles.breakdownIconContainer}>
                      <View style={[styles.breakdownIcon, { backgroundColor: color + '20' }]}>
                        <Ionicons name={getInsightIcon(key)} size={20} color={color} />
                      </View>
                      <Text style={styles.breakdownName}>{categoryName}</Text>
                    </View>
                    <Text style={[styles.breakdownScore, { color }]}>{numValue}</Text>
                  </View>
                  <View style={styles.breakdownProgress}>
                    <View
                      style={[
                        styles.breakdownProgressFill,
                        {
                          width: '100%',
                          transform: [{ scaleX: (numValue || 0) / 100 }],
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.breakdownDescription}>
                    {getBreakdownDescription(key, numValue)}
                  </Text>
                </View>
              );
            },
          )}
        </View>
      </ScrollView>
    );
  };

  const renderRecommendationsTab = () => {
    if (!currentScore) {
      return null;
    }

    const recs = currentScore.insights.recommendations;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
          {recs.length === 0 && (
            <Text style={{ color: '#64748B' }}>No recommendations at the moment.</Text>
          )}
          {recs.map((text, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#F0F4FF' }]}>
                  <Ionicons name="bulb-outline" size={24} color="#6366F1" />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{text}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.recommendationAction}
                onPress={() => onActionPress?.('view_details', { text })}
              >
                <Text style={styles.recommendationActionText}>Take Action</Text>
                <Ionicons name="arrow-forward" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const getScoreLevel = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs improvement';
  };

  const getCategoryAdvice = (category: string, score: number): string => {
    const isGoodScore = score >= 60;

    const adviceMap: Record<string, { good: string; poor: string }> = {
      utilization: {
        good: "You're making good use of your items.",
        poor: 'Consider wearing neglected pieces more often.',
      },
      costEfficiency: {
        good: "You're getting good value from your purchases.",
        poor: 'Focus on cost-per-wear optimization.',
      },
      sustainability: {
        good: "You're taking good care of your items.",
        poor: 'Improve item care and longevity.',
      },
      versatility: {
        good: 'You create diverse outfit combinations.',
        poor: 'Experiment with new styling approaches.',
      },
      curation: {
        good: 'You have a well-curated collection.',
        poor: 'Focus on quality over quantity.',
      },
    };

    const advice = adviceMap[category];
    return advice ? (isGoodScore ? advice.good : advice.poor) : '';
  };

  const getCategoryLabel = (category: string): string => {
    const labelMap: Record<string, string> = {
      utilization: 'wardrobe utilization',
      costEfficiency: 'cost efficiency',
      sustainability: 'sustainability practices',
      versatility: 'outfit versatility',
      curation: 'wardrobe curation',
    };

    return labelMap[category] || 'this category';
  };

  const getBreakdownDescription = (category: string, score: number): string => {
    const level = getScoreLevel(score);
    const categoryLabel = getCategoryLabel(category);
    const advice = getCategoryAdvice(category, score);

    return `Your ${categoryLabel} is ${level}. ${advice}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'trends':
        return renderTrendsTab();
      case 'breakdown':
        return renderBreakdownTab();
      case 'recommendations':
        return renderRecommendationsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Overview', icon: 'analytics-outline' },
            { key: 'trends', label: 'Trends', icon: 'trending-up-outline' },
            { key: 'breakdown', label: 'Breakdown', icon: 'pie-chart-outline' },
            { key: 'recommendations', label: 'Tips', icon: 'bulb-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() =>
                setActiveTab(tab.key as 'overview' | 'trends' | 'breakdown' | 'recommendations')
              }
            >
              <Ionicons
                name={tab.icon as IoniconsName}
                size={20}
                color={activeTab === tab.key ? '#6366F1' : '#64748B'}
              />
              <Text
                style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  breakdownDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  breakdownHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  breakdownIconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  breakdownItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  breakdownName: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownProgress: {
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    height: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  breakdownProgressFill: {
    borderRadius: 3,
    height: '100%',
  },
  breakdownScore: {
    fontSize: 20,
    fontWeight: 'bold',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 8,
    width: 40,
  },
  categoryName: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  categoryProgress: {
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    borderRadius: 2,
    height: '100%',
  },
  categoryScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyStateTitle: {
    color: '#1E293B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  insightAction: {
    alignSelf: 'flex-start',
  },
  insightActionText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  insightContent: {
    flex: 1,
  },
  insightDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  insightIcon: {
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  insightTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#64748B',
    fontSize: 16,
  },
  metricCard: {
    alignItems: 'center',
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
  metricLabel: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  metricValue: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recommendationAction: {
    alignItems: 'center',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  recommendationActionText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  recommendationIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  recommendationImpact: {
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
  },
  recommendationImpactLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  recommendationImpactValue: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  scoreGrade: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreGradient: {
    alignItems: 'center',
    padding: 24,
  },
  scoreLevel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  scoreTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.9,
  },
  scoreValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: '#F0F4FF',
  },
  tabButtonText: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 6,
  },
  tabButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabNavigation: {
    backgroundColor: 'white',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  timeRangeButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#6366F1',
  },
  timeRangeButtonText: {
    color: '#64748B',
    fontSize: 14,
  },
  timeRangeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  timeRangeSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 4,
  },
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  trendDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  trendHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  trendTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EfficiencyInsights;
