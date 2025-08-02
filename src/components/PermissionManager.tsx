import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import CustomModal from '@/components/CustomModal';

interface PermissionManagerProps {
  children: React.ReactNode;
}

export interface PermissionManagerRef {
  requestCameraPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  openCamera: () => Promise<void>;
  openImagePicker: () => Promise<void>;
}

export default function PermissionManager({ children }: PermissionManagerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive'}>
  });

  const showPermissionDialog = (title: string, message: string, buttons: Array<{text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive'}>) => {
    setModalContent({ title, message, buttons });
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  // Check and request initial permissions on app startup
  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    // Check camera permission
    const { status: cameraStatus } = await ImagePicker.getCameraPermissionsAsync();
    
    // Check location permission
    const { status: locationStatus } = await Location.getForegroundPermissionsAsync();

    // If any permissions are not granted, show welcome dialog
    if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
      setTimeout(() => {
        showPermissionDialog(
          "Welcome to AynaModa! 💖",
          "To give you the best fashion experience, we'd like permission to:\n\n📸 Camera - Take photos of your outfits\n📍 Location - Find local boutiques and deals\n🔔 Notifications - Alert you about sales\n\nYou can always change these in settings later.",
          [
            { 
              text: "Allow All", 
              onPress: () => {
                hideModal();
                requestAllPermissions();
              }
            },
            { 
              text: "Choose Individually", 
              onPress: () => {
                hideModal();
                setTimeout(() => requestPermissionsIndividually(), 500);
              }
            },
            { text: "Maybe Later", onPress: hideModal, style: "cancel" }
          ]
        );
      }, 2000); // Show after app loads
    }
  };

  const requestAllPermissions = async () => {
    await requestCameraPermission();
    await requestLocationPermission();
  };

  const requestPermissionsIndividually = async () => {
    // Camera permission
    showPermissionDialog(
      "Camera Permission 📸",
      "Allow AynaModa to access your camera to take photos of your outfits and add them to your wardrobe?",
      [
        { 
          text: "Allow", 
          onPress: async () => {
            hideModal();
            await requestCameraPermission();
            setTimeout(() => requestLocationPermissionDialog(), 500);
          }
        },
        { 
          text: "Don't Allow", 
          onPress: () => {
            hideModal();
            setTimeout(() => requestLocationPermissionDialog(), 500);
          },
          style: "cancel" 
        }
      ]
    );
  };

  const requestLocationPermissionDialog = () => {
    showPermissionDialog(
      "Location Permission 📍",
      "Allow AynaModa to access your location to find nearby boutiques, local deals, and delivery options?",
      [
        { 
          text: "Allow", 
          onPress: async () => {
            hideModal();
            await requestLocationPermission();
          }
        },
        { text: "Don't Allow", onPress: hideModal, style: "cancel" }
      ]
    );
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        return true;
      } else {
        showPermissionDialog(
          "Camera Access Needed 📸",
          "To take photos of your outfits, please enable camera permission in your device settings.\n\nSettings > AynaModa > Camera",
          [
            { text: "OK", onPress: hideModal }
          ]
        );
        return false;
      }
    } catch (error) {
      console.log('Camera permission error:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        return true;
      } else {
        showPermissionDialog(
          "Location Access Needed 📍",
          "To find nearby boutiques and local deals, please enable location permission in your device settings.\n\nSettings > AynaModa > Location",
          [
            { text: "OK", onPress: hideModal }
          ]
        );
        return false;
      }
    } catch (error) {
      console.log('Location permission error:', error);
      return false;
    }
  };

  const openCamera = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    
    if (hasPermission) {
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          // Handle the captured image
          showPermissionDialog(
            "Photo Captured! 📸",
            "Your outfit photo has been taken! Would you like to add it to your wardrobe?",
            [
              { text: "Add to Wardrobe", onPress: hideModal },
              { text: "Retake Photo", onPress: () => { hideModal(); setTimeout(() => openCamera(), 500); }},
              { text: "Cancel", onPress: hideModal, style: "cancel" }
            ]
          );
        }
      } catch (error) {
        console.log('Camera launch error:', error);
        showPermissionDialog(
          "Camera Error",
          "There was an issue opening the camera. Please try again.",
          [{ text: "OK", onPress: hideModal }]
        );
      }
    }
  };

  const openImagePicker = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Handle the selected image
        showPermissionDialog(
          "Photo Selected! 🖼️",
          "Perfect choice! Would you like to add this photo to your wardrobe?",
          [
            { text: "Add to Wardrobe", onPress: hideModal },
            { text: "Choose Different", onPress: () => { hideModal(); setTimeout(() => openImagePicker(), 500); }},
            { text: "Cancel", onPress: hideModal, style: "cancel" }
          ]
        );
      }
    } catch (error) {
      console.log('Image picker error:', error);
      showPermissionDialog(
        "Gallery Error",
        "There was an issue opening your photo gallery. Please try again.",
        [{ text: "OK", onPress: hideModal }]
      );
    }
  };

  // Global permission manager instance
  React.useEffect(() => {
    (global as any).permissionManager = {
      requestCameraPermission,
      requestLocationPermission,
      openCamera,
      openImagePicker
    };
  }, []);

  return (
    <>
      {children}
      <CustomModal
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
        onClose={hideModal}
      />
    </>
  );
}