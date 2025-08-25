import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import WardrobeCard from '@/components/common/WardrobeCard';

// Simple test component
const SimpleComponent = () => (
  <View testID="simple-component">
    <Text>Test</Text>
  </View>
);

const mockItem = {
  id: '1',
  imageUrl: 'https://example.com/image.jpg',
  category: 'shirt',
  name: 'Test Shirt',
  brand: 'Test Brand',
};

describe('Simple Test', () => {
  it('should render simple component', () => {
    const { getByTestId } = render(<SimpleComponent />);
    expect(getByTestId('simple-component')).toBeTruthy();
  });

  it('should import WardrobeCard without error', () => {
    expect(WardrobeCard).toBeDefined();
  });

  it('should render WardrobeCard with minimal props', () => {
    const { getByTestId } = render(
      <WardrobeCard item={mockItem} />
    );
    expect(getByTestId('wardrobe-card-1')).toBeTruthy();
  });
});