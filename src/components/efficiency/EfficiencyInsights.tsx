import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEfficiencyScore } from '@/hooks/useEfficiencyScore';
import { EfficiencyScore, EfficiencyMetrics } from '@/services/efficiencyScoreService';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6366F1'
  }
};

interface EfficiencyInsightsProps {
  score?: EfficiencyScore;
  metrics?: EfficiencyMetrics;
  onActionPress?: (action: string, data?: any) => void;
}

export const EfficiencyInsights: React.FC<EfficiencyInsightsProps> = ({
  score,
  metrics,
  onActionPress
}) => {
  const {
    efficiencyScore,
    efficiencyMetrics,
    trends,
    refreshScore,
    getScoreColor,
    getGrade,
    getPerformanceLevel
  } = useEfficiencyScore();

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown' | 'recommendations'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const currentScore = score || efficiencyScore;
  const currentMetrics = metrics || efficiencyMetrics;

  useEffect(() => {
    if (!currentScore || !currentMetrics) {
      refreshScore();
    }
  }, []);

  const getInsightIcon = (type: string): string => {
    switch (type) {
      case 'utilization': return 'shirt-outline';
      case 'cost_efficiency': return 'cash-outline';
      case 'sustainability': return 'leaf-outline';
      case 'versatility': return 'shuffle-outline';
      case 'curation': return 'star-outline';
      case 'trend_up': return 'trending-up';
      case 'trend_down': return 'trending-down';
      case 'warning': return 'warning-outline';
      case 'success': return 'checkmark-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  const getInsightColor = (type: string): string => {
    switch (type) {
      case 'trend_up':
      case 'success': return '#10B981';
      case 'trend_down':
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6366F1';
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
      { name: 'Curation', score: currentScore.breakdown.curation, color: '#8B5CF6' }
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Overall Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreTitle}>Overall Efficiency</Text>
            <Text style={styles.scoreValue}>{currentScore.overall}</Text>
            <Text style={styles.scoreGrade}>{getGrade(currentScore.overall)}</Text>
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
                        width: `${category.score}%`,
                        backgroundColor: category.color
                      }
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
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{currentMetrics.wardrobeUtilization}%</Text>
              <Text style={styles.metricLabel}>Wardrobe Utilization</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${currentMetrics.averageCostPerWear.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Avg Cost Per Wear</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{currentMetrics.outfitVariety}</Text>
              <Text style={styles.metricLabel}>Outfit Combinations</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{currentMetrics.sustainabilityScore}%</Text>
              <Text style={styles.metricLabel}>Sustainability</Text>
            </View>
          </View>
        </View>

        {/* Quick Insights */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Insights</Text>
          {currentScore.insights.slice(0, 3).map((insight, index) => (
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
                <Text style={styles.insightDescription}>{insight.description}</Text>
                {insight.actionable && (
                  <TouchableOpacity
                    style={styles.insightAction}
                    onPress={() => onActionPress?.(insight.action || 'view_details', insight)}
                  >
                    <Text style={styles.insightActionText}>{insight.action || 'Learn More'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderTrendsTab = () => {
    if (!trends || trends.length === 0) {
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

    const chartData = {
      labels: trends.slice(-6).map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: trends.slice(-6).map(t => t.overall),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeButtonText,
                timeRange === range && styles.timeRangeButtonTextActive
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Efficiency Score Trend</Text>
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Trend Analysis */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trend Analysis</Text>
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Ionicons
                name={trends[trends.length - 1]?.overall > trends[trends.length - 2]?.overall ? 'trending-up' : 'trending-down'}
                size={24}
                color={trends[trends.length - 1]?.overall > trends[trends.length - 2]?.overall ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.trendTitle}>
                {trends[trends.length - 1]?.overall > trends[trends.length - 2]?.overall ? 'Improving' : 'Declining'} Trend
              </Text>
            </View>
            <Text style={styles.trendDescription}>
              Your efficiency score has {trends[trends.length - 1]?.overall > trends[trends.length - 2]?.overall ? 'increased' : 'decreased'} by{' '}
              {Math.abs((trends[trends.length - 1]?.overall || 0) - (trends[trends.length - 2]?.overall || 0)).toFixed(1)} points
              over the last period.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderBreakdownTab = () => {
    if (!currentScore) return null;

    const breakdownData = [
      {
        name: 'Utilization',
        population: currentScore.breakdown.utilization,
        color: '#6366F1',
        legendFontColor: '#1E293B',
        legendFontSize: 12
      },
      {
        name: 'Cost Efficiency',
        population: currentScore.breakdown.costEfficiency,
        color: '#10B981',
        legendFontColor: '#1E293B',
        legendFontSize: 12
      },
      {
        name: 'Sustainability',
        population: currentScore.breakdown.sustainability,
        color: '#F59E0B',
        legendFontColor: '#1E293B',
        legendFontSize: 12
      },
      {
        name: 'Versatility',
        population: currentScore.breakdown.versatility,
        color: '#EF4444',
        legendFontColor: '#1E293B',
        legendFontSize: 12
      },
      {
        name: 'Curation',
        population: currentScore.breakdown.curation,
        color: '#8B5CF6',
        legendFontColor: '#1E293B',
        legendFontSize: 12
      }
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Breakdown Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Score Breakdown</Text>
          <PieChart
            data={breakdownData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Detailed Analysis</Text>
          {Object.entries(currentScore.breakdown).map(([key, value], index) => {
            const categoryName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            const color = breakdownData[index]?.color || '#6366F1';
            
            return (
              <View key={key} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownIconContainer}>
                    <View style={[styles.breakdownIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons
                        name={getInsightIcon(key)}
                        size={20}
                        color={color}
                      />
                    </View>
                    <Text style={styles.breakdownName}>{categoryName}</Text>
                  </View>
                  <Text style={[styles.breakdownScore, { color }]}>{value}</Text>
                </View>
                <View style={styles.breakdownProgress}>
                  <View
                    style={[
                      styles.breakdownProgressFill,
                      {
                        width: `${value}%`,
                        backgroundColor: color
                      }
                    ]}
                  />
                </View>
                <Text style={styles.breakdownDescription}>
                  {getBreakdownDescription(key, value)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderRecommendationsTab = () => {
    if (!currentScore) return null;

    const recommendations = currentScore.insights.filter(insight => insight.actionable);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <View style={[styles.recommendationIcon, { backgroundColor: getInsightColor(recommendation.type) + '20' }]}>
                  <Ionicons
                    name={getInsightIcon(recommendation.type)}
                    size={24}
                    color={getInsightColor(recommendation.type)}
                  />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                  <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
                </View>
              </View>
              {recommendation.impact && (
                <View style={styles.recommendationImpact}>
                  <Text style={styles.recommendationImpactLabel}>Potential Impact:</Text>
                  <Text style={styles.recommendationImpactValue}>+{recommendation.impact} points</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.recommendationAction}
                onPress={() => onActionPress?.(recommendation.action || 'view_details', recommendation)}
              >
                <Text style={styles.recommendationActionText}>
                  {recommendation.action || 'Take Action'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const getBreakdownDescription = (category: string, score: number): string => {
    const level = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'needs improvement';
    
    switch (category) {
      case 'utilization':
        return `Your wardrobe utilization is ${level}. ${score >= 60 ? 'You\'re making good use of your items.' : 'Consider wearing neglected pieces more often.'}`;
      case 'costEfficiency':
        return `Your cost efficiency is ${level}. ${score >= 60 ? 'You\'re getting good value from your purchases.' : 'Focus on cost-per-wear optimization.'}`;
      case 'sustainability':
        return `Your sustainability practices are ${level}. ${score >= 60 ? 'You\'re taking good care of your items.' : 'Improve item care and longevity.'}`;
      case 'versatility':
        return `Your outfit versatility is ${level}. ${score >= 60 ? 'You create diverse outfit combinations.' : 'Experiment with new styling approaches.'}`;
      case 'curation':
        return `Your wardrobe curation is ${level}. ${score >= 60 ? 'You have a well-curated collection.' : 'Focus on quality over quantity.'}`;
      default:
        return `This category is performing at a ${level} level.`;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'trends': return renderTrendsTab();
      case 'breakdown': return renderBreakdownTab();
      case 'recommendations': return renderRecommendationsTab();
      default: return renderOverviewTab();
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
            { key: 'recommendations', label: 'Tips', icon: 'bulb-outline' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? '#6366F1' : '#64748B'}
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive
              ]}>
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  tabNavigation: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20
  },
  tabButtonActive: {
    backgroundColor: '#F0F4FF'
  },
  tabButtonText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6
  },
  tabButtonTextActive: {
    color: '#6366F1',
    fontWeight: '600'
  },
  tabContent: {
    flex: 1,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B'
  },
  scoreCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden'
  },
  scoreGradient: {
    padding: 24,
    alignItems: 'center'
  },
  scoreTitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  scoreGrade: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4
  },
  scoreLevel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8
  },
  sectionContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4
  },
  categoryScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  categoryProgress: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  insightContent: {
    flex: 1
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4
  },
  insightDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8
  },
  insightAction: {
    alignSelf: 'flex-start'
  },
  insightActionText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6
  },
  timeRangeButtonActive: {
    backgroundColor: '#6366F1'
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: '#64748B'
  },
  timeRangeButtonTextActive: {
    color: 'white',
    fontWeight: '600'
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center'
  },
  chart: {
    borderRadius: 16
  },
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8
  },
  trendDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20
  },
  breakdownItem: {
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
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  breakdownIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  breakdownName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B'
  },
  breakdownScore: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  breakdownProgress: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  breakdownProgressFill: {
    height: '100%',
    borderRadius: 3
  },
  breakdownDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: 12
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recommendationContent: {
    flex: 1
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20
  },
  recommendationImpact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  recommendationImpactLabel: {
    fontSize: 14,
    color: '#64748B'
  },
  recommendationImpactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1'
  },
  recommendationAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  recommendationActionText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600'
  }
});

export default EfficiencyInsights;