const React = require('react');
const { render } = require('@testing-library/react-native');
const { createMockWardrobeItem } = require('./src/__tests__/utils/testUtils');
const { WardrobeCategory, WardrobeColor } = require('./src/types');

// Mock the WardrobeCard component
const WardrobeCard = require('./src/components/common/WardrobeCard').default;

const mockItem = createMockWardrobeItem({
  name: 'Blue Dress',
  category: WardrobeCategory.DRESSES,
  colors: [WardrobeColor.BLUE, WardrobeColor.WHITE],
  tags: ['formal', 'evening'],
  isFavorite: true,
});

console.log('Mock item:', JSON.stringify(mockItem, null, 2));
console.log('isFavorite value:', mockItem.isFavorite);

try {
  const { getByTestId } = render(
    React.createElement(WardrobeCard, {
      item: mockItem,
      onPress: () => {},
      onLongPress: () => {},
      onFavoriteToggle: () => {},
      screenReaderEnabled: true,
    }),
  );

  const card = getByTestId(`wardrobe-card-${mockItem.id}`);
  console.log('Accessibility label:', card.props.accessibilityLabel);
  console.log('Contains Blue Dress:', card.props.accessibilityLabel.includes('Blue Dress'));
  console.log('Contains Dresses:', card.props.accessibilityLabel.includes('Dresses'));
  console.log('Contains Favorite item:', card.props.accessibilityLabel.includes('Favorite item'));
} catch (error) {
  console.error('Error rendering component:', error.message);
}
