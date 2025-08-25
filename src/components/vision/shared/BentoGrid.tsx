import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BentoCard from '@/components/vision/shared/BentoCard';
import { DesignSystem } from '@/theme/DesignSystem';
import { IoniconsName } from '@/types/icons';

interface BentoGridItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: IoniconsName;
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
      <Text style={[DesignSystem.typography.body.medium, styles.inspirationText]}>
        {'"Elegance is the only beauty that never fades."'}
      </Text>
    </View>
  );

  const renderInsightsContent = () => (
    <View style={styles.insightsContent}>
      <Text style={[DesignSystem.typography.scale.caption, styles.insightText]}>
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
        .filter((item) => item.size === 'hero')
        .map((item) => (
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
          .filter((item) => ['wardrobe', 'discover'].includes(item.id))
          .map((item) => (
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
          .filter((item) => ['inspiration', 'insights'].includes(item.id))
          .map((item) => (
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
    gap: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  insightText: {
    color: DesignSystem.colors.neutral.slate,
  },
  insightsContent: {
    marginTop: DesignSystem.spacing.md,
  },
  inspirationContent: {
    marginTop: DesignSystem.spacing.lg,
  },
  inspirationText: {
    color: DesignSystem.colors.neutral.charcoal,
    fontStyle: 'italic',
  },
});

export default BentoGrid;
