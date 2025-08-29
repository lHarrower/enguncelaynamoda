import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImagePreviewModalProps {
  imageUri: string;
  isVisible: boolean;
  onConfirm: () => void;
  onRetake: () => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUri,
  isVisible,
  onConfirm,
  onRetake,
  onClose,
  isProcessing = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor={DesignSystem.colors.background.dark} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
            accessibilityHint="Tap to close the image preview modal"
          >
            <Ionicons name="close" size={28} color={DesignSystem.colors.text.inverse} />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.titleText}>Preview Photo</Text>
            <Text style={styles.subtitleText}>
              {isProcessing ? 'Processing...' : 'Does this look good?'}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />

          {/* Processing Overlay */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <View style={styles.processingContent}>
                <ActivityIndicator size="large" color={DesignSystem.colors.text.inverse} />
                <Text style={styles.processingText}>Processing your photo...</Text>
                <Text style={styles.processingSubtext}>
                  Removing background and analyzing item details
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionButtons}>
            {/* Retake Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={onRetake}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
              accessibilityHint="Tap to retake the photo"
              accessibilityState={{ disabled: isProcessing }}
            >
              <Ionicons name="camera-outline" size={24} color={DesignSystem.colors.primary[500]} />
              <Text style={[styles.actionButtonText, styles.retakeButtonText]}>Retake</Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                isProcessing && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel={isProcessing ? 'Processing photo' : 'Confirm photo'}
              accessibilityHint={
                isProcessing ? 'Photo is being processed' : 'Tap to confirm and use this photo'
              }
              accessibilityState={{ disabled: isProcessing }}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={DesignSystem.colors.text.inverse} />
              ) : (
                <Ionicons name="checkmark" size={24} color={DesignSystem.colors.text.inverse} />
              )}
              <Text style={[styles.actionButtonText, styles.confirmButtonText]}>
                {isProcessing ? 'Processing...' : 'Look Perfect!'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Helpful Tips */}
          {!isProcessing && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Make sure the item is clearly visible</Text>
                <Text style={styles.tipItem}>• Good lighting helps with AI processing</Text>
                <Text style={styles.tipItem}>• The entire item should be in frame</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: DesignSystem.radius.sm,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  actionButtonText: {
    fontSize: DesignSystem.typography.fontSize.md,
    fontWeight: 'bold',
    marginLeft: DesignSystem.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionsContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  confirmButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    elevation: 6,
    shadowColor: DesignSystem.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonText: {
    color: DesignSystem.colors.text.inverse,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.dark,
    flex: 1,
  },
  disabledButton: {
    opacity: 0.7,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.overlay,
    borderRadius: DesignSystem.radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  previewImage: {
    backgroundColor: DesignSystem.colors.neutral[800],
    borderRadius: DesignSystem.radius.md,
    height: screenHeight * 0.5,
    width: screenWidth - 40,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingOverlay: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.overlay,
    borderRadius: DesignSystem.radius.md,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    marginHorizontal: DesignSystem.spacing.lg,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  processingSubtext: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.sm,
    marginTop: DesignSystem.spacing.xs,
    opacity: 0.8,
    paddingHorizontal: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  processingText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: 'bold',
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
  retakeButton: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderColor: DesignSystem.colors.primary[500],
    borderWidth: 2,
  },
  retakeButtonText: {
    color: DesignSystem.colors.primary[500],
  },
  subtitleText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.sm,
    marginTop: DesignSystem.spacing.xs,
    opacity: 0.8,
    textShadowColor: DesignSystem.colors.background.overlay,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tipItem: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.xs,
    opacity: 0.8,
  },
  tipsContainer: {
    backgroundColor: DesignSystem.colors.background.secondary,
    borderColor: DesignSystem.colors.primary[200],
    borderRadius: DesignSystem.radius.sm,
    borderWidth: 1,
    padding: DesignSystem.spacing.md,
  },
  tipsList: {
    marginLeft: 8,
  },
  tipsTitle: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: DesignSystem.spacing.sm,
  },
  titleText: {
    color: DesignSystem.colors.text.inverse,
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: 'bold',
    textShadowColor: DesignSystem.colors.background.overlay,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ImagePreviewModal;
