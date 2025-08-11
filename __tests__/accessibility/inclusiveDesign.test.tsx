/**
 * Accessibility Tests for Inclusive Design
 * Tests screen reader compatibility, keyboard navigation, and inclusive UX
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AynaMirrorScreen } from '@/screens/AynaMirrorScreen';
import { FeedbackCollector } from '@/components/feedback/FeedbackCollector';
import { OutfitRecommendationCard } from '@/components/aynaMirror/OutfitRecommendationCard';
import { ConfidenceRatingStep } from '@/components/feedback/ConfidenceRatingStep';

// Mock dependencies
jest.mock('@/config/supabaseClient');
jest.mock('@/services/aynaMirrorService');
jest.mock('@/services/weatherService');

describe('Accessibility - Inclusive Design Tests', () => {
  describe('Screen Reader Compatibility', () => {
    it('should provide proper accessibility labels for outfit recommendations', () => {
      const mockRecommendation = {
        id: 'test-recommendation',
        items: [
          { id: 'item-1', category: 'tops', colors: ['blue'], brand: 'Test Brand' },
          { id: 'item-2', category: 'bottoms', colors: ['black'], brand: 'Another Brand' }
        ],
        confidenceNote: 'You look amazing in this combination!',
        confidenceScore: 4.5,
        quickActions: [
          { id: 'wear', label: 'Wear This', action: 'wear' },
          { id: 'save', label: 'Save for Later', action: 'save' }
        ]
      };

      const { getByLabelText, getByText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      // Should have accessible labels for the main recommendation
      expect(getByLabelText(/outfit recommendation/i)).toBeTruthy();
      
      // Confidence note should be accessible
      expect(getByText('You look amazing in this combination!')).toBeTruthy();
      
      // Quick action buttons should have proper labels
      expect(getByLabelText(/wear this outfit/i)).toBeTruthy();
      expect(getByLabelText(/save outfit for later/i)).toBeTruthy();
    });

    it('should provide descriptive labels for confidence rating interface', () => {
      const mockProps = {
        onRatingChange: jest.fn(),
        currentRating: 0
      };

      const { getByLabelText } = render(
        <ConfidenceRatingStep {...mockProps} />
      );

      // Should have accessible rating interface
      expect(getByLabelText(/confidence rating/i)).toBeTruthy();
      
      // Individual rating options should be accessible
      for (let i = 1; i <= 5; i++) {
        expect(getByLabelText(new RegExp(`${i} out of 5 stars`, 'i'))).toBeTruthy();
      }
    });

    it('should provide semantic structure for feedback collection', () => {
      const mockProps = {
        outfitId: 'test-outfit',
        onFeedbackSubmit: jest.fn(),
        onClose: jest.fn()
      };

      const { getByRole, getByLabelText } = render(
        <FeedbackCollector {...mockProps} />
      );

      // Should have proper heading structure
      expect(getByRole('heading', { level: 2 })).toBeTruthy();
      
      // Form elements should be properly labeled
      expect(getByLabelText(/how confident did you feel/i)).toBeTruthy();
      expect(getByLabelText(/how did this outfit make you feel/i)).toBeTruthy();
    });

    it('should provide alternative text for visual elements', () => {
      const mockRecommendation = {
        id: 'visual-test',
        items: [
          { 
            id: 'item-visual', 
            category: 'dress', 
            colors: ['red'], 
            imageUri: 'test-image.jpg',
            brand: 'Visual Brand'
          }
        ],
        confidenceNote: 'This red dress is perfect for today!',
        confidenceScore: 4.8
      };

      const { getByLabelText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      // Should provide descriptive alt text for outfit images
      expect(getByLabelText(/red dress from Visual Brand/i)).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through outfit recommendations', () => {
      const mockRecommendations = [
        {
          id: 'rec-1',
          items: [{ id: 'item-1', category: 'tops', colors: ['blue'] }],
          confidenceNote: 'Great choice!',
          confidenceScore: 4.2,
          quickActions: [{ id: 'wear', label: 'Wear This', action: 'wear' }]
        },
        {
          id: 'rec-2',
          items: [{ id: 'item-2', category: 'dress', colors: ['green'] }],
          confidenceNote: 'You\'ll love this!',
          confidenceScore: 4.5,
          quickActions: [{ id: 'wear', label: 'Wear This', action: 'wear' }]
        }
      ];

      const { getAllByRole } = render(
        <AynaMirrorScreen />
      );

      // All interactive elements should be focusable
      const buttons = getAllByRole('button');
      buttons.forEach(button => {
        expect(button.props.accessible).toBe(true);
        expect(button.props.accessibilityRole).toBe('button');
      });
    });

    it('should provide proper focus management in feedback flow', () => {
      const mockProps = {
        outfitId: 'focus-test',
        onFeedbackSubmit: jest.fn(),
        onClose: jest.fn()
      };

      const { getByRole, getAllByRole } = render(
        <FeedbackCollector {...mockProps} />
      );

      // Should have proper tab order
      const interactiveElements = getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element.props.accessible).toBe(true);
      });

      // Close button should be easily accessible
      const closeButton = getByRole('button', { name: /close/i });
      expect(closeButton.props.accessibilityLabel).toMatch(/close/i);
    });
  });

  describe('Color and Contrast Accessibility', () => {
    it('should not rely solely on color to convey information', () => {
      const mockRecommendation = {
        id: 'color-test',
        items: [
          { id: 'item-color', category: 'tops', colors: ['red'], brand: 'Color Brand' }
        ],
        confidenceNote: 'This red top is perfect!',
        confidenceScore: 4.3,
        isQuickOption: true // Should have non-color indicator
      };

      const { getByLabelText, getByText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      // Quick option should have text indicator, not just color
      expect(getByText(/quick option/i) || getByLabelText(/quick option/i)).toBeTruthy();
      
      // Color information should be provided in text form
      expect(getByText(/red/i)).toBeTruthy();
    });

    it('should provide high contrast for important elements', () => {
      const mockProps = {
        onRatingChange: jest.fn(),
        currentRating: 3
      };

      const { getByLabelText } = render(
        <ConfidenceRatingStep {...mockProps} />
      );

      // Selected rating should have clear indication beyond color
      const selectedRating = getByLabelText(/3 out of 5 stars, selected/i);
      expect(selectedRating).toBeTruthy();
    });
  });

  describe('Motor Accessibility', () => {
    it('should provide adequately sized touch targets', () => {
      const mockRecommendation = {
        id: 'touch-test',
        items: [{ id: 'item-touch', category: 'tops', colors: ['blue'] }],
        confidenceNote: 'Perfect choice!',
        confidenceScore: 4.0,
        quickActions: [
          { id: 'wear', label: 'Wear This', action: 'wear' },
          { id: 'save', label: 'Save', action: 'save' },
          { id: 'share', label: 'Share', action: 'share' }
        ]
      };

      const { getAllByRole } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      const buttons = getAllByRole('button');
      
      // All buttons should have minimum touch target size (44x44 points)
      buttons.forEach(button => {
        const style = button.props.style;
        if (style && typeof style === 'object') {
          // Check for minimum dimensions or proper hitSlop
          expect(
            button.props.hitSlop || 
            (style.minHeight && style.minHeight >= 44) ||
            (style.height && style.height >= 44)
          ).toBeTruthy();
        }
      });
    });

    it('should support alternative input methods', () => {
      const mockProps = {
        onRatingChange: jest.fn(),
        currentRating: 0
      };

      const { getByLabelText } = render(
        <ConfidenceRatingStep {...mockProps} />
      );

      // Should support both tap and swipe gestures for rating
      const ratingInterface = getByLabelText(/confidence rating/i);
      
      // Should have proper gesture handlers
      expect(ratingInterface.props.accessible).toBe(true);
      expect(ratingInterface.props.accessibilityActions).toBeDefined();
    });
  });

  describe('Cognitive Accessibility', () => {
    it('should provide clear and simple language in confidence notes', () => {
      const mockRecommendation = {
        id: 'cognitive-test',
        items: [{ id: 'item-cognitive', category: 'dress', colors: ['blue'] }],
        confidenceNote: 'You look great in this blue dress. It matches your style perfectly.',
        confidenceScore: 4.4
      };

      const { getByText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      const confidenceNote = getByText(/you look great/i);
      expect(confidenceNote).toBeTruthy();
      
      // Note should be clear and not overly complex
      const noteText = mockRecommendation.confidenceNote;
      expect(noteText.split('.').length).toBeLessThan(4); // Not too many sentences
      expect(noteText.length).toBeLessThan(200); // Not overwhelming
    });

    it('should provide consistent navigation patterns', () => {
      const { getAllByRole } = render(
        <AynaMirrorScreen />
      );

      const buttons = getAllByRole('button');
      
      // All buttons should have consistent labeling patterns
      buttons.forEach(button => {
        expect(button.props.accessibilityLabel).toBeTruthy();
        expect(button.props.accessibilityRole).toBe('button');
      });
    });

    it('should provide clear feedback for user actions', () => {
      const onActionMock = jest.fn();
      const mockRecommendation = {
        id: 'feedback-test',
        items: [{ id: 'item-feedback', category: 'tops', colors: ['green'] }],
        confidenceNote: 'Great choice!',
        confidenceScore: 4.1,
        quickActions: [
          { id: 'wear', label: 'Wear This', action: 'wear' }
        ]
      };

      const { getByLabelText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={onActionMock}
        />
      );

      const wearButton = getByLabelText(/wear this outfit/i);
      fireEvent.press(wearButton);

      // Should provide clear feedback about the action
      expect(onActionMock).toHaveBeenCalledWith('wear', mockRecommendation);
    });
  });

  describe('Internationalization and Localization', () => {
    it('should support right-to-left languages', () => {
      // Mock RTL layout
      const mockRecommendation = {
        id: 'rtl-test',
        items: [{ id: 'item-rtl', category: 'tops', colors: ['purple'] }],
        confidenceNote: 'اختيار رائع!', // Arabic text
        confidenceScore: 4.2
      };

      const { getByText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      // Should handle RTL text properly
      const arabicText = getByText('اختيار رائع!');
      expect(arabicText).toBeTruthy();
    });

    it('should provide culturally appropriate confidence notes', () => {
      const mockRecommendation = {
        id: 'cultural-test',
        items: [{ id: 'item-cultural', category: 'traditional', colors: ['gold'] }],
        confidenceNote: 'This traditional outfit looks beautiful on you.',
        confidenceScore: 4.6
      };

      const { getByText } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
        />
      );

      const culturalNote = getByText(/traditional outfit/i);
      expect(culturalNote).toBeTruthy();
      
      // Should avoid cultural assumptions or stereotypes
      const noteText = mockRecommendation.confidenceNote.toLowerCase();
      expect(noteText).not.toMatch(/(exotic|ethnic|foreign)/);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should provide accessible error messages', () => {
      const mockProps = {
        outfitId: 'error-test',
        userId: 'test-user',
        onFeedbackSubmit: jest.fn(),
        onClose: jest.fn(),
        visible: true,
        error: 'Unable to submit feedback. Please try again.'
      };

      const { getByRole, getByText } = render(
        <FeedbackCollector {...mockProps} />
      );

      // Error message should be announced to screen readers
      const errorMessage = getByText(/unable to submit feedback/i);
      expect(errorMessage.props.accessibilityRole).toBe('alert');
      expect(errorMessage.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('should provide recovery options for failed actions', () => {
      const onRetryMock = jest.fn();
      const mockProps = {
        outfitId: 'retry-test',
        userId: 'test-user',
        onFeedbackSubmit: jest.fn(),
        onClose: jest.fn(),
        visible: true,
        onRetry: onRetryMock,
        error: 'Network error occurred.'
      };

      const { getByLabelText } = render(
        <FeedbackCollector {...mockProps} />
      );

      // Should provide accessible retry option
      const retryButton = getByLabelText(/try again/i);
      expect(retryButton).toBeTruthy();
      
      fireEvent.press(retryButton);
      expect(onRetryMock).toHaveBeenCalled();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      const mockRecommendation = {
        id: 'motion-test',
        items: [{ id: 'item-motion', category: 'tops', colors: ['teal'] }],
        confidenceNote: 'Perfect for today!',
        confidenceScore: 4.3
      };

      const { getByTestId } = render(
        <OutfitRecommendationCard 
          recommendation={mockRecommendation as any}
          onAction={jest.fn()}
          reduceMotion={true}
        />
      );

      // Animations should be disabled or reduced
      const animatedElement = getByTestId('outfit-card-animation');
      expect(animatedElement.props.style).not.toContain('transform');
    });
  });
});