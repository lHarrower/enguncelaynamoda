import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType, CameraView as ExpoCamera, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';
import { errorInDev } from '@/utils/consoleSuppress';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraViewProps {
  onPhotoTaken: (photoUri: string) => void;
  onGallerySelect: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  onPhotoTaken,
  onGallerySelect,
  onClose,
  isVisible,
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<ExpoCamera | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      // Request camera permissions
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');

      // Request gallery permissions
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryPermission.status === 'granted');

      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'AYNAMODA needs camera access to help you add items to your wardrobe. Please enable camera permissions in your device settings.',
          [
            { text: 'Cancel', onPress: onClose, style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // On real device, this would open settings
                Alert.alert(
                  'Info',
                  'Please enable camera permissions in Settings > AYNAMODA > Camera',
                );
              },
            },
          ],
        );
      }
    } catch (error) {
      errorInDev('Error requesting permissions:', error instanceof Error ? error : String(error));
      Alert.alert('Error', 'Unable to request camera permissions. Please try again.');
    }
  }, [onClose, setHasCameraPermission, setHasGalleryPermission]);

  useEffect(() => {
    if (isVisible) {
      requestPermissions();
    }
  }, [isVisible, requestPermissions]);

  const handleCameraFlip = () => {
    setCameraType((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleFlashToggle = () => {
    setFlashMode((current) => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      }
    } catch (error) {
      errorInDev('Error taking photo:', error instanceof Error ? error : String(error));
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGallerySelect = async () => {
    if (!hasGalleryPermission) {
      Alert.alert(
        'Gallery Permission Required',
        'Please enable photo library access to select images from your gallery.',
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoTaken(result.assets[0].uri);
      }
    } catch (error) {
      errorInDev('Error selecting from gallery:', error instanceof Error ? error : String(error));
      Alert.alert('Error', 'Failed to select image from gallery. Please try again.');
    }
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-outline';
      case 'off':
      default:
        return 'flash-off';
    }
  };

  if (!isVisible) {
    return null;
  }

  if (hasCameraPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permissions...</Text>
        </View>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={DesignSystem.colors.terracotta[400]} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To add items to your wardrobe, AYNAMODA needs access to your camera.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
            accessibilityRole="button"
            accessibilityLabel="Enable camera access"
            accessibilityHint="Tap to grant camera permission for taking photos"
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Tap to close camera view"
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCamera ref={cameraRef} style={styles.camera} facing={cameraType} flash={flashMode}>
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close camera"
            accessibilityHint="Tap to close camera view"
          >
            <Ionicons name="close" size={28} color={DesignSystem.colors.text.inverse} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>Add New Item</Text>
            <Text style={styles.subtitleText}>Center your clothing item</Text>
          </View>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleFlashToggle}
            accessibilityRole="button"
            accessibilityLabel={`Flash ${flashMode === 'off' ? 'off' : flashMode === 'on' ? 'on' : 'auto'}`}
            accessibilityHint="Tap to toggle camera flash mode"
          >
            <Ionicons name={getFlashIcon()} size={24} color={DesignSystem.colors.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Camera Guidelines */}
        <View style={styles.guidelines}>
          <View style={styles.guideline} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGallerySelect}
            accessibilityRole="button"
            accessibilityLabel="Select from gallery"
            accessibilityHint="Tap to choose a photo from your gallery"
          >
            <Ionicons name="images" size={24} color={DesignSystem.colors.text.inverse} />
            <Text style={styles.controlText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleTakePhoto}
            disabled={isCapturing}
            accessibilityRole="button"
            accessibilityLabel={isCapturing ? 'Taking photo' : 'Take photo'}
            accessibilityHint="Tap to capture a photo of your clothing item"
            accessibilityState={{ disabled: isCapturing }}
          >
            <View style={styles.captureButtonInner}>
              {isCapturing ? (
                <Ionicons name="hourglass" size={32} color={DesignSystem.colors.text.inverse} />
              ) : (
                <View style={styles.captureButtonDot} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={handleCameraFlip}
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
            accessibilityHint="Tap to switch between front and back camera"
          >
            <Ionicons name="camera-reverse" size={24} color={DesignSystem.colors.text.inverse} />
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>
        </View>
      </ExpoCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  camera: {
    flex: 1,
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary + '33',
    borderColor: DesignSystem.colors.text.inverse,
    borderRadius: 40,
    borderWidth: 4,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonDot: {
    backgroundColor: DesignSystem.colors.terracotta[400],
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  captureButtonInner: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: DesignSystem.colors.terracotta[400],
    fontSize: 16,
  },
  container: {
    backgroundColor: DesignSystem.colors.neutral[900],
    flex: 1,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.neutral[900] + '4D',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 12,
    marginTop: 4,
    textShadowColor: DesignSystem.colors.neutral[900] + '80',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  galleryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  guideline: {
    borderColor: DesignSystem.colors.text.inverse + '80',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: screenWidth * 0.9,
    width: screenWidth * 0.7,
  },
  guidelines: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
    alignItems: 'center',
  },
  permissionButton: {
    backgroundColor: DesignSystem.colors.terracotta[400],
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  permissionButtonText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    color: DesignSystem.colors.terracotta[400],
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  permissionTitle: {
    color: DesignSystem.colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitleText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
    textShadowColor: DesignSystem.colors.neutral[900] + '80',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: DesignSystem.colors.neutral[900] + '80',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CameraView;
