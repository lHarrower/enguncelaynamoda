const React = require('react');
const { render } = require('@testing-library/react-native');
const { OutfitRecommendationCard } = require('./src/components/aynaMirror/OutfitRecommendationCard');

const mockRecommendation = {
  id: 'feedback-test',
  items: [{ id: 'item-feedback', category: 'tops', colors: ['green'] }],
  confidenceNote: 'Great choice!',
  confidenceScore: 4.1,
  quickActions: [
    { id: 'wear', label: 'Wear This', action: 'wear' }
  ]
};

const { getAllByRole, debug } = render(
  React.createElement(OutfitRecommendationCard, {
    recommendation: mockRecommendation,
    onAction: () => {}
  })
);

console.log('All buttons:');
const buttons = getAllByRole('button');
buttons.forEach((button, index) => {
  console.log(`Button ${index}:`, {
    accessibilityLabel: button.props.accessibilityLabel,
    accessibilityRole: button.props.accessibilityRole,
    children: button.props.children
  });
});

debug();