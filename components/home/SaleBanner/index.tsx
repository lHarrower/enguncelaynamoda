import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SaleBannerProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  backgroundColor?: string;
}

const SaleBanner: React.FC<SaleBannerProps> = ({
  onPress,
  title = "🌟 MEGA SALE ALERT!",
  subtitle = "Up to 70% off designer pieces",
  ctaText = "Shop Now →",
  backgroundColor = "#B8918F"
}) => {
  return (
    <TouchableOpacity 
      style={[styles.saleBanner, { backgroundColor, shadowColor: backgroundColor }]} 
      onPress={onPress}
    >
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerSubtitle}>{subtitle}</Text>
        <Text style={styles.bannerCta}>{ctaText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saleBanner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerContent: {
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerCta: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SaleBanner; 