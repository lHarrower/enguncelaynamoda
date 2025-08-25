import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';

// Test Animated.View specifically
const TestAnimatedView = () => {
  return (
    <Animated.View>
      <Text>Animated View Test</Text>
    </Animated.View>
  );
};

// Test TouchableOpacity
const TestTouchableOpacity = () => {
  return (
    <TouchableOpacity>
      <Text>TouchableOpacity Test</Text>
    </TouchableOpacity>
  );
};

describe('QuickActionButton Debug Tests', () => {
  it('should render Animated.View', () => {
    const { getByText } = render(<TestAnimatedView />);
    expect(getByText('Animated View Test')).toBeTruthy();
  });

  it('should render TouchableOpacity', () => {
    const { getByText } = render(<TestTouchableOpacity />);
    expect(getByText('TouchableOpacity Test')).toBeTruthy();
  });
});