import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '../constants/DesignSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_CONTAINER_HEIGHT = SCREEN_HEIGHT * 0.6;
const IMAGE_MAX_WIDTH = SCREEN_WIDTH - (DesignSystem.spacing.lg * 2);

interface ImageEditorProps {
  imageUri: string;
  onSave: (editedImageUri: string) => void;
  onCancel: () => void;
}

interface EditState {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUri, onSave, onCancel }) => {
  const [editState, setEditState] = useState<EditState>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });
  const [previewUri, setPreviewUri] = useState<string>(imageUri);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageSize({ width, height });
  }, []);

  const calculateDisplaySize = useCallback(() => {
    if (!imageSize.width || !imageSize.height) {
      return { width: IMAGE_MAX_WIDTH, height: IMAGE_CONTAINER_HEIGHT * 0.8 };
    }

    const aspectRatio = imageSize.width / imageSize.height;
    let displayWidth = IMAGE_MAX_WIDTH;
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > IMAGE_CONTAINER_HEIGHT * 0.8) {
      displayHeight = IMAGE_CONTAINER_HEIGHT * 0.8;
      displayWidth = displayHeight * aspectRatio;
    }

    return { width: displayWidth, height: displayHeight };
  }, [imageSize]);

  const applyEdit = useCallback(async (newEditState: Partial<EditState>) => {
    try {
      setIsProcessing(true);
      const updatedState = { ...editState, ...newEditState };
      setEditState(updatedState);

      const actions = [];

      // Apply rotation
      if (updatedState.rotation !== 0) {
        actions.push({ rotate: updatedState.rotation });
      }

      // Apply flips
      if (updatedState.flipHorizontal && updatedState.flipVertical) {
        actions.push({ flip: FlipType.Both });
      } else if (updatedState.flipHorizontal) {
        actions.push({ flip: FlipType.Horizontal });
      } else if (updatedState.flipVertical) {
        actions.push({ flip: FlipType.Vertical });
      }

      if (actions.length > 0) {
        const result = await manipulateAsync(
          imageUri,
          actions,
          {
            compress: 0.8,
            format: SaveFormat.JPEG,
          }
        );
        setPreviewUri(result.uri);
      } else {
        setPreviewUri(imageUri);
      }
    } catch (error) {
      console.error('Image manipulation error:', error);
      Alert.alert('Hata', 'Görüntü düzenlenirken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageUri, editState]);

  const handleRotate = useCallback(() => {
    const newRotation = (editState.rotation + 90) % 360;
    applyEdit({ rotation: newRotation });
  }, [editState.rotation, applyEdit]);

  const handleFlipHorizontal = useCallback(() => {
    applyEdit({ flipHorizontal: !editState.flipHorizontal });
  }, [editState.flipHorizontal, applyEdit]);

  const handleFlipVertical = useCallback(() => {
    applyEdit({ flipVertical: !editState.flipVertical });
  }, [editState.flipVertical, applyEdit]);

  const handleReset = useCallback(() => {
    setEditState({ rotation: 0, flipHorizontal: false, flipVertical: false });
    setPreviewUri(imageUri);
  }, [imageUri]);

  const handleSave = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      // Apply final edits with high quality
      const actions = [];

      if (editState.rotation !== 0) {
        actions.push({ rotate: editState.rotation });
      }

      if (editState.flipHorizontal && editState.flipVertical) {
        actions.push({ flip: FlipType.Both });
      } else if (editState.flipHorizontal) {
        actions.push({ flip: FlipType.Horizontal });
      } else if (editState.flipVertical) {
        actions.push({ flip: FlipType.Vertical });
      }

      let finalUri = imageUri;
      if (actions.length > 0) {
        const result = await manipulateAsync(
          imageUri,
          actions,
          {
            compress: 0.9, // Higher quality for final save
            format: SaveFormat.JPEG,
          }
        );
        finalUri = result.uri;
      }

      onSave(finalUri);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Hata', 'Görüntü kaydedilirken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageUri, editState, onSave]);

  const displaySize = calculateDisplaySize();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DesignSystem.colors.neutral[900], DesignSystem.colors.neutral[800]]}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="İptal et"
          >
            <Text style={styles.headerButtonText}>İptal</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Düzenle</Text>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.saveButton]}
            onPress={handleSave}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel="Kaydet"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.headerButtonText, styles.saveButtonText]}>Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color={DesignSystem.colors.gold[500]} />
                <Text style={styles.processingText}>İşleniyor...</Text>
              </View>
            )}
            <Image
              source={{ uri: previewUri }}
              style={[
                styles.previewImage,
                {
                  width: displaySize.width,
                  height: displaySize.height,
                },
              ]}
              onLoad={handleImageLoad}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Edit Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleRotate}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Döndür"
            >
              <LinearGradient
                colors={[DesignSystem.colors.neutral[700], DesignSystem.colors.neutral[600]]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Döndür</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFlipHorizontal}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Yatay çevir"
            >
              <LinearGradient
                colors={[
                  editState.flipHorizontal
                    ? DesignSystem.colors.gold[600]
                    : DesignSystem.colors.neutral[700],
                  editState.flipHorizontal
                    ? DesignSystem.colors.gold[500]
                    : DesignSystem.colors.neutral[600],
                ]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Yatay</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFlipVertical}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Dikey çevir"
            >
              <LinearGradient
                colors={[
                  editState.flipVertical
                    ? DesignSystem.colors.gold[600]
                    : DesignSystem.colors.neutral[700],
                  editState.flipVertical
                    ? DesignSystem.colors.gold[500]
                    : DesignSystem.colors.neutral[600],
                ]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="swap-vertical" size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Dikey</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReset}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Sıfırla"
            >
              <LinearGradient
                colors={[DesignSystem.colors.neutral[700], DesignSystem.colors.neutral[600]]}
                style={styles.controlButtonGradient}
              >
                <Ionicons name="arrow-undo" size={24} color="#FFFFFF" />
                <Text style={styles.controlButtonText}>Sıfırla</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerButton: {
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: DesignSystem.colors.gold[600],
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.bold,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    borderRadius: DesignSystem.borderRadius.lg,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DesignSystem.borderRadius.lg,
    zIndex: 1,
    gap: DesignSystem.spacing.sm,
  },
  processingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.medium,
  },
  controlsContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl + 20,
    paddingTop: DesignSystem.spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: DesignSystem.spacing.sm,
  },
  controlButton: {
    flex: 1,
    borderRadius: DesignSystem.borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  controlButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.xs,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: DesignSystem.typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default ImageEditor;