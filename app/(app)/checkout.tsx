import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const CheckoutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Checkout screen coming soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  text: { color: DesignSystem.colors.text.secondary, fontSize: 18 },
});

export default CheckoutScreen;
