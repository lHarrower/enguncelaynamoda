import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase, ENV } from '@/config/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  API_CONFIG, 
  IMAGE_CONFIG, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '@/constants/AppConstants';
import { Ionicons } from '@expo/vector-icons';

// Interface for UI callbacks that the hook will use
export interface UICallbacks {
  showLoading: (title: string, subtitle?: string) => void;
  hideLoading: () => void;
  showCustomAlert: (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive' | 'primary';
      icon?: keyof typeof Ionicons.glyphMap;
    }>,
    type?: 'default' | 'success' | 'warning' | 'error' | 'info'
  ) => void;
  hideCustomAlert: () => void;
}

export const useImageUploader = (callbacks: UICallbacks) => {
  const { user } = useAuth();
  const { showLoading, hideLoading, showCustomAlert, hideCustomAlert } = callbacks;

  // Camera upload function
  const pickImageWithCameraAsync = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert(
          "Camera Permission Required",
          "We need access to your camera to take photos of your wardrobe items. Please enable camera permissions in your device settings.",
          [{ text: "OK", onPress: hideCustomAlert }],
          "warning"
        );
        return;
      }

      showLoading('Opening Camera', 'Get ready to capture your item');

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: IMAGE_CONFIG.ASPECT_RATIO,
        quality: IMAGE_CONFIG.QUALITY,
      });

      hideLoading();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      hideLoading();
      showCustomAlert(
        "Camera Error",
        "There was an issue accessing your camera. Please try again.",
        [{ text: "OK", onPress: hideCustomAlert }],
        "error"
      );
    }
  };

  // Gallery upload function
  const pickImageWithGalleryAsync = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert(
          "Gallery Permission Required",
          "We need access to your photo gallery to select images of your wardrobe items. Please enable gallery permissions in your device settings.",
          [{ text: "OK", onPress: hideCustomAlert }],
          "warning"
        );
        return;
      }

      showLoading('Opening Gallery', 'Select your wardrobe item photo');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: IMAGE_CONFIG.ASPECT_RATIO,
        quality: IMAGE_CONFIG.QUALITY,
      });

      hideLoading();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      hideLoading();
      showCustomAlert(
        "Gallery Error",
        "There was an issue accessing your photo gallery. Please try again.",
        [{ text: "OK", onPress: hideCustomAlert }],
        "error"
      );
    }
  };

  // Upload image to Supabase and analyze with AI
  const uploadImage = async (imageUri: string) => {
    try {
      if (!user) {
        showCustomAlert(
          "Authentication Required",
          "Please sign in to upload images to your wardrobe.",
          [{ text: "OK", onPress: hideCustomAlert }],
          "warning"
        );
        return;
      }

      showLoading('Processing Image', 'Uploading and analyzing your item...');

      // Create a unique filename
      const filename = `wardrobe_${user.id}_${Date.now()}.jpg`;

      // Convert image to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      console.log('Uploading image to Supabase...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(API_CONFIG.SUPABASE_STORAGE_BUCKET)
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Image uploaded successfully:', uploadData.path);

      // Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from(API_CONFIG.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;
      console.log('Public URL:', imageUrl);

      // Analyze the image with AI
      await analyzeImageWithAI(imageUrl);

    } catch (error) {
      console.error('Upload process error:', error);
      hideLoading();
      
      showCustomAlert(
        "Upload Failed",
        ERROR_MESSAGES.NETWORK_ERROR,
        [{ text: "OK", onPress: hideCustomAlert }],
        "error"
      );
    }
  };

  // Helper function to ask specific questions to the VQA model
  const askQuestionToAI = async (imageUrl: string, question: string): Promise<string> => {
    // For cost-efficiency, prefer text reasoning via OpenRouter. For VQA (image+question),
    // use OpenAI vision via ai-proxy, sending the image URL and question.
    try {
      const { aiProxyChatCompletion } = await import('@/config/aiProxy');
      const completion: any = await aiProxyChatCompletion({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: `Answer concisely: ${question}` },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      });
      const content = completion?.choices?.[0]?.message?.content?.trim();
      return content || 'unknown';
    } catch (err) {
      console.error('VQA via ai-proxy failed, returning unknown:', err);
      return 'unknown';
    }
  };

  // Analyze image with AI using Visual Question Answering
  const analyzeImageWithAI = async (imageUrl: string) => {
    try {
      console.log('Starting AI analysis for image:', imageUrl);

      // Ask specific questions to get structured data
      const categoryQuestion = "What is the category of this clothing item?";
      const colorQuestion = "What are the main colors as comma separated list?";

      // Get answers from the VQA model
      const categoryAnswer = await askQuestionToAI(imageUrl, categoryQuestion);
      const colorAnswer = await askQuestionToAI(imageUrl, colorQuestion);

      console.log('AI Analysis Results:', {
        category: categoryAnswer,
        colors: colorAnswer
      });

      // Process the colors into an array
      const colorsArray = colorAnswer
        .split(',')
        .map(color => color.trim().toLowerCase())
        .filter(color => color.length > 0 && color !== 'unknown');

      // Prepare the data for database insertion
      const wardrobeItem = {
        user_id: user?.id,
        image_url: imageUrl,
        category: categoryAnswer !== 'unknown' ? categoryAnswer : 'clothing',
        colors: colorsArray.length > 0 ? colorsArray : ['unspecified'],
        description: categoryAnswer !== 'unknown' ? categoryAnswer : 'clothing item',
        created_at: new Date().toISOString()
      };

      console.log('Saving to database:', wardrobeItem);

      // Save to Supabase database
      const { error: dbError } = await supabase
        .from('wardrobe_items')
        .insert([wardrobeItem]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to save to database: ${dbError.message}`);
      }

      hideLoading();

      showCustomAlert(
        "Item Added Successfully! ✨",
        `Your ${wardrobeItem.category} has been analyzed and added to your wardrobe with colors: ${wardrobeItem.colors.join(', ')}.`,
        [{ text: "Awesome!", onPress: hideCustomAlert }],
        "success"
      );

    } catch (error) {
      console.error('AI analysis error:', error);
      hideLoading();
      
      showCustomAlert(
        "AI Analysis Failed",
        "We couldn't analyze your image with AI right now. The image was uploaded but you may need to edit the details manually.",
        [{ text: "OK", onPress: hideCustomAlert }],
        "warning"
      );
    }
  };

  // Return separate functions for camera and gallery uploads
  return {
    handleCameraUpload: pickImageWithCameraAsync,
    handleGalleryUpload: pickImageWithGalleryAsync,
  };
};