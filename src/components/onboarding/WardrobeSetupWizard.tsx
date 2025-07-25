import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { APP_THEME_V2 } from '../../constants/AppThemeV2';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface WardrobeSetupWizardProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function WardrobeSetupWizard({ onNext, onSkip }: WardrobeSetupWizardProps) {
  const [itemsAdded, setItemsAdded] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library access to help you build your digital wardrobe.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setIsCapturing(true);
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // In a real implementation, this would save to wardrobe service
        setItemsAdded(prev => prev + 1);
        Alert.alert('Success!', 'Item added to your wardrobe');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGallerySelect = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets.length > 0) {
        // In a real implementation, this would save to wardrobe service
        setItemsAdded(prev => prev + result.assets.length);
        Alert.alert('Success!', `${result.assets.length} items added to your wardrobe`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select images');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[APP_THEME_V2.colors.linen.light, APP_THEME_V2.colors.linen.base]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Animated.View 
              entering={FadeInUp.delay(200).duration(600)}
              style={styles.header}
            >
              <Text style={styles.title}>Build Your Digital Wardrobe</Text>
              <Text style={styles.subtitle}>
                Add your favorite pieces so AYNA can create perfect outfit combinations
              </Text>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(400).duration(600)}
              style={styles.progressSection}
            >
              <BlurView intensity={15} style={styles.progressCard}>
                <Text style={styles.progressTitle}>Getting Started</Text>
                <Text style={styles.progressText}>
                  Add at least 5-10 items to get personalized recommendations
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((itemsAdded / 5) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressCount}>
                  {itemsAdded} items added {itemsAdded >= 5 && '✨'}
                </Text>
              </BlurView>
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(600).duration(600)}
              style={styles.actionsSection}
            >
              <Text style={styles.actionsTitle}>Add Your Clothing Items</Text>
              
              <View style={styles.actionButtons}>
                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed
                  ]}
                  onPress={handleCameraCapture}
                  disabled={isCapturing}
                >
                  <BlurView intensity={20} style={styles.actionButtonContent}>
                    <Ionicons 
                      name="camera" 
                      size={32} 
                      color={APP_THEME_V2.colors.sageGreen[600]} 
                    />
                    <Text style={styles.actionButtonTitle}>Take Photo</Text>
                    <Text style={styles.actionButtonSubtitle}>
                      Capture items with your camera
                    </Text>
                  </BlurView>
                </Animated.Pressable>

                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed
                  ]}
                  onPress={handleGallerySelect}
                >
                  <BlurView intensity={20} style={styles.actionButtonContent}>
                    <Ionicons 
                      name="images" 
                      size={32} 
                      color={APP_THEME_V2.colors.liquidGold[600]} 
                    />
                    <Text style={styles.actionButtonTitle}>Choose from Gallery</Text>
                    <Text style={styles.actionButtonSubtitle}>
                      Select multiple photos at once
                    </Text>
                  </BlurView>
                </Animated.Pressable>
              </View>

              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
                <View style={styles.tipsList}>
                  <Text style={styles.tipItem}>• Use good lighting for best results</Text>
                  <Text style={styles.tipItem}>• Lay items flat or hang them up</Text>
                  <Text style={styles.tipItem}>• Include shoes, accessories, and outerwear</Text>
                  <Text style={styles.tipItem}>• AYNA will automatically categorize everything</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(800).duration(600)}
              style={styles.navigationSection}
            >
              <View style={styles.navigationButtons}>
                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.skipButton,
                    pressed && styles.skipButtonPressed
                  ]}
                  onPress={onSkip}
                >
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </Animated.Pressable>

                <Animated.Pressable
                  style={({ pressed }) => [
                    styles.continueButton,
                    itemsAdded < 3 && styles.continueButtonDisabled,
                    pressed && styles.continueButtonPressed
                  ]}
                  onPress={onNext}
                  disabled={itemsAdded < 3}
                >
                  <LinearGradient
                    colors={
                      itemsAdded >= 3 
                        ? [APP_THEME_V2.colors.sageGreen[400], APP_THEME_V2.colors.sageGreen[600]]
                        : [APP_THEME_V2.colors.inkGray[300], APP_THEME_V2.colors.inkGray[400]]
                    }
                    style={styles.continueButtonGradient}
                  >
                    <Text style={[
                      styles.continueButtonText,
                      itemsAdded < 3 && styles.continueButtonTextDisabled
                    ]}>
                      Continue
                    </Text>
                  </LinearGradient>
                </Animated.Pressable>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingTop: APP_THEME_V2.spacing.xl,
    paddingBottom: APP_THEME_V2.spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  title: {
    ...APP_THEME_V2.typography.scale.h1,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.md,
  },
  subtitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  progressCard: {
    ...APP_THEME_V2.glassmorphism.subtle,
    borderRadius: APP_THEME_V2.radius.organic,
    padding: APP_THEME_V2.spacing.lg,
    ...APP_THEME_V2.elevation.whisper,
  },
  progressTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  progressText: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    marginBottom: APP_THEME_V2.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: APP_THEME_V2.colors.moonlightSilver,
    borderRadius: APP_THEME_V2.radius.sm,
    marginBottom: APP_THEME_V2.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: APP_THEME_V2.colors.sageGreen[500],
    borderRadius: APP_THEME_V2.radius.sm,
  },
  progressCount: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.tertiary,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  actionsTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
    textAlign: 'center',
    marginBottom: APP_THEME_V2.spacing.lg,
  },
  actionButtons: {
    gap: APP_THEME_V2.spacing.md,
    marginBottom: APP_THEME_V2.spacing.xl,
  },
  actionButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.whisper,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  actionButtonContent: {
    padding: APP_THEME_V2.spacing.lg,
    borderRadius: APP_THEME_V2.radius.organic,
    alignItems: 'center',
  },
  actionButtonTitle: {
    ...APP_THEME_V2.typography.scale.h3,
    color: APP_THEME_V2.semantic.text.primary,
    marginTop: APP_THEME_V2.spacing.sm,
    marginBottom: APP_THEME_V2.spacing.xs,
  },
  actionButtonSubtitle: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    textAlign: 'center',
  },
  tipsSection: {
    ...APP_THEME_V2.glassmorphism.subtle,
    borderRadius: APP_THEME_V2.radius.md,
    padding: APP_THEME_V2.spacing.lg,
  },
  tipsTitle: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.primary,
    fontWeight: '600',
    marginBottom: APP_THEME_V2.spacing.sm,
  },
  tipsList: {
    gap: APP_THEME_V2.spacing.xs,
  },
  tipItem: {
    ...APP_THEME_V2.typography.scale.body2,
    color: APP_THEME_V2.semantic.text.secondary,
    lineHeight: 20,
  },
  navigationSection: {
    marginTop: APP_THEME_V2.spacing.xl,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: APP_THEME_V2.spacing.md,
  },
  skipButton: {
    paddingVertical: APP_THEME_V2.spacing.md,
    paddingHorizontal: APP_THEME_V2.spacing.lg,
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.tertiary,
  },
  continueButton: {
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
    flex: 1,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  continueButtonGradient: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingVertical: APP_THEME_V2.spacing.md,
    borderRadius: APP_THEME_V2.radius.organic,
    alignItems: 'center',
  },
  continueButtonText: {
    ...APP_THEME_V2.typography.scale.button,
    color: APP_THEME_V2.semantic.text.inverse,
  },
  continueButtonTextDisabled: {
    color: APP_THEME_V2.colors.inkGray[600],
  },
});