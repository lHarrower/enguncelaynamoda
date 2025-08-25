/**
 * Performance Overlay Component
 * Real-time performance metrics display for development
 */
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface PerformanceOverlayProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClose?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  visible = false,
  position = 'top-right',
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceData, setPerformanceData] = useState(PerformanceMonitor.getGlobalReport());
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Update performance data every 2 seconds when visible
      const interval = setInterval(() => {
        setPerformanceData(PerformanceMonitor.getGlobalReport());
      }, 2000);
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [visible]);

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 9999,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 50, left: 10 };
      case 'top-right':
        return { ...baseStyle, top: 50, right: 10 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 50, left: 10 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 50, right: 10 };
      default:
        return { ...baseStyle, top: 50, right: 10 };
    }
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return '#4CAF50'; // Green
    if (value <= thresholds.warning) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(1)}ms`;
  };

  if (!visible) return null;

  const renderCompactView = () => (
    <TouchableOpacity
      style={[styles.compactContainer, getPositionStyle()]}
      onPress={() => setIsExpanded(true)}
      activeOpacity={0.8}
    >
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle}>PERF</Text>
        <View style={styles.compactMetrics}>
          <View style={styles.compactMetric}>
            <Text style={styles.compactLabel}>Render</Text>
            <Text
              style={[
                styles.compactValue,
                {
                  color: getPerformanceColor(performanceData.averageRenderTime, {
                    good: 16,
                    warning: 25,
                  }),
                },
              ]}
            >
              {formatTime(performanceData.averageRenderTime)}
            </Text>
          </View>
          <View style={styles.compactMetric}>
            <Text style={styles.compactLabel}>Drops</Text>
            <Text
              style={[
                styles.compactValue,
                {
                  color: getPerformanceColor(performanceData.totalFrameDrops, {
                    good: 5,
                    warning: 15,
                  }),
                },
              ]}
            >
              {performanceData.totalFrameDrops}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExpandedView = () => (
    <Modal
      visible={isExpanded}
      transparent
      animationType="fade"
      onRequestClose={() => setIsExpanded(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.expandedContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Performance Monitor</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  PerformanceMonitor.reset();
                  setPerformanceData(PerformanceMonitor.getGlobalReport());
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsExpanded(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Core Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Core Metrics</Text>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Average Render Time</Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color: getPerformanceColor(performanceData.averageRenderTime, {
                        good: 16,
                        warning: 25,
                      }),
                    },
                  ]}
                >
                  {formatTime(performanceData.averageRenderTime)}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Average Interaction Time</Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color: getPerformanceColor(performanceData.averageInteractionTime, {
                        good: 50,
                        warning: 100,
                      }),
                    },
                  ]}
                >
                  {formatTime(performanceData.averageInteractionTime)}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Frame Drops</Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color: getPerformanceColor(performanceData.totalFrameDrops, {
                        good: 5,
                        warning: 15,
                      }),
                    },
                  ]}
                >
                  {performanceData.totalFrameDrops}
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Peak Memory Usage</Text>
                <Text style={styles.metricValue}>
                  {formatBytes(performanceData.peakMemoryUsage)}
                </Text>
              </View>
            </View>

            {/* Slowest Operations */}
            {performanceData.slowestOperations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Slowest Operations</Text>
                {performanceData.slowestOperations.map((operation, index) => (
                  <View key={index} style={styles.operationRow}>
                    <Text style={styles.operationName} numberOfLines={1}>
                      {operation.name}
                    </Text>
                    <Text style={styles.operationTime}>{formatTime(operation.duration)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {performanceData.recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {performanceData.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationRow}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Performance Thresholds */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Thresholds</Text>
              <Text style={styles.thresholdText}>🟢 Render Time: ≤16ms (60fps)</Text>
              <Text style={styles.thresholdText}>🟡 Render Time: 16-25ms</Text>
              <Text style={styles.thresholdText}>🔴 Render Time: {'>'}25ms</Text>
              <Text style={styles.thresholdText}>🟢 Interaction: ≤50ms</Text>
              <Text style={styles.thresholdText}>🟡 Interaction: 50-100ms</Text>
              <Text style={styles.thresholdText}>🔴 Interaction: {'>'}100ms</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {renderCompactView()}
      {renderExpandedView()}
    </>
  );
};

const styles = StyleSheet.create({
  // Compact view styles
  compactContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
  },
  compactContent: {
    alignItems: 'center',
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  compactMetrics: {
    gap: 2,
  },
  compactMetric: {
    alignItems: 'center',
  },
  compactLabel: {
    color: '#CCCCCC',
    fontSize: 8,
  },
  compactValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },

  // Metric styles
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Operation styles
  operationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  operationName: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
    marginRight: 8,
  },
  operationTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F44336',
  },

  // Recommendation styles
  recommendationRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recommendationBullet: {
    fontSize: 14,
    color: '#FF9800',
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
    lineHeight: 16,
  },

  // Threshold styles
  thresholdText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
});

export default PerformanceOverlay;
