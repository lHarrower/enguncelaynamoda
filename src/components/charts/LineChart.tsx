import React from 'react';
import { View, AccessibilityProps } from 'react-native';
import { VictoryPie } from 'victory-native';

export interface PieSlice { name: string; score: number; color: string }
export interface PieChartProps extends AccessibilityProps {
  data: PieSlice[];
  width: number;
  height: number;
}

// Wrapper replacing react-native-chart-kit PieChart usage.
export const PieChartWrapper: React.FC<PieChartProps> = ({ data, width, height, accessibilityLabel }) => {
  const chartData = data.map(d => ({ x: d.name, y: d.score, fill: d.color }));
  return (
    <View accessibilityRole="image" accessibilityLabel={accessibilityLabel || 'Score breakdown chart'}>
      <VictoryPie
        data={chartData}
        width={width}
        height={height}
        colorScale={chartData.map(d => d.fill)}
        labels={() => ''}
        padding={{ left: 24, right: 24, top: 24, bottom: 24 }}
        innerRadius={40}
      />
    </View>
  );
};

export default PieChartWrapper;
