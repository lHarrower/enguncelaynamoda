import React, { useState } from 'react';
import { View, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import CameraView from '../components/wardrobe/CameraView';
import ImagePreviewModal from '../components/wardrobe/ImagePreviewModal';
import PhotoProcessingLoader from '../components/wardrobe/PhotoProcessingLoader';
import ItemDetailsForm from '../components/wardrobe/ItemDetailsForm';
import { saveClothingItem, NewClothingItem } from '../services/wardrobeService';
import ModernLoading from '../components/ModernLoading';

type AddItemStep = 'camera' | 'preview' | 'processing' | 'details' | 'saving';

type ProcessingStatus = 'uploading' | 'removing_background' | 'analyzing' | 'processing' | 'complete';

// This type needs to match the ClothingItemSubmission interface from ItemDetailsForm
// Updated to use snake_case to match the NewClothingItem interface
type FormSubmittedData = {
  image_uri: string;
  processed_image_uri: string;
  category: string;
  subcategory?: string;
  colors: string[];
  brand?: string;
  size?: string;
  notes?: string;
};

export default function AddItemScreen() {
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<AddItemStep>('camera');
  
  // Image management
  const [capturedImageUri, setCapturedImageUri] = useState<string>('');
  const [processedImageUri, setProcessedImageUri] = useState<string>('');
  
  // Processing state
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('uploading');
  
  // AI suggestions
  const [suggestedMetadata, setSuggestedMetadata] = useState<{
    category?: string;
    colors?: string[];
  }>({});

  const handlePhotoTaken = (photoUri: string) => {
    setCapturedImageUri(photoUri);
    setCurrentStep('preview');
  };

  const handleCameraClose = () => {
    router.back();
  };

  const handlePreviewConfirm = async () => {
    setCurrentStep('processing');
    await processImage(capturedImageUri);
  };

  const handlePreviewRetake = () => {
    setCapturedImageUri('');
    setCurrentStep('camera');
  };

  const processImage = async (imageUri: string): Promise<void> => {
    // This is the mock processing logic, it remains the same
    setProcessingProgress(0);
    setProcessingStatus('uploading');
    for (let i = 0; i <= 100; i += 5) {
      if (i > 25 && i <= 60) setProcessingStatus('removing_background');
      else if (i > 60 && i <= 90) setProcessingStatus('analyzing');
      else if (i > 90) setProcessingStatus('processing');
      setProcessingProgress(i / 100);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setProcessingStatus('complete');
    setProcessedImageUri(imageUri);
    setSuggestedMetadata({ category: 'Tops', colors: ['Blue', 'White'] });
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentStep('details');
  };

  const handleItemSave = async (formData: FormSubmittedData) => {
    try {
      setCurrentStep('saving');
      
      // The form data now already contains the correct structure and field names
      // that match the NewClothingItem interface, so we can use it directly
      const savedItem = await saveClothingItem(formData);
      
      Alert.alert(
        'Success! ✨',
        `Your ${formData.category.toLowerCase()} has been added to your wardrobe!`,
        [
          { text: 'View Wardrobe', onPress: () => router.replace('/wardrobe') },
          { text: 'Add Another Item', onPress: () => resetState() }
        ]
      );
      
    } catch (error) {
      console.error('[AddItemScreen] Error caught in UI:', error);
      Alert.alert('Save Error', 'An error occurred while saving. Please try again.', [{ text: 'OK' }]);
      setCurrentStep('details');
    }
  };

  const handleDetailsCancel = () => {
    Alert.alert(
      'Discard Item?',
      'Are you sure you want to discard this item?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const resetState = () => {
    setCapturedImageUri('');
    setProcessedImageUri('');
    setProcessingProgress(0);
    setProcessingStatus('uploading');
    setSuggestedMetadata({});
    setCurrentStep('camera');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        isVisible={currentStep === 'camera'}
        onPhotoTaken={handlePhotoTaken}
        onGallerySelect={() => {}}
        onClose={handleCameraClose}
      />

      <ImagePreviewModal
        isVisible={currentStep === 'preview'}
        imageUri={capturedImageUri}
        onConfirm={handlePreviewConfirm}
        onRetake={handlePreviewRetake}
        onClose={handleCameraClose}
      />

      <PhotoProcessingLoader
        isVisible={currentStep === 'processing'}
        progress={processingProgress}
        status={processingStatus}
      />

      {currentStep === 'details' && (
        <ItemDetailsForm
          processedImageUri={processedImageUri}
          suggestedCategory={suggestedMetadata.category}
          suggestedColors={suggestedMetadata.colors}
          onSave={handleItemSave}
          onCancel={handleDetailsCancel}
        />
      )}

      {/* Saving overlay uses ModernLoading, which is a Modal */}
      <ModernLoading
        visible={currentStep === 'saving'}
        title="Saving to wardrobe..."
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 