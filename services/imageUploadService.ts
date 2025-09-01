import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';

interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

interface ImageUploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

class ImageUploadService {
  private static instance: ImageUploadService;
  private readonly baseUrl = 'https://your-api-endpoint.com/api/v1'; // TODO: Replace with actual API endpoint

  private constructor() {}

  public static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  /**
   * Uploads an image to Google Cloud Storage via backend API
   * @param imageUri - Local image URI from camera or gallery
   * @param options - Upload options for image processing
   * @returns Promise with upload result
   */
  async uploadImage(
    imageUri: string,
    options: ImageUploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      // Validate image URI
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // Prepare image for upload
      const processedImageUri = await this.processImage(imageUri, options);

      // Create form data for multipart upload
      const formData = new FormData();
      
      // Get file extension
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `wardrobe_item_${Date.now()}.${fileExtension}`;

      formData.append('image', {
        uri: processedImageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      // Add metadata
      formData.append('folder', 'wardrobe-items');
      formData.append('quality', (options.quality || 0.8).toString());

      // Upload to backend API
      const response = await fetch(`${this.baseUrl}/upload/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          // TODO: Add authentication headers
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        imageUrl: result.imageUrl || result.url,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Processes image before upload (resize, compress, etc.)
   * @param imageUri - Original image URI
   * @param options - Processing options
   * @returns Processed image URI
   */
  private async processImage(
    imageUri: string,
    options: ImageUploadOptions
  ): Promise<string> {
    try {
      const {
        quality = 0.8,
        maxWidth = 1200,
        maxHeight = 1600,
      } = options;

      // Get original image dimensions
      const originalImage = await manipulateAsync(imageUri, [], {
        format: SaveFormat.JPEG,
      });

      // Calculate resize dimensions while maintaining aspect ratio
      const actions = [];
      
      // Only resize if image is larger than max dimensions
      if (originalImage.width > maxWidth || originalImage.height > maxHeight) {
        const aspectRatio = originalImage.width / originalImage.height;
        let newWidth = maxWidth;
        let newHeight = maxHeight;

        if (aspectRatio > 1) {
          // Landscape: width is larger
          newHeight = maxWidth / aspectRatio;
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = maxHeight * aspectRatio;
          }
        } else {
          // Portrait: height is larger
          newWidth = maxHeight * aspectRatio;
          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = maxWidth / aspectRatio;
          }
        }

        actions.push({
          resize: {
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          },
        });
      }

      // Apply processing if needed
      if (actions.length > 0) {
        const result = await manipulateAsync(imageUri, actions, {
          compress: quality,
          format: SaveFormat.JPEG,
        });
        return result.uri;
      } else {
        // Just compress without resizing
        const result = await manipulateAsync(imageUri, [], {
          compress: quality,
          format: SaveFormat.JPEG,
        });
        return result.uri;
      }
    } catch (error) {
      console.warn('Image processing failed, using original:', error);
      return imageUri;
    }
  }

  /**
   * Validates image file before upload
   * @param imageUri - Image URI to validate
   * @returns Validation result
   */
  async validateImage(imageUri: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists) {
        return { valid: false, error: 'File does not exist' };
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileInfo.size && fileInfo.size > maxSize) {
        return { valid: false, error: 'File size too large (max 10MB)' };
      }

      // Check if it's an image file
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const extension = imageUri.split('.').pop()?.toLowerCase();
      
      if (!extension || !validExtensions.includes(extension)) {
        return { valid: false, error: 'Invalid file format. Please use JPG, PNG, or WebP.' };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Shows user-friendly error message
   * @param error - Error message
   */
  showUploadError(error: string) {
    let userMessage = 'Görüntü yüklenirken bir hata oluştu.';
    
    if (error.includes('network') || error.includes('fetch')) {
      userMessage = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    } else if (error.includes('size')) {
      userMessage = 'Görüntü dosyası çok büyük. Lütfen daha küçük bir dosya seçin.';
    } else if (error.includes('format')) {
      userMessage = 'Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya WebP formatında bir görüntü seçin.';
    }

    Alert.alert('Yükleme Hatası', userMessage);
  }
}

export default ImageUploadService.getInstance();
export type { UploadResponse, ImageUploadOptions };