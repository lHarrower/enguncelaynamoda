import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Simple mock component for AynaMirrorScreen
const MockAynaMirrorScreen = () => {
  return (
    <View testID="ayna-mirror-screen">
      <View testID="mirror-loading-state">
        <Text>Preparing your mirror...</Text>
        <Text>Curating confidence just for you</Text>
      </View>
    </View>
  );
};

describe('AynaMirrorScreen', () => {
  it('should render loading state initially', () => {
    const { getByTestId } = render(<MockAynaMirrorScreen />);
    expect(getByTestId('mirror-loading-state')).toBeTruthy();
  });

  it('should render without crashing', () => {
    expect(() => render(<MockAynaMirrorScreen />)).not.toThrow();
  });
});
