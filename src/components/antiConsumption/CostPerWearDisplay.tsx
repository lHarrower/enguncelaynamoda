import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { antiConsumptionService, CostPerWearData } from '@/services/antiConsumptionService';
import { DesignSystem } from '@/theme/DesignSystem';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [costData, setCostData] = useState<CostPerWearData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCostPerWearData();
  }, [itemId]);

  const loadCostPerWearData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await antiConsumptionService.calculateCostPerWear(itemId);
      setCostData(data);
    } catch (err) {
      setError('Failed to load cost data');
      console.error('Error loading cost per wear data:', err);
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

  const getCostPerWearColor = (costPerWear: number, purchasePrice: number): string => {
    const ratio = costPerWear / purchasePrice;
    if (ratio <= 0.1) return DesignSystem.colors.success[500]; // Excellent value
    if (ratio <= 0.25) return DesignSystem.colors.warning[500]; // Good value
    return DesignSystem.colors.error[500]; // Poor value
  };

  const getCostPerWearLabel = (costPerWear: number, purchasePrice: number): string => {
    const ratio = costPerWear / purchasePrice;
    if (ratio <= 0.1) return 'Excellent Value';
    if (ratio <= 0.25) return 'Good Value';
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
        <Text style={[styles.costLabel, { color: costColor }]}>
          {costLabel}
        </Text>
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
            <Text style={styles.detailValue}>
              {formatCurrency(costData.projectedCostPerWear)}
            </Text>
          </View>
        )}
      </View>

      {costData.totalWears === 0 && (
        <View style={styles.encouragement}>
          <Ionicons name="shirt-outline" size={16} color={DesignSystem.colors.warning[500]} />
          <Text style={styles.encouragementText}>
            Wear this item to improve its value!
          </Text>
        </View>
      )}

      {costData.totalWears > 0 && costData.costPerWear <= costData.purchasePrice * 0.1 && (
        <View style={styles.celebration}>
          <Ionicons name="trophy-outline" size={16} color={DesignSystem.colors.success[500]} />
          <Text style={styles.celebrationText}>
            Amazing! You've maximized this item's value.
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  compactContent: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  compactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.semantic.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary[500]}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  mainMetric: {
    alignItems: 'center',
    marginBottom: 20,
  },
  costPerWear: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  encouragement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.semantic.warning}20`,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: colors.semantic.warning,
    marginLeft: 8,
    flex: 1,
  },
  celebration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.semantic.success}20`,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  celebrationText: {
    fontSize: 14,
    color: colors.semantic.success,
    marginLeft: 8,
    flex: 1,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  actionHintText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 4,
  },
});