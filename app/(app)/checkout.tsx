import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CheckoutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Checkout screen coming soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#555' },
});

export default CheckoutScreen; 