import React from 'react';
import { render } from '@testing-library/react-native';

// Test if QuickActionButton can be imported
try {
  const { QuickActionButton } = require('../src/components/aynaMirror/QuickActionButton');
  
} catch (error) {
  
}

describe('QuickActionButton Import Test', () => {
  it('should import QuickActionButton without errors', () => {
    expect(() => {
      const { QuickActionButton } = require('../src/components/aynaMirror/QuickActionButton');
      expect(QuickActionButton).toBeDefined();
    }).not.toThrow();
  });
});
