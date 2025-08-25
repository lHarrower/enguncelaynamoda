import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSafeTheme } from '@/hooks/useSafeTheme';
import { antiConsumptionService, CostPerWearData } from '@/services/antiConsumptionService';
import { DesignSystem } from '@/theme/DesignSystem';

import { errorInDev } from '../../utils/consoleSuppress';

interface CostPerWearDisplayProps {
  itemId: string;
  compact?: boolean;
  showProjected?: boolean;
  onPress?: () => void;
}

export const CostPerWearDisplay: React.FC<CostPerWearDisplayProps> = ({
  itemId,
  compact = false,
  showProjected = true,
  onPress,
}) => {
  const theme = useSafeTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const [costData, setCostData] = useState<CostPerWearData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCostPerWearData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await antiConsumptionService.calculateCostPerWear(itemId);
      setCostData(data);
    } catch (err: unknown) {
      setError('Failed to load cost data');
      errorInDev('Error loading cost per wear data:', err instanceof Error ? err : String(err));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void loadCostPerWearData();
  }, [itemId, loadCostPerWearData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCostPerWearColor = (costPerWear: number, purchasePrice: number): string => {
    const ratio = costPerWear / purchasePrice;
    if (ratio <= 0.1) {
      return DesignSystem.colors.success[500];
    } // Excellent value
    if (ratio <= 0.25) {
      return DesignSystem.colors.warning[500];
    } // Good value
    return DesignSystem.colors.error[500]; // Poor value
  };

  const getCostPerWearLabel = (costPerWear: number, purchasePrice: number): string => {
    const ratio = costPerWear / purchasePrice;
    if (ratio <= 0.1) {
      return 'Excellent Value';
    }
    if (ratio <= 0.25) {
      return 'Good Value';
    }
    return 'Consider More Wear';
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !costData) {
    return (
      <View style={[styles.container, compact && styles.compactContainer]}>
        <Text style={styles.errorText}>Cost data unavailable</Text>
      </View>
    );
  }

  const costColor = getCostPerWearColor(costData.costPerWear, costData.purchasePrice);
  const costLabel = getCostPerWearLabel(costData.costPerWear, costData.purchasePrice);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={`Cost per wear: ${formatCurrency(costData.costPerWear)}`}
        accessibilityHint="Tap to view detailed cost analysis"
        accessibilityState={{ disabled: !onPress }}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactLabel}>Cost/Wear</Text>
          <Text style={[styles.compactValue, { color: costColor }]}>
            {formatCurrency(costData.costPerWear)}
          </Text>
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={DesignSystem.colors.neutral[600]} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Cost per wear analysis: ${formatCurrency(costData.costPerWear)} - ${costLabel}`}
      accessibilityHint="Tap to view more detailed cost analysis and recommendations"
      accessibilityState={{ disabled: !onPress }}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="calculator-outline" size={20} color={DesignSystem.colors.primary[500]} />
        </View>
        <Text style={styles.title}>Cost Per Wear</Text>
      </View>

      <View style={styles.mainMetric}>
        <Text style={[styles.costPerWear, { color: costColor }]}>
          {formatCurrency(costData.costPerWear)}
        </Text>
        <Text style={[styles.costLabel, { color: costColor }]}>{costLabel}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purchase Price:</Text>
          <Text style={styles.detailValue}>{formatCurrency(costData.purchasePrice)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Times Worn:</Text>
          <Text style={styles.detailValue}>{costData.totalWears}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Days Owned:</Text>
          <Text style={styles.detailValue}>{costData.daysSincePurchase}</Text>
        </View>
        {showProjected && costData.projectedCostPerWear !== costData.costPerWear && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Projected Cost/Wear:</Text>
            <Text style={styles.detailValue}>{formatCurrency(costData.projectedCostPerWear)}</Text>
          </View>
        )}
      </View>

      {costData.totalWears === 0 && (
        <View style={styles.encouragement}>
          <Ionicons name="shirt-outline" size={16} color={DesignSystem.colors.warning[500]} />
          <Text style={styles.encouragementText}>Wear this item to improve its value!</Text>
        </View>
      )}

      {costData.totalWears > 0 && costData.costPerWear <= costData.purchasePrice * 0.1 && (
        <View style={styles.celebration}>
          <Ionicons name="trophy-outline" size={16} color={DesignSystem.colors.success[500]} />
          <Text style={styles.celebrationText}>
            {"Amazing! You've maximized this item's value."}
          </Text>
        </View>
      )}

      {onPress && (
        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>Tap for more details</Text>
          <Ionicons name="chevron-forward" size={16} color={DesignSystem.colors.neutral[600]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: {
  background: { secondary: string };
  text: { primary: string; secondary: string };
  semantic: { error: string; warning: string; success: string };
}) =>
  StyleSheet.create({
    actionHint: {
      alignItems: 'center',
      borderTopColor: `${colors.text.secondary}20`,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 12,
      paddingTop: 12,
    },
    actionHintText: {
      color: colors.text.secondary,
      fontSize: 12,
      marginRight: 4,
    },
    celebration: {
      alignItems: 'center',
      backgroundColor: `${DesignSystem.colors.success[500]}10`,
      borderRadius: 8,
      flexDirection: 'row',
      marginTop: 8,
      padding: 12,
    },
    celebrationText: {
      color: DesignSystem.colors.success[500],
      flex: 1,
      fontSize: 14,
      marginLeft: 8,
    },
    compactContainer: {
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
      padding: 12,
    },
    compactContent: {
      flex: 1,
    },

    compactLabel: {
      color: colors.text.secondary,
      fontSize: 12,
      marginBottom: 2,
    },
    compactValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    container: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginVertical: 8,
      padding: 16,
    },
    costLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    costPerWear: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 4,
    },
    detailLabel: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    detailRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    detailValue: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    details: {
      marginBottom: 16,
    },
    encouragement: {
      alignItems: 'center',
      backgroundColor: `${DesignSystem.colors.warning[500]}10`,
      borderRadius: 8,
      flexDirection: 'row',
      marginTop: 8,
      padding: 12,
    },
    encouragementText: {
      color: DesignSystem.colors.warning[500],
      flex: 1,
      fontSize: 14,
      marginLeft: 8,
    },
    errorText: {
      color: colors.semantic.error,
      fontSize: 14,
      textAlign: 'center',
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 16,
    },
    iconContainer: {
      alignItems: 'center',
      backgroundColor: `${DesignSystem.colors.primary[500]}20`,
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      marginRight: 12,
      width: 32,
    },
    loadingText: {
      color: colors.text.secondary,
      fontSize: 14,
      textAlign: 'center',
    },
    mainMetric: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
