import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColor, getSpacing, getTypography } from '@/constants/AynaModaVisionTheme';
import BentoCard from '@/components/vision/shared/BentoCard';

interface BentoGridItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  gradient: string[];
  size: 'small' | 'medium' | 'large' | 'hero';
  onPress: () => void;
  content?: React.ReactNode;
}

interface BentoGridProps {
  items: BentoGridItem[];
}

const BentoGrid: React.FC<BentoGridProps> = ({ items }) => {
  const renderInspirationContent = () => (
    <View style={styles.inspirationContent}>
      <Text style={[getTypography('body', 'regular'), styles.inspirationText]}>
        "Elegance is the only beauty that never fades."
      </Text>
    </View>
  );

  const renderInsightsContent = () => (
    <View style={styles.insightsContent}>
      <Text style={[getTypography('caption', 'regular'), styles.insightText]}>
        Your style confidence has increased 12% this week
      </Text>
    </View>
  );

  const getCardContent = (item: BentoGridItem) => {
    switch (item.id) {
      case 'inspiration':
        return renderInspirationContent();
      case 'insights':
        return renderInsightsContent();
      default:
        return item.content;
    }
  };

  return (
    <View style={styles.bentoGrid}>
      {/* Hero Card */}
      {items
        .filter(item => item.size === 'hero')
        .map(item => (
          <BentoCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            gradient={item.gradient}
            size={item.size}
            onPress={item.onPress}
          >
            {getCardContent(item)}
          </BentoCard>
        ))}
      
      {/* First Row */}
      <View style={styles.bentoRow}>
        {items
          .filter(item => ['wardrobe', 'discover'].includes(item.id))
          .map(item => (
            <BentoCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              gradient={item.gradient}
              size={item.size}
              onPress={item.onPress}
            >
              {getCardContent(item)}
            </BentoCard>
          ))}
      </View>
      
      {/* Second Row */}
      <View style={styles.bentoRow}>
        {items
          .filter(item => ['inspiration', 'insights'].includes(item.id))
          .map(item => (
            <BentoCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              gradient={item.gradient}
              size={item.size}
              onPress={item.onPress}
            >
              {getCardContent(item)}
            </BentoCard>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bentoGrid: {
    paddingHorizontal: getSpacing('md'),
    gap: getSpacing('md'),
  },
  bentoRow: {
    flexDirection: 'row',
    gap: getSpacing('md'),
  },
  inspirationContent: {
    marginTop: getSpacing('lg'),
  },
  inspirationText: {
    color: getColor('neutral', 'charcoal'),
    fontStyle: 'italic',
  },
  insightsContent: {
    marginTop: getSpacing('md'),
  },
  insightText: {
    color: getColor('neutral', 'slate'),
  },
});

export default BentoGrid;