// Mock for OutfitRecommendationCard component
const React = require('react');
const { View, Text } = require('react-native');

const OutfitRecommendationCard = (props) => {
  return React.createElement(
    View,
    { testID: 'outfit-recommendation-card' },
    React.createElement(Text, { testID: 'outfit-title' }, props.outfit?.title || 'Mock Outfit'),
    props.isQuickOption &&
      React.createElement(Text, { testID: 'quick-option-badge' }, 'Quick Option'),
    props.confidenceScore &&
      React.createElement(Text, { testID: 'confidence-score' }, `${props.confidenceScore}%`),
  );
};

module.exports = OutfitRecommendationCard;
