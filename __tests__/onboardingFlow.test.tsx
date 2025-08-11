import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-image-picker');
jest.mock('expo-camera');

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('OnboardingFlow', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnComplete.mockClear();
    
    // Mock notification permissions
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'undetermined',
      canAskAgain: true,
      granted: false,
      expires: 'never',
    });
    
    mockNotifications.requestPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    });

    // Mock image picker permissions
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    });
    
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
      granted: true,
      expires: 'never',
    });
  });

  it('renders welcome screen initially', () => {
    const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    expect(getByText('Welcome to AYNA')).toBeTruthy();
    expect(getByText('Your Mirror of Confidence')).toBeTruthy();
    expect(getByText('Begin Your Journey')).toBeTruthy();
  });

  it('navigates through onboarding steps correctly', async () => {
    const { getByText, queryByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Start at welcome screen
    expect(getByText('Welcome to AYNA')).toBeTruthy();
    
    // Navigate to wardrobe setup
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => {
      expect(getByText('Build Your Digital Wardrobe')).toBeTruthy();
    });
    
    // Skip wardrobe setup
    fireEvent.press(getByText('Skip for Now'));
    await waitFor(() => {
      expect(getByText('Tell Us About Your Style')).toBeTruthy();
    });
    
    // Skip style preferences
    fireEvent.press(getByText('Skip for Now'));
    await waitFor(() => {
      expect(getByText('Your Daily Confidence Ritual')).toBeTruthy();
    });
    
    // Skip notifications
    fireEvent.press(getByText('Maybe Later'));
    await waitFor(() => {
      expect(getByText('Your Sample Recommendations')).toBeTruthy();
    });
  });

  it('handles style preference selection correctly', async () => {
    const { getByText, getAllByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to style preferences
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => {
      fireEvent.press(getByText('Skip for Now'));
    });
    
    await waitFor(() => {
      expect(getByText('Tell Us About Your Style')).toBeTruthy();
    });
    
    // Select a style option
    fireEvent.press(getByText('Casual & Comfortable'));
    
    // Navigate to next step (colors)
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('Color Preferences')).toBeTruthy();
    });
    
    // Select a color preference
    fireEvent.press(getByText('Neutrals'));
    
    // Navigate to occasions
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('When Do You Need Outfit Help?')).toBeTruthy();
    });
    
    // Select an occasion
    fireEvent.press(getByText('Casual Daily Wear'));
    
    // Navigate to confidence notes
    fireEvent.press(getByText('Next'));
    
    await waitFor(() => {
      expect(getByText('How Should AYNA Speak to You?')).toBeTruthy();
    });
    
    // Complete style preferences
    fireEvent.press(getByText('Complete'));
    
    await waitFor(() => {
      expect(getByText('Your Daily Confidence Ritual')).toBeTruthy();
    });
  });

  it('handles notification permission request', async () => {
    const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to notifications step
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    
    await waitFor(() => {
      expect(getByText('Enable Daily Notifications')).toBeTruthy();
    });
    
    // Request notifications
    fireEvent.press(getByText('Enable Daily Notifications'));
    
    await waitFor(() => {
      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('completes onboarding flow successfully', async () => {
    const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate through all steps quickly
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    await waitFor(() => fireEvent.press(getByText('Maybe Later')));
    
    // Wait for sample outfits to load and complete
    await waitFor(() => {
      expect(getByText('Start Using AYNA Mirror')).toBeTruthy();
    }, { timeout: 5000 });
    
    fireEvent.press(getByText('Start Using AYNA Mirror'));
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationPermissionGranted: false,
          wardrobeItemsAdded: 0,
          completedAt: expect.any(Date),
        })
      );
    });
  });

  it('handles wardrobe item addition', async () => {
    const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to wardrobe setup
    fireEvent.press(getByText('Begin Your Journey'));
    
    await waitFor(() => {
      expect(getByText('Take Photo')).toBeTruthy();
    });
    
    // Mock successful image capture
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'mock-image-uri',
        width: 100,
        height: 100,
        type: 'image',
        fileName: 'test.jpg',
        fileSize: 1000,
      }],
    });
    
    // Take a photo
    fireEvent.press(getByText('Take Photo'));
    
    await waitFor(() => {
      expect(mockImagePicker.launchCameraAsync).toHaveBeenCalled();
    });
  });

  it('handles image picker gallery selection', async () => {
    const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to wardrobe setup
    fireEvent.press(getByText('Begin Your Journey'));
    
    await waitFor(() => {
      expect(getByText('Choose from Gallery')).toBeTruthy();
    });
    
    // Mock successful gallery selection
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'mock-image-uri-1',
          width: 100,
          height: 100,
          type: 'image',
          fileName: 'test1.jpg',
          fileSize: 1000,
        },
        {
          uri: 'mock-image-uri-2',
          width: 100,
          height: 100,
          type: 'image',
          fileName: 'test2.jpg',
          fileSize: 1000,
        },
      ],
    });
    
    // Select from gallery
    fireEvent.press(getByText('Choose from Gallery'));
    
    await waitFor(() => {
      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it('handles permission denied scenarios gracefully', async () => {
    // Mock denied permissions
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
      granted: false,
      expires: 'never',
    });
    
    mockNotifications.requestPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
      granted: false,
      expires: 'never',
    });
    
    const { getByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to notifications step
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    
    await waitFor(() => {
      expect(getByText('Enable Daily Notifications')).toBeTruthy();
    });
    
    // Request notifications (will be denied)
    fireEvent.press(getByText('Enable Daily Notifications'));
    
    await waitFor(() => {
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });
    
    // Should still proceed to next step
    await waitFor(() => {
      expect(getByText('Your Sample Recommendations')).toBeTruthy();
    });
  });

  it('validates style preference form correctly', async () => {
    const { getByText, queryByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to style preferences
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    
    await waitFor(() => {
      expect(getByText('Tell Us About Your Style')).toBeTruthy();
    });
    
    // Try to proceed without selecting anything
    const nextButton = getByText('Next');
    expect(nextButton).toBeTruthy();
    
    // Button should be disabled initially
    fireEvent.press(nextButton);
    
  // Should still be on the same step
  expect(getByText('Tell Us About Your Style')).toBeTruthy();
    
    // Select a style to enable the button
    fireEvent.press(getByText('Casual & Comfortable'));
    
    // Now should be able to proceed
    fireEvent.press(nextButton);
    
    await waitFor(() => {
      expect(getByText('Color Preferences')).toBeTruthy();
    });
  });

  it('handles sample outfit navigation correctly', async () => {
    const { getByText, getAllByTestId, queryByText } = render(<OnboardingFlow onComplete={mockOnComplete} />);
    
    // Navigate to sample outfits quickly
    fireEvent.press(getByText('Begin Your Journey'));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    await waitFor(() => fireEvent.press(getByText('Skip for Now')));
    await waitFor(() => fireEvent.press(getByText('Maybe Later')));
    
    // Wait for sample outfits to load
    await waitFor(() => {
      expect(getByText('Your Sample Recommendations')).toBeTruthy();
    }, { timeout: 5000 });
    
    // Should show navigation elements
    expect(getByText('Confident Professional')).toBeTruthy();
    
    // Test outfit navigation if Next button exists
  const nextButton = queryByText('Next');
    if (nextButton) {
      fireEvent.press(nextButton);
      await waitFor(() => {
        expect(getByText('Effortless Weekend')).toBeTruthy();
      });
    }
  });
});