import { Alert } from 'react-native';
import ImageUploadService, { type UploadResponse } from './imageUploadService';

interface WardrobeItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  color: string;
  size?: string;
  notes?: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateWardrobeItemData {
  name: string;
  brand?: string;
  category: string;
  color: string;
  size?: string;
  notes?: string;
  imageUri: string;
}

interface WardrobeServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class WardrobeService {
  private static instance: WardrobeService;
  private readonly baseUrl = 'https://your-api-endpoint.com/api/v1'; // TODO: Replace with actual API endpoint

  private constructor() {}

  public static getInstance(): WardrobeService {
    if (!WardrobeService.instance) {
      WardrobeService.instance = new WardrobeService();
    }
    return WardrobeService.instance;
  }

  /**
   * Creates a new wardrobe item with image upload
   * @param itemData - Item data including image URI
   * @returns Promise with creation result
   */
  async createWardrobeItem(
    itemData: CreateWardrobeItemData
  ): Promise<WardrobeServiceResponse<WardrobeItem>> {
    try {
      // Validate required fields
      if (!itemData.name.trim()) {
        throw new Error('Item name is required');
      }

      if (!itemData.category) {
        throw new Error('Category is required');
      }

      if (!itemData.imageUri) {
        throw new Error('Image is required');
      }

      // Validate image before upload
      const imageValidation = await ImageUploadService.validateImage(itemData.imageUri);
      if (!imageValidation.valid) {
        throw new Error(imageValidation.error || 'Invalid image');
      }

      // Upload image to Google Cloud Storage
      const uploadResult: UploadResponse = await ImageUploadService.uploadImage(
        itemData.imageUri,
        {
          quality: 0.8,
          maxWidth: 1200,
          maxHeight: 1600,
        }
      );

      if (!uploadResult.success || !uploadResult.imageUrl) {
        throw new Error(uploadResult.error || 'Image upload failed');
      }

      // Prepare item data for API
      const apiData = {
        name: itemData.name.trim(),
        brand: itemData.brand?.trim() || null,
        category: itemData.category,
        color: itemData.color,
        size: itemData.size || null,
        notes: itemData.notes?.trim() || null,
        imageUrl: uploadResult.imageUrl,
      };

      // Create item via API
      const response = await fetch(`${this.baseUrl}/wardrobe/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication headers
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      console.error('Create wardrobe item error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create item',
      };
    }
  }

  /**
   * Fetches all wardrobe items for the current user
   * @returns Promise with wardrobe items
   */
  async getWardrobeItems(): Promise<WardrobeServiceResponse<WardrobeItem[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/wardrobe/items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication headers
          // 'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      console.error('Get wardrobe items error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch items',
      };
    }
  }

  /**
   * Updates an existing wardrobe item
   * @param itemId - Item ID to update
   * @param updateData - Data to update
   * @returns Promise with update result
   */
  async updateWardrobeItem(
    itemId: string,
    updateData: Partial<Omit<CreateWardrobeItemData, 'imageUri'>>
  ): Promise<WardrobeServiceResponse<WardrobeItem>> {
    try {
      const response = await fetch(`${this.baseUrl}/wardrobe/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication headers
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      console.error('Update wardrobe item error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item',
      };
    }
  }

  /**
   * Deletes a wardrobe item
   * @param itemId - Item ID to delete
   * @returns Promise with deletion result
   */
  async deleteWardrobeItem(itemId: string): Promise<WardrobeServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/wardrobe/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication headers
          // 'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete wardrobe item error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete item',
      };
    }
  }

  /**
   * Shows user-friendly error message for wardrobe operations
   * @param error - Error message
   * @param operation - Operation type for context
   */
  showError(error: string, operation: 'create' | 'update' | 'delete' | 'fetch' = 'create') {
    let userMessage = 'Bir hata oluştu.';
    
    switch (operation) {
      case 'create':
        userMessage = 'Parça eklenirken bir hata oluştu.';
        break;
      case 'update':
        userMessage = 'Parça güncellenirken bir hata oluştu.';
        break;
      case 'delete':
        userMessage = 'Parça silinirken bir hata oluştu.';
        break;
      case 'fetch':
        userMessage = 'Gardırop yüklenirken bir hata oluştu.';
        break;
    }
    
    if (error.includes('network') || error.includes('fetch')) {
      userMessage += ' İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    } else if (error.includes('required')) {
      userMessage = 'Lütfen tüm gerekli alanları doldurun.';
    }

    Alert.alert('Hata', userMessage);
  }
}

export default WardrobeService.getInstance();
export type { WardrobeItem, CreateWardrobeItemData, WardrobeServiceResponse };