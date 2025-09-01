import { Alert, Platform, Share } from 'react-native';

interface ShareOptions {
  message: string;
  url?: string;
  title?: string;
}

/**
 * Opens the native OS share sheet with the provided content
 * @param message - The main message to share
 * @param url - Optional URL to include in the share
 * @param title - Optional title for the share dialog (Android only)
 * @returns Promise<boolean> - true if shared successfully, false if cancelled/failed
 */
export const onShare = async (message: string, url?: string, title?: string): Promise<boolean> => {
  try {
    // Construct the share content
    const shareOptions: ShareOptions = {
      message: message,
    };

    // Add URL to message on iOS, or as separate field on Android
    if (url) {
      if (Platform.OS === 'ios') {
        // On iOS, append URL to message
        shareOptions.message = `${message}\n\n${url}`;
      } else {
        // On Android, URL can be a separate field
        shareOptions.url = url;
      }
    }

    // Add title for Android
    if (title && Platform.OS === 'android') {
      shareOptions.title = title;
    }

    // Open the native share sheet
    const result = await Share.share(shareOptions);

    // Handle the result
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared via specific app (iOS)
        // Shared via activity type
      } else {
        // Shared successfully (Android)
        // Content shared successfully
      }
      return true;
    } else if (result.action === Share.dismissedAction) {
      // User dismissed the share sheet
      // Share sheet dismissed
      return false;
    }

    return false;
  } catch (error) {
    // Error sharing content

    // Show user-friendly error message
    Alert.alert('Share Error', 'Unable to open share options. Please try again.', [{ text: 'OK' }]);

    return false;
  }
};

/**
 * Share an outfit combination with styling details
 * @param outfitName - Name of the outfit
 * @param items - Array of item names in the outfit
 * @param occasion - Optional occasion for the outfit
 */
export const shareOutfit = async (
  outfitName: string,
  items: string[],
  occasion?: string,
): Promise<boolean> => {
  const itemsList = items.join(', ');
  const occasionText = occasion ? ` for ${occasion}` : '';

  const message = `Check out this amazing outfit${occasionText}! 👗✨

${outfitName}
Items: ${itemsList}

Created with AYNAMODA - Your AI Style Assistant 💖`;

  return onShare(message, undefined, 'Share Outfit');
};

/**
 * Share a wardrobe item with details
 * @param itemName - Name of the clothing item
 * @param brand - Brand of the item
 * @param category - Category of the item
 */
export const shareWardrobeItem = async (
  itemName: string,
  brand?: string,
  category?: string,
): Promise<boolean> => {
  const brandText = brand ? ` by ${brand}` : '';
  const categoryText = category ? ` (${category})` : '';

  const message = `Love this piece from my wardrobe! 😍

${itemName}${brandText}${categoryText}

Organized with AYNAMODA - Your AI Style Assistant 💖`;

  return onShare(message, undefined, 'Share Wardrobe Item');
};

/**
 * Share the AYNAMODA app with friends
 */
export const shareApp = async (): Promise<boolean> => {
  const message = `I'm loving AYNAMODA! 🌟 

It's an AI-powered style assistant that helps me:
✨ Organize my wardrobe
👗 Create perfect outfits
🛍️ Discover amazing deals
💡 Get personalized style tips

You should definitely try it! Download AYNAMODA and let AI transform your style journey 💖`;

  return onShare(message, undefined, 'Share AYNAMODA');
};

/**
 * Share a style achievement or milestone
 * @param achievement - Description of the achievement
 * @param details - Additional details about the achievement
 */
export const shareAchievement = async (achievement: string, details?: string): Promise<boolean> => {
  const detailsText = details ? `\n\n${details}` : '';

  const message = `🎉 Style Achievement Unlocked! 

${achievement}${detailsText}

Powered by AYNAMODA - Your AI Style Assistant ✨`;

  return onShare(message, undefined, 'Share Achievement');
};

/**
 * EXAMPLE USAGE:
 *
 * import { onShare, shareOutfit, shareWardrobeItem } from '@/utils/sharing';
 *
 * // Basic share
 * const handleBasicShare = async () => {
 *   await onShare('Check out this amazing style tip!', 'https://aynamoda.com', 'Style Tip');
 * };
 *
 * // Share outfit
 * const handleOutfitShare = async () => {
 *   await shareOutfit('Casual Friday Look', ['Blue Jacket', 'White T-Shirt'], 'Work');
 * };
 *
 * // Share wardrobe item
 * const handleItemShare = async () => {
 *   await shareWardrobeItem('Vintage Denim Jacket', 'Levis', 'Outerwear');
 * };
 */
