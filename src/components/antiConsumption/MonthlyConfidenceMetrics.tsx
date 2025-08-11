import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeTheme } from '@/hooks/useSafeTheme';
import { antiConsumptionService, MonthlyConfidenceMetrics as MonthlyConfidenceMetricsType } from '../../services/antiConsumptionService';
import { DesignSystem } from '../../theme/DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

interface MonthlyConfidenceMetricsProps {
  userId: string;
  month?: number;
  year?: number;
  onMetricsLoaded?: (metrics: MonthlyConfidenceMetricsType) => void;
}

export const MonthlyConfidenceMetrics: React.FC<MonthlyConfidenceMetricsProps> = ({
  userId,
  month,
  year,
  onMetricsLoaded,
}) => {
  const theme = useSafeTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const [metrics, setMetrics] = useState<MonthlyConfidenceMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(month || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());

  useEffect(() => {
    loadMetrics();
  }, [userId, selectedMonth, selectedYear]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const metricsData = await antiConsumptionService.generateMonthlyConfidenceMetrics(
        userId,
        selectedMonth,
        selectedYear
      );
      setMetrics(metricsData);
      onMetricsLoaded?.(metricsData);
    } catch (err) {
      setError('Failed to load confidence metrics');
      console.error('Error loading monthly confidence metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };

  const getConfidenceColor = (rating: number): string => {
    if (rating >= 4.5) return DesignSystem.colors.success[500];
    if (rating >= 3.5) return DesignSystem.colors.warning[500];
    return DesignSystem.colors.error[500];
  };

  const getImprovementIcon = (improvement: number): string => {
    if (improvement > 0.2) return 'trending-up';
    if (improvement < -0.2) return 'trending-down';
    return 'remove';
  };

  const getImprovementColor = (improvement: number): string => {
    if (improvement > 0.1) return DesignSystem.colors.success[500];
    if (improvement < -0.1) return DesignSystem.colors.error[500];
    return DesignSystem.colors.neutral[600];
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your confidence metrics...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadMetrics}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={DesignSystem.colors.neutral[600]} />
          <Text style={styles.noDataTitle}>No Data Available</Text>
          <Text style={styles.noDataText}>
            Start rating your outfits to see your confidence metrics!
          </Text>
        </View>
      </View>
    );
  }

  const confidenceColor = getConfidenceColor(metrics.averageConfidenceRating);
  const improvementIcon = getImprovementIcon(metrics.confidenceImprovement);
  const improvementColor = getImprovementColor(metrics.confidenceImprovement);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Confidence Metrics</Text>
        <Text style={styles.subtitle}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
      </View>

      {/* Main Confidence Score */}
      <View style={styles.mainMetricContainer}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.mainScore, { color: confidenceColor }]}>
            {metrics.averageConfidenceRating.toFixed(1)}
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= metrics.averageConfidenceRating ? 'star' : 'star-outline'}
                size={16}
                color={confidenceColor}
              />
            ))}
          </View>
          <Text style={styles.scoreLabel}>Average Confidence</Text>
        </View>

        <View style={styles.improvementContainer}>
          <Ionicons name={improvementIcon as keyof typeof Ionicons.glyphMap} size={20} color={improvementColor} />
          <Text style={[styles.improvementText, { color: improvementColor }]}>
            {metrics.confidenceImprovement > 0 ? '+' : ''}
            {metrics.confidenceImprovement.toFixed(1)} from last month
          </Text>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="shirt-outline" size={24} color={DesignSystem.colors.primary[500]} />
          <Text style={styles.metricValue}>{metrics.totalOutfitsRated}</Text>
          <Text style={styles.metricLabel}>Outfits Rated</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="pie-chart-outline" size={24} color={DesignSystem.colors.warning[500]} />
          <Text style={styles.metricValue}>{formatPercentage(metrics.wardrobeUtilization)}</Text>
          <Text style={styles.metricLabel}>Wardrobe Used</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="leaf-outline" size={24} color={DesignSystem.colors.success[500]} />
          <Text style={styles.metricValue}>{formatPercentage(metrics.shoppingReductionPercentage)}</Text>
          <Text style={styles.metricLabel}>Shopping Reduced</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="calculator-outline" size={24} color={DesignSystem.colors.error[500]} />
          <Text style={styles.metricValue}>{formatCurrency(metrics.costPerWearImprovement)}</Text>
          <Text style={styles.metricLabel}>Cost/Wear Saved</Text>
        </View>
      </View>

      {/* Most Confident Items */}
      {metrics.mostConfidentItems.length > 0 && (
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Your Confidence Boosters</Text>
          <Text style={styles.sectionSubtitle}>Items that make you feel amazing</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
            {metrics.mostConfidentItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="shirt-outline" size={24} color={DesignSystem.colors.neutral[600]} />
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemColors}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Least Confident Items */}
      {metrics.leastConfidentItems.length > 0 && (
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Room for Growth</Text>
          <Text style={styles.sectionSubtitle}>Items to style differently or let go</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
            {metrics.leastConfidentItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="shirt-outline" size={24} color={DesignSystem.colors.neutral[600]} />
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemColors}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorDot, { backgroundColor: color.toLowerCase() }]}
                    />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightsList}>
          {metrics.confidenceImprovement > 0.2 && (
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={16} color={DesignSystem.colors.success[500]} />
              <Text style={styles.insightText}>
                Your confidence is trending up! You're getting better at choosing outfits that make you feel great.
              </Text>
            </View>
          )}
          
          {metrics.wardrobeUtilization > 80 && (
            <View style={styles.insightItem}>
              <Ionicons name="star" size={16} color={DesignSystem.colors.warning[500]} />
              <Text style={styles.insightText}>
                Excellent wardrobe utilization! You're making great use of what you own.
              </Text>
            </View>
          )}
          
          {metrics.shoppingReductionPercentage > 20 && (
            <View style={styles.insightItem}>
              <Ionicons name="leaf" size={16} color={DesignSystem.colors.success[500]} />
              <Text style={styles.insightText}>
                Amazing! You've significantly reduced shopping by loving what you already have.
              </Text>
            </View>
          )}
          
          {metrics.totalOutfitsRated < 10 && (
            <View style={styles.insightItem}>
              <Ionicons name="information-circle" size={16} color={DesignSystem.colors.primary[500]} />
              <Text style={styles.insightText}>
                Rate more outfits to get better insights and recommendations!
              </Text>
            </View>
          )}
        </View>
      </View>
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
    backgroundColor: DesignSystem.colors.primary[500],
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  mainMetricContainer: {
    backgroundColor: colors.background.secondary,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainScore: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  itemsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  itemsScroll: {
    paddingLeft: 20,
  },
  itemCard: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.border.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  itemColors: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  insightsContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  insightsList: {
    marginTop: 16,
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
});