import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  isProcessing = false
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
          <Image 
            source={{ uri: imageUri }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
          
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
            >
              <Ionicons name="camera-outline" size={24} color="#B8918F" />
              <Text style={[styles.actionButtonText, styles.retakeButtonText]}>
                Retake
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.confirmButton,
                isProcessing && styles.disabledButton
              ]}
              onPress={onConfirm}
              disabled={isProcessing}
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  previewImage: {
    width: screenWidth - 40,
    height: screenHeight * 0.5,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  processingSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  retakeButton: {
    backgroundColor: 'rgba(184, 145, 143, 0.15)',
    borderWidth: 2,
    borderColor: '#B8918F',
  },
  confirmButton: {
    backgroundColor: '#B8918F',
    shadowColor: '#B8918F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retakeButtonText: {
    color: '#B8918F',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
  tipsContainer: {
    backgroundColor: 'rgba(242, 239, 233, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(184, 145, 143, 0.3)',
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipsList: {
    marginLeft: 8,
  },
  tipItem: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default ImagePreviewModal; 