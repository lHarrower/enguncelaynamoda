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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
            <Ionicons name="close" size={28} color="#FFFFFF" />
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
                <ActivityIndicator size="large" color="#FFFFFF" />
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
              <Ionicons name="camera-outline" size={24} color="#B8918F" />
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
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
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
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    backgroundColor: '#B8918F',
    elevation: 6,
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
  container: {
    backgroundColor: '#000000',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
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
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    height: screenHeight * 0.5,
    width: screenWidth - 40,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    marginHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  processingSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(184, 145, 143, 0.15)',
    borderColor: '#B8918F',
    borderWidth: 2,
  },
  retakeButtonText: {
    color: '#B8918F',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tipItem: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    opacity: 0.8,
  },
  tipsContainer: {
    backgroundColor: 'rgba(242, 239, 233, 0.1)',
    borderColor: 'rgba(184, 145, 143, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  tipsList: {
    marginLeft: 8,
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ImagePreviewModal;
