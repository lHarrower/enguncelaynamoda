import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DesignSystem } from '@/theme/DesignSystem';
import ImageEditor from '@/components/ImageEditor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = DesignSystem.spacing.lg;
const UPLOAD_AREA_HEIGHT = 280;

interface AddItemScreenProps {}

const AddItemScreen: React.FC<AddItemScreenProps> = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Kamera İzni Gerekli',
        'Fotoğraf çekebilmek için kamera iznine ihtiyacımız var.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => {} },
        ]
      );
      return false;
    }
    return true;
  }, []);

  const requestGalleryPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Galeri İzni Gerekli',
        'Galeriden fotoğraf seçebilmek için galeri iznine ihtiyacımız var.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Ayarlara Git', onPress: () => {} },
        ]
      );
      return false;
    }
    return true;
  }, []);

  const handleTakePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTempImageUri(result.assets[0].uri);
        setShowImageEditor(true);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  }, [requestCameraPermission]);

  const handleSelectFromGallery = useCallback(async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTempImageUri(result.assets[0].uri);
        setShowImageEditor(true);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  }, [requestGalleryPermission]);

  const handleImageEditorSave = useCallback((editedImageUri: string) => {
    setSelectedImage(editedImageUri);
    setShowImageEditor(false);
    setTempImageUri(null);
  }, []);

  const handleImageEditorCancel = useCallback(() => {
    setShowImageEditor(false);
    setTempImageUri(null);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedImage) {
      Alert.alert('Uyarı', 'Lütfen önce bir fotoğraf seçin.');
      return;
    }
    // Navigate to product details form with the selected image
    router.push({
      pathname: '/add-item-details',
      params: { imageUri: selectedImage },
    });
  }, [selectedImage]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.neutral[50], DesignSystem.colors.neutral[100]]}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
          >
            <Ionicons name="arrow-back" size={24} color={DesignSystem.colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Parça Ekle</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Inspiration Text */}
          <View style={styles.inspirationContainer}>
            <Text style={styles.inspirationTitle}>
              Hazinenize Yeni Bir Parça
            </Text>
            <Text style={styles.inspirationSubtitle}>
              Her parça bir hikaye, her seçim bir sanat eseri.{"\n"}
              Koleksiyonunuza değer katacak bu anı ölümsüzleştirin.
            </Text>
          </View>

          {/* Upload Area */}
          <View style={styles.uploadContainer}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={32} color={DesignSystem.colors.neutral[600]} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadArea}>
                <LinearGradient
                  colors={[
                    DesignSystem.colors.gold[100],
                    DesignSystem.colors.gold[50],
                  ]}
                  style={styles.uploadGradient}
                >
                  <View style={styles.uploadIconContainer}>
                    <Ionicons
                      name="camera"
                      size={48}
                      color={DesignSystem.colors.gold[600]}
                    />
                    <View style={styles.sparkleContainer}>
                      <View style={[styles.sparkle, styles.sparkle1]} />
                      <View style={[styles.sparkle, styles.sparkle2]} />
                    </View>
                  </View>
                  <Text style={styles.uploadTitle}>Fotoğraf Ekleyin</Text>
                  <Text style={styles.uploadSubtitle}>
                    Parçanızın en güzel açısını yakalayın
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {!selectedImage && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleTakePhoto}
                disabled={isUploading}
                accessibilityRole="button"
                accessibilityLabel="Fotoğraf çek"
              >
                <LinearGradient
                  colors={[
                    DesignSystem.colors.primary[500],
                    DesignSystem.colors.primary[600],
                  ]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Fotoğraf Çek</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSelectFromGallery}
                disabled={isUploading}
                accessibilityRole="button"
                accessibilityLabel="Galeriden seç"
              >
                <LinearGradient
                  colors={[
                    DesignSystem.colors.secondary[500],
                    DesignSystem.colors.secondary[600],
                  ]}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Galeriden Seç</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Continue Button */}
          {selectedImage && (
            <View style={styles.continueContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                accessibilityRole="button"
                accessibilityLabel="Devam et"
              >
                <LinearGradient
                  colors={[
                    DesignSystem.colors.gold[500],
                    DesignSystem.colors.gold[600],
                  ]}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>Devam Et</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Image Editor Modal */}
      <Modal
        visible={showImageEditor}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        {tempImageUri && (
          <ImageEditor
            imageUri={tempImageUri}
            onSave={handleImageEditorSave}
            onCancel={handleImageEditorCancel}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[50],
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xl + 20,
    paddingBottom: DesignSystem.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.neutral[800],
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  inspirationContainer: {
    marginBottom: DesignSystem.spacing.xl,
    alignItems: 'center',
  },
  inspirationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: DesignSystem.colors.neutral[800],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
    fontFamily: DesignSystem.typography.fontFamily.bold,
  },
  inspirationSubtitle: {
    fontSize: 16,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: DesignSystem.typography.fontFamily.regular,
  },
  uploadContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  uploadArea: {
    height: UPLOAD_AREA_HEIGHT,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: DesignSystem.colors.gold[200],
    borderStyle: 'dashed',
  },
  uploadGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing.xl,
  },
  uploadIconContainer: {
    position: 'relative',
    marginBottom: DesignSystem.spacing.lg,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  sparkle: {
    width: 8,
    height: 8,
    backgroundColor: DesignSystem.colors.gold[400],
    borderRadius: 4,
    position: 'absolute',
  },
  sparkle1: {
    top: 0,
    right: 0,
  },
  sparkle2: {
    top: 12,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.gold[700],
    marginBottom: DesignSystem.spacing.sm,
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: DesignSystem.colors.gold[600],
    textAlign: 'center',
    fontFamily: DesignSystem.typography.fontFamily.regular,
  },
  selectedImageContainer: {
    position: 'relative',
    height: UPLOAD_AREA_HEIGHT,
    borderRadius: DesignSystem.borderRadius.xl,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    top: DesignSystem.spacing.md,
    right: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.neutral[100],
    borderRadius: 16,
  },
  actionContainer: {
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.xl,
  },
  actionButton: {
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.xl,
    gap: DesignSystem.spacing.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  continueContainer: {
    marginTop: DesignSystem.spacing.lg,
  },
  continueButton: {
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.lg + 2,
    paddingHorizontal: DesignSystem.spacing.xl,
    gap: DesignSystem.spacing.sm,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.bold,
  },
});

export default AddItemScreen;