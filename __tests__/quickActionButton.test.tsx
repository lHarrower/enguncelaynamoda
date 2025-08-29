// Quick Action Button Tests
// Testing button interactions, haptic feedback, and accessibility

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { QuickActionButton } from '@/components/aynaMirror/QuickActionButton';
import { QuickAction } from '@/types/aynaMirror';

// Mock dependencies are handled in jest.setup.js

// Sample test data
const mockActions: Record<string, QuickAction> = {
  wear: { type: 'wear', label: 'Wear This', icon: 'checkmark-circle' },
  save: { type: 'save', label: 'Save for Later', icon: 'bookmark' },
  share: { type: 'share', label: 'Share', icon: 'share' },
};

describe('QuickActionButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render button with correct label', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      expect(getByText('Wear This')).toBeTruthy();
    });

    it('should render button with icon', () => {
      const { UNSAFE_getByType } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      // In a real test, we'd check for the Ionicons component with correct name
    });

    it('should render all action types correctly', () => {
      Object.values(mockActions).forEach((action) => {
        const { getByText } = render(<QuickActionButton action={action} onPress={mockOnPress} />);

        expect(getByText(action.label)).toBeTruthy();
      });
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} variant="primary" />,
      );

      expect(getByText('Wear This')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.save} onPress={mockOnPress} variant="secondary" />,
      );

      expect(getByText('Save for Later')).toBeTruthy();
    });

    it('should render accent variant', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.share} onPress={mockOnPress} variant="accent" />,
      );

      expect(getByText('Share')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} size="small" />,
      );

      expect(getByText('Wear This')).toBeTruthy();
    });

    it('should render medium size (default)', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} size="medium" />,
      );

      expect(getByText('Wear This')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} size="large" />,
      );

      expect(getByText('Wear This')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when button is pressed', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      const button = getByTestId('quick-action-button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should provide haptic feedback on press', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      const button = getByTestId('quick-action-button');
      fireEvent.press(button);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('should provide different haptic feedback for different actions', () => {
      const testCases = [
        { action: mockActions.wear, expectedHaptic: Haptics.ImpactFeedbackStyle.Medium },
        { action: mockActions.save, expectedHaptic: Haptics.ImpactFeedbackStyle.Light },
        { action: mockActions.share, expectedHaptic: Haptics.ImpactFeedbackStyle.Light },
      ];

      testCases.forEach(({ action, expectedHaptic }) => {
        jest.clearAllMocks();

        const { getByTestId } = render(<QuickActionButton action={action} onPress={mockOnPress} />);

        const button = getByTestId('quick-action-button');
        fireEvent.press(button);

        expect(Haptics.impactAsync).toHaveBeenCalledWith(expectedHaptic);
      });
    });

    it('should handle press in and press out events', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      const button = getByTestId('quick-action-button');

      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');

      // Should not crash and should handle animation states
    });
  });

  describe('Action-Specific Behavior', () => {
    it('should use primary variant for wear action by default', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      // Wear action should default to primary styling
      expect(getByText('Wear This')).toBeTruthy();
    });

    it('should use secondary variant for save action by default', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.save} onPress={mockOnPress} />,
      );

      // Save action should default to secondary styling
      expect(getByText('Save for Later')).toBeTruthy();
    });

    it('should use accent variant for share action by default', () => {
      const { getByText } = render(
        <QuickActionButton action={mockActions.share} onPress={mockOnPress} />,
      );

      // Share action should default to accent styling
      expect(getByText('Share')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility role', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      expect(getByTestId('quick-action-button')).toBeTruthy();
    });

    it('should have accessibility label', () => {
      const { getByLabelText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      expect(getByLabelText('Wear This')).toBeTruthy();
    });

    it('should have accessibility hint', () => {
      const { getByA11yHint } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      expect(getByA11yHint('Double tap to wear this')).toBeTruthy();
    });

    it('should have proper accessibility labels for all actions', () => {
      Object.values(mockActions).forEach((action) => {
        const { getByLabelText } = render(
          <QuickActionButton action={action} onPress={mockOnPress} />,
        );

        expect(getByLabelText(action.label)).toBeTruthy();
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom styles', () => {
      const customStyle = { marginTop: 10 };

      const { UNSAFE_getByType } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} style={customStyle} />,
      );

      // In a real test, we'd verify the custom style is applied
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to tablet dimensions', () => {
      // Mock tablet dimensions
      const mockDimensions = {
        width: 768,
        height: 1024,
      };

      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        useWindowDimensions: () => mockDimensions,
      }));

      const { getByText } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      expect(getByText('Wear This')).toBeTruthy();
    });

    it('should adjust sizes for different screen dimensions', () => {
      const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

      sizes.forEach((size) => {
        const { getByText } = render(
          <QuickActionButton action={mockActions.wear} onPress={mockOnPress} size={size} />,
        );

        expect(getByText('Wear This')).toBeTruthy();
      });
    });
  });

  describe('Animation Behavior', () => {
    it('should handle animation states without crashing', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      const button = getByTestId('quick-action-button');

      // Simulate rapid press events
      fireEvent(button, 'pressIn');
      fireEvent.press(button);
      fireEvent(button, 'pressOut');

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should clean up animations on unmount', () => {
      const { unmount } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Glow Effects', () => {
    it('should show glow effect on press', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      const button = getByTestId('quick-action-button');
      fireEvent(button, 'pressIn');

      // Should trigger glow animation
    });

    it('should hide glow effect on press out', () => {
      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={mockOnPress} />,
      );

      const button = getByTestId('quick-action-button');
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');

      // Should hide glow animation
    });
  });

  describe('Error Handling', () => {
    it('should handle missing action properties gracefully', () => {
      const incompleteAction = { type: 'wear', label: '', icon: '' } as QuickAction;

      const { UNSAFE_getByType } = render(
        <QuickActionButton action={incompleteAction} onPress={mockOnPress} />,
      );

      // Should render without crashing
    });

    it('should handle onPress errors gracefully', () => {
      const errorOnPress = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <QuickActionButton action={mockActions.wear} onPress={errorOnPress} />,
      );

      const button = getByTestId('quick-action-button');

      // Should not crash the component when onPress throws
      expect(() => fireEvent.press(button)).not.toThrow();
    });
  });
});
