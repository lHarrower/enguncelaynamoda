import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import { errorInDev } from '@/utils/consoleSuppress';

import {
  antiConsumptionService,
  MonthlyConfidenceMetrics as MonthlyConfidenceMetricsType,
} from '../../services/antiConsumptionService';
import { DesignSystem } from '../../theme/DesignSystem';

const { width: _screenWidth } = Dimensions.get('window');

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
  const [selectedMonth, _setSelectedMonth] = useState(month || new Date().getMonth() + 1);
  const [selectedYear, _setSelectedYear] = useState(year || new Date().getFullYear());

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const metricsData = await antiConsumptionService.generateMonthlyConfidenceMetrics(
        userId,
        selectedMonth,
        selectedYear,
      );
      setMetrics(metricsData);
    } catch (err: unknown) {
      setError('Failed to load metrics');
      errorInDev(
        'Error loading monthly confidence metrics:',
        err instanceof Error ? err : String(err),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMetrics();
  }, [userId, selectedMonth, selectedYear]);

  const getMonthName = (monthNum: number): string => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const idx = monthNum - 1;
    return months[idx] || 'Unknown';
  };

  const getConfidenceColor = (rating: number): string => {
    if (rating >= 4.5) {
      return DesignSystem.colors.success[500];
    }
    if (rating >= 3.5) {
      return DesignSystem.colors.warning[500];
    }
    return DesignSystem.colors.error[500];
  };

  const getImprovementIcon = (improvement: number): string => {
    if (improvement > 0.2) {
      return 'trending-up';
    }
    if (improvement < -0.2) {
      return 'trending-down';
    }
    return 'remove';
  };

  const getImprovementColor = (improvement: number): string => {
    if (improvement > 0.1) {
      return DesignSystem.colors.success[500];
    }
    if (improvement < -0.1) {
      return DesignSystem.colors.error[500];
    }
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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadMetrics()}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Tap to reload confidence metrics"
          >
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
          <Ionicons
            name={improvementIcon as keyof typeof Ionicons.glyphMap}
            size={20}
            color={improvementColor}
          />
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
          <Text style={styles.metricValue}>
            {formatPercentage(metrics.shoppingReductionPercentage)}
          </Text>
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
                  <Ionicons
                    name="shirt-outline"
                    size={24}
                    color={DesignSystem.colors.neutral[600]}
                  />
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemColors}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor:
                            typeof color === 'string'
                              ? color.toLowerCase()
                              : DesignSystem.colors.neutral[300],
                        },
                      ]}
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
                  <Ionicons
                    name="shirt-outline"
                    size={24}
                    color={DesignSystem.colors.neutral[600]}
                  />
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={styles.itemColors}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor:
                            typeof color === 'string'
                              ? color.toLowerCase()
                              : DesignSystem.colors.neutral[300],
                        },
                      ]}
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
                Your confidence is trending up! You&apos;re getting better at choosing outfits that make
                you feel great.
              </Text>
            </View>
          )}

          {metrics.wardrobeUtilization > 80 && (
            <View style={styles.insightItem}>
              <Ionicons name="star" size={16} color={DesignSystem.colors.warning[500]} />
              <Text style={styles.insightText}>
                Excellent wardrobe utilization! You&apos;re making great use of what you own.
              </Text>
            </View>
          )}

          {metrics.shoppingReductionPercentage > 20 && (
            <View style={styles.insightItem}>
              <Ionicons name="leaf" size={16} color={DesignSystem.colors.success[500]} />
              <Text style={styles.insightText}>
                Amazing! You&apos;ve significantly reduced shopping by loving what you already have.
              </Text>
            </View>
          )}

          {metrics.totalOutfitsRated < 10 && (
            <View style={styles.insightItem}>
              <Ionicons
                name="information-circle"
                size={16}
                color={DesignSystem.colors.primary[500]}
              />
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

const createStyles = (colors: typeof DesignSystem.colors) =>
  StyleSheet.create({
    colorDot: {
      borderRadius: 4,
      height: 8,
      marginRight: 2,
      width: 8,
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
    improvementContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    improvementText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    insightItem: {
      alignItems: 'flex-start',
      backgroundColor: colors.background.secondary,
      borderRadius: 8,
      flexDirection: 'row',
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    insightText: {
      color: colors.text.primary,
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      marginLeft: 8,
    },
    insightsContainer: {
      marginBottom: 24,
      marginHorizontal: 20,
    },
    insightsList: {
      marginTop: 16,
    },
    itemCard: {
      alignItems: 'center',
      marginRight: 12,
      width: 80,
    },
    itemCategory: {
      color: colors.text.secondary,
      fontSize: 12,
      marginBottom: 4,
      textAlign: 'center',
    },
    itemColors: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    itemImagePlaceholder: {
      alignItems: 'center',
      backgroundColor: colors.border.primary,
      borderRadius: 8,
      height: 80,
      justifyContent: 'center',
      marginBottom: 8,
      width: 80,
    },
    itemsScroll: {
      paddingLeft: 20,
    },
    itemsSection: {
      marginBottom: 24,
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
    mainMetricContainer: {
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      marginBottom: 20,
      marginHorizontal: 20,
      padding: 24,
    },
    mainScore: {
      fontSize: 48,
      fontWeight: '700',
      marginBottom: 8,
    },
    metricCard: {
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginBottom: 12,
      padding: 16,
      width: '48%',
    },
    metricLabel: {
      color: colors.text.secondary,
      fontSize: 12,
      textAlign: 'center',
    },
    metricValue: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
      marginTop: 8,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
      marginHorizontal: 20,
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
    retryButton: {
      backgroundColor: DesignSystem.colors.primary[500],
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: colors.background.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    scoreContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    scoreLabel: {
      color: colors.text.secondary,
      fontSize: 16,
    },
    sectionSubtitle: {
      color: colors.text.secondary,
      fontSize: 14,
      marginBottom: 16,
      marginHorizontal: 20,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 4,
      marginHorizontal: 20,
    },
    starsContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: 16,
    },
    title: {
      color: colors.text.primary,
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
  });
