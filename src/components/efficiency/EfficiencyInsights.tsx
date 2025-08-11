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
import { PieChart } from 'react-native-chart-kit';

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
    refreshScore,
    getScoreColor,
    getGradeFromScore,
    getPerformanceLevel
  } = useEfficiencyScore();

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown' | 'recommendations'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const currentScore = score || efficiencyScore;
  const currentMetrics = metrics; // Hook does not expose metrics; rely on prop when provided
  const trends: any[] = []; // Timeseries trends not provided by hook; show empty state

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
      case 'trend_up': return 'trending-up-outline';
      case 'trend_down': return 'trending-down-outline';
      case 'warning': return 'warning-outline';
      case 'success': return 'checkmark-circle-outline';
      default: return 'information-circle-outline';
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
                    name={getInsightIcon(category.name.toLowerCase().replace(' ', '_')) as any}
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
            improvements.slice(0, 1).forEach((s: string) => quick.push({ title: s, type: 'warning' }));
            recommendations.slice(0, 1).forEach((s: string) => quick.push({ title: s, type: 'info' }));
            return quick.slice(0, 3).map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Ionicons
                    name={getInsightIcon(insight.type) as any}
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
              <Text style={[styles.metricValue, { color: currentScore.trends.monthlyChange >= 0 ? '#10B981' : '#EF4444' }]}>
                {currentScore.trends.monthlyChange >= 0 ? '+' : ''}{currentScore.trends.monthlyChange}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Yearly Change</Text>
              <Text style={[styles.metricValue, { color: currentScore.trends.yearlyChange >= 0 ? '#10B981' : '#EF4444' }]}>
                {currentScore.trends.yearlyChange >= 0 ? '+' : ''}{currentScore.trends.yearlyChange}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Trajectory</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name={isImproving ? 'trending-up-outline' : isDeclining ? 'trending-down-outline' : 'remove-outline'}
                  size={20}
                  color={isImproving ? '#10B981' : isDeclining ? '#EF4444' : '#64748B'}
                />
                <Text style={[styles.metricValue, { marginLeft: 8 }]}>
                  {currentScore.trends.trajectory.charAt(0).toUpperCase() + currentScore.trends.trajectory.slice(1)}
                </Text>
              </View>
            </View>
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
      {Object.entries(currentScore.breakdown as Record<string, number>).map(([key, value], index) => {
            const categoryName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            const color = breakdownData[index]?.color || '#6366F1';
    const numValue = value as number;
            
            return (
              <View key={key} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownIconContainer}>
                    <View style={[styles.breakdownIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons
        name={getInsightIcon(key) as any}
                        size={20}
                        color={color}
                      />
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
                        backgroundColor: color
                      }
                    ]}
                  />
                </View>
                <Text style={styles.breakdownDescription}>
      {getBreakdownDescription(key, numValue)}
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