// Wardrobe Service - Supabase Integration with Image Upload
import supabase from '../config/supabaseClient';

// We can define the type for a new clothing item, which won't have an id or created_at yet.
// Supabase will generate these automatically.
export interface NewClothingItem {
  image_uri: string;
  processed_image_uri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  notes?: string;
  // user_id will be handled by RLS (Row Level Security) in Supabase
}

/**
 * Helper function to upload an image to Supabase Storage and get its public URL
 * @param fileUri - The local file URI (file:// path)
 * @returns The public URL of the uploaded image
 */
const uploadImageAndGetUrl = async (fileUri: string): Promise<string> => {
  console.log('[WardrobeService] Starting image upload for:', fileUri);
  
  try {
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `wardrobe_item_${timestamp}.jpg`;
    
    console.log('[WardrobeService] Creating FormData for upload with filename:', fileName);
    
    // Create FormData object for React Native upload
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: 'photo.jpg',
      type: 'image/jpeg'
    } as any);
    
    console.log('[WardrobeService] FormData created, uploading to Supabase Storage...');
    
    // Upload to Supabase Storage using FormData
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wardrobe-photos')
      .upload(fileName, formData, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      console.error('[WardrobeService] Upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('[WardrobeService] Upload successful, path:', uploadData.path);
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('wardrobe-photos')
      .getPublicUrl(uploadData.path);
    
    console.log('[WardrobeService] Public URL generated:', urlData.publicUrl);
    
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('[WardrobeService] Image upload failed:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Saves a new clothing item to the Supabase database.
 * @param item - The clothing item data.
 * @returns The data of the newly created item from the database.
 */
export const saveClothingItem = async (item: NewClothingItem) => {
  console.log('[WardrobeService] saveClothingItem function received data:', item);
  
  try {
    console.log('[WardrobeService] Starting image upload process...');
    
    // Upload the main image and get its public URL
    const uploadedImageUrl = await uploadImageAndGetUrl(item.image_uri);
    console.log('[WardrobeService] Image uploaded successfully, URL:', uploadedImageUrl);
    
    // For now, we'll use the same uploaded image for processed_image_uri
    // In a real app, you might process the image differently or upload a separate processed version
    const processedImageUrl = uploadedImageUrl;
    
    console.log('[WardrobeService] Attempting to insert into Supabase database...');
    console.log('[WardrobeService] Using table name: wardrobeItems');
    
    // Create the item object with real public URLs (all snake_case keys)
    const itemToSave = {
      ...item, // Keep all other item properties (already in snake_case)
      image_uri: uploadedImageUrl, // Use the real uploaded image URL
      processed_image_uri: processedImageUrl // Use the real processed image URL
    };
    
    console.log('[WardrobeService] Item to save with snake_case keys:', itemToSave);
    console.log('[WardrobeService] Item keys:', Object.keys(itemToSave));
    
    const { data, error } = await supabase
      .from('wardrobeItems') // FIXED: Changed from 'wardrobe_items' to 'wardrobeItems'
      .insert([itemToSave])
      .select()
      .single(); // .single() is used to return a single object instead of an array

    if (error) {
      console.error('[WardrobeService] Supabase database error FULL DETAILS:');
      console.error('[WardrobeService] Error object:', error);
      console.error('[WardrobeService] Error message:', error.message);
      console.error('[WardrobeService] Error details:', error.details);
      console.error('[WardrobeService] Error hint:', error.hint);
      console.error('[WardrobeService] Error code:', error.code);
      
      // Throw the Supabase error for the calling function to handle
      throw error;
    }

    console.log('[WardrobeService] Successfully inserted. Full response data:', data);
    console.log('[WardrobeService] Successfully inserted. Document ID:', data?.id);
    return data;

  } catch (error) {
    console.error('[WardrobeService] CATCH BLOCK - Full error details:');
    console.error('[WardrobeService] Error type:', typeof error);
    console.error('[WardrobeService] Error object:', error);
    
    if (error && typeof error === 'object') {
      console.error('[WardrobeService] Error message:', (error as any).message);
      console.error('[WardrobeService] Error details:', (error as any).details);
      console.error('[WardrobeService] Error hint:', (error as any).hint);
      console.error('[WardrobeService] Error code:', (error as any).code);
    }

    // Re-throw the error with a more descriptive message
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Failed to save clothing item: ${message}`);
  }
}; 