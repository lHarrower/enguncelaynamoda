import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Minimal test component to isolate the issue
const MinimalQuickActionButton = () => {
  return (
    <View>
      <Text>Test Button</Text>
    </View>
  );
};

describe('Minimal QuickActionButton Test', () => {
  it('should render minimal component', () => {
    const { getByText } = render(<MinimalQuickActionButton />);
    expect(getByText('Test Button')).toBeTruthy();
  });
});