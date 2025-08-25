import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

import { errorInDev, warnInDev } from '../../utils/consoleSuppress';

const { width, height } = Dimensions.get('window');

interface UploadedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

interface VisualStyleDNAUploadProps {
  onComplete: (photos: UploadedPhoto[]) => void;
  onSkip: () => void;
  isGenerating?: boolean;
}

export default function VisualStyleDNAUpload({
  onComplete,
  onSkip,
  isGenerating = false,
}: VisualStyleDNAUploadProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || galleryPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need access to your camera and photo library to help you upload your favorite outfits.',
        [{ text: 'OK' }],
      );
      return false;
    }
    return true;
  };

  const handlePhotoUpload = async (useCamera: boolean = false) => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      return;
    }

    setIsUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 10 - uploadedPhotos.length,
          });

      if (!result.canceled) {
        const newPhotos: UploadedPhoto[] = result.assets.map((asset, index) => ({
          id: `photo_${Date.now()}_${index}`,
          uri: asset.uri,
          timestamp: Date.now(),
        }));

        setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      errorInDev('Error uploading photo:', error instanceof Error ? error : String(error));
      Alert.alert('Upload Error', 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    setUploadedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    if (uploadedPhotos.length >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(uploadedPhotos);
    } else {
      Alert.alert(
        'More Photos Needed',
        'Please upload at least 3 photos of your favorite outfits to generate your Style DNA.',
        [{ text: 'OK' }],
      );
    }
  };

  const renderUploadArea = () => {
    if (uploadedPhotos.length === 0) {
      return (
        <View style={styles.emptyUploadArea}>
          <View style={styles.uploadIconContainer}>
            <Ionicons name="camera-outline" size={48} color={DesignSystem.colors.sage[500]} />
          </View>
          <Text style={styles.uploadTitle}>Share Your Style Story</Text>
          <Text style={styles.uploadSubtitle}>
            Upload 5-10 photos of your favorite outfits to help us understand your unique style DNA
          </Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.primaryUploadButton}
              onPress={() => handlePhotoUpload(false)}
              disabled={isUploading}
            >
              <Ionicons name="images-outline" size={24} color="#FFFFFF" />
              <Text style={styles.primaryUploadButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryUploadButton}
              onPress={() => handlePhotoUpload(true)}
              disabled={isUploading}
            >
              <Ionicons name="camera-outline" size={24} color={DesignSystem.colors.sage[500]} />
              <Text style={styles.secondaryUploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.photoGrid}>
        {uploadedPhotos.map((photo, index) => (
          <View key={photo.id} style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.uploadedPhoto} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(photo.id)}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              accessibilityHint="Remove this photo from your style DNA upload"
            >
              <Ionicons name="close-circle" size={24} color={DesignSystem.colors.error[500]} />
            </TouchableOpacity>
          </View>
        ))}

        {uploadedPhotos.length < 10 && (
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => handlePhotoUpload(false)}
            disabled={isUploading}
          >
            <Ionicons name="add" size={32} color={DesignSystem.colors.sage[500]} />
            <Text style={styles.addMoreText}>Add More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[
        DesignSystem.colors.background.secondary,
        '#FFFFFF',
        DesignSystem.colors.background.secondary,
      ]}
      style={styles.container}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover Your Style DNA</Text>
          <Text style={styles.subtitle}>
            Every outfit tells a story. Share yours with us and we&apos;ll create a personalized style
            profile that understands your unique aesthetic.
          </Text>
        </View>

        {/* Upload Area */}
        <ScrollView
          style={styles.uploadContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.uploadContent}
        >
          {renderUploadArea()}
        </ScrollView>

        {/* Photo Count */}
        {uploadedPhotos.length > 0 && (
          <View style={styles.photoCount}>
            <Text style={styles.photoCountText}>
              {uploadedPhotos.length} of 10 photos •{' '}
              {uploadedPhotos.length >= 3
                ? 'Ready to continue'
                : `${3 - uploadedPhotos.length} more needed`}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.skipButton, isGenerating && styles.skipButtonDisabled]}
            onPress={onSkip}
            disabled={isGenerating}
          >
            <Text style={[styles.skipButtonText, isGenerating && styles.skipButtonTextDisabled]}>
              Skip for Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (uploadedPhotos.length < 3 || isGenerating) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={uploadedPhotos.length < 3 || isGenerating}
          >
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text
                  style={[
                    styles.continueButtonText,
                    uploadedPhotos.length < 3 && styles.continueButtonTextDisabled,
                  ]}
                >
                  Analyzing your style...
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={[
                    styles.continueButtonText,
                    uploadedPhotos.length < 3 && styles.continueButtonTextDisabled,
                  ]}
                >
                  Generate Style DNA
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={uploadedPhotos.length >= 3 ? '#FFFFFF' : DesignSystem.colors.sage[200]}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Decorative Elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.decorativeCircle, styles.topLeft]} />
        <View style={[styles.decorativeCircle, styles.bottomRight]} />
      </View>
    </LinearGradient>
  );
}

const createStyles = (styleObj: Record<string, any>) => {
  try {
    return StyleSheet.create(styleObj);
  } catch (error) {
    warnInDev('StyleSheet.create failed, using fallback styles:', error);
    // Return a safe fallback with basic styles
    return {
      container: { flex: 1 },
      gradient: { flex: 1 },
      scrollView: { flex: 1 },
      content: { padding: 20 },
      ...styleObj,
    };
  }
};

const styles = createStyles({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  progressDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(184, 145, 143, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: DesignSystem.colors.sage[500],
  },
  progressText: {
    fontSize: 14,
    color: DesignSystem.colors.sage[700],
    fontFamily: DesignSystem.typography.fontFamily.body,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: DesignSystem.typography.fontFamily.headline,
    color: DesignSystem.colors.sage[700],
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.sage[500],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  uploadContainer: {
    flex: 1,
  },
  uploadContent: {
    flexGrow: 1,
  },
  emptyUploadArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  uploadIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(184, 145, 143, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontFamily: DesignSystem.typography.fontFamily.headline,
    color: DesignSystem.colors.sage[700],
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadSubtitle: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.sage[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  uploadButtons: {
    width: '100%',
    gap: 16,
  },
  primaryUploadButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...DesignSystem.shadows.medium,
  },
  primaryUploadButtonText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryUploadButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DesignSystem.colors.sage[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryUploadButtonText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: '600',
    color: DesignSystem.colors.sage[500],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 16,
  },
  photoContainer: {
    position: 'relative',
    width: (width - 72) / 3,
    height: ((width - 72) / 3) * 1.33,
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...DesignSystem.shadows.soft,
  },
  addMoreButton: {
    width: (width - 72) / 3,
    height: ((width - 72) / 3) * 1.33,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DesignSystem.colors.sage[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(184, 145, 143, 0.05)',
  },
  addMoreText: {
    fontSize: 12,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.sage[500],
    marginTop: 4,
  },
  photoCount: {
    alignItems: 'center',
    marginVertical: 16,
  },
  photoCountText: {
    fontSize: 14,
    fontFamily: DesignSystem.typography.fontFamily.body,
    color: DesignSystem.colors.sage[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 32,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignSystem.colors.sage[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: '600',
    color: DesignSystem.colors.sage[500],
  },
  skipButtonDisabled: {
    opacity: 0.5,
  },
  skipButtonTextDisabled: {
    color: DesignSystem.colors.sage[200],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButton: {
    flex: 2,
    backgroundColor: DesignSystem.colors.sage[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...DesignSystem.shadows.medium,
  },
  continueButtonDisabled: {
    backgroundColor: DesignSystem.colors.sage[200],
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: DesignSystem.colors.sage[200],
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(184, 145, 143, 0.05)',
  },
  topLeft: {
    top: -60,
    left: -60,
  },
  bottomRight: {
    bottom: -60,
    right: -60,
  },
});
