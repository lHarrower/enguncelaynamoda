// AI Name Generator Component
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAINaming } from '@/hooks/useAINaming';
import { DesignSystem } from '@/theme/DesignSystem';
import { WardrobeItem } from '@/types/aynaMirror';

import { NamingPreferences } from './NamingPreferences';

interface AINameGeneratorProps {
  item: Partial<WardrobeItem>;
  onNameSelected: (name: string, isAIGenerated: boolean) => void;
  onCancel?: () => void;
  initialName?: string;
  showPreferences?: boolean;
}

export const AINameGenerator: React.FC<AINameGeneratorProps> = ({
  item,
  onNameSelected,
  onCancel,
  initialName = '',
  showPreferences = false,
}) => {
  const {
    isGenerating,
    error,
    lastResponse,
    generateNameForItem,
    clearError,
    getEffectiveName,
    saveNamingChoice,
  } = useAINaming();

  const [customName, setCustomName] = useState(initialName);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateName = useCallback(async () => {
    if (!item.imageUri) {
      return;
    }

    clearError();
    setHasGenerated(true);

    const response = await generateNameForItem(item);
    if (response) {
      setSelectedSuggestion(response.aiGeneratedName);
      if (!customName) {
        setCustomName(response.aiGeneratedName);
      }
    }
  }, [
    clearError,
    setHasGenerated,
    generateNameForItem,
    item,
    setSelectedSuggestion,
    customName,
    setCustomName,
  ]);

  // Auto-generate name on mount if item has image
  useEffect(() => {
    if (item.imageUri && !hasGenerated && !initialName) {
      handleGenerateName();
    }
  }, [item.imageUri, handleGenerateName, hasGenerated, initialName]);

  // Update custom name when AI name is generated
  useEffect(() => {
    if (lastResponse && !customName) {
      setCustomName(lastResponse.aiGeneratedName);
      setSelectedSuggestion(lastResponse.aiGeneratedName);
    }
  }, [lastResponse, customName]);

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomName(suggestion);
  };

  const handleAcceptName = async () => {
    const finalName = customName.trim() || lastResponse?.aiGeneratedName || 'Item';
    const isAIGenerated = selectedSuggestion === lastResponse?.aiGeneratedName;

    // Save naming choice if we have an item ID
    if (item.id && lastResponse) {
      await saveNamingChoice(
        item.id,
        isAIGenerated ? 'ai' : 'user',
        isAIGenerated ? undefined : finalName,
      );
    }

    onNameSelected(finalName, isAIGenerated);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) {
      return DesignSystem.colors.success[100];
    }
    if (confidence >= 0.6) {
      return DesignSystem.colors.warning[100];
    }
    return DesignSystem.colors.error[100];
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) {
      return 'High confidence';
    }
    if (confidence >= 0.6) {
      return 'Medium confidence';
    }
    return 'Low confidence';
  };
  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 0.8) {
      return DesignSystem.colors.success[700];
    }
    if (confidence >= 0.6) {
      return DesignSystem.colors.warning[700];
    }
    return DesignSystem.colors.error[700];
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles" size={24} color={DesignSystem.colors.text.accent} />
              <Text style={styles.title}>AI Name Generator</Text>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowPreferencesDialog(true)}
                accessibilityRole="button"
                accessibilityLabel="Open naming preferences"
                accessibilityHint="Tap to open naming preferences settings"
              >
                <Ionicons name="settings" size={20} color={DesignSystem.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Generate intelligent names for your wardrobe items</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={DesignSystem.colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={clearError}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close error message"
                accessibilityHint="Tap to dismiss the error message"
              >
                <Ionicons name="close" size={16} color={DesignSystem.colors.error[600]} />
              </TouchableOpacity>
            </View>
          )}

          {/* Item Preview */}
          {item.imageUri && (
            <View style={styles.itemPreview}>
              <View style={styles.itemPreviewRow}>
                <View style={styles.imageContainer}>
                  {/* Note: React Native doesn't support web img tag, would need Image component */}
                  <View style={styles.imagePlaceholder} />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetailsText}>
                    {item.category && `Category: ${item.category}`}
                    {item.colors &&
                      item.colors.length > 0 &&
                      ` • Colors: ${item.colors.join(', ')}`}
                    {item.brand && ` • Brand: ${item.brand}`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Generate Button */}
          {!lastResponse && (
            <View style={styles.generateButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (!item.imageUri || isGenerating) && styles.disabledButton,
                ]}
                onPress={handleGenerateName}
                disabled={!item.imageUri || isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="sparkles" size={20} color="white" />
                )}
                <Text style={styles.generateButtonText}>
                  {isGenerating ? 'Generating Name...' : 'Generate AI Name'}
                </Text>
              </TouchableOpacity>
              {!item.imageUri && (
                <Text style={styles.warningText}>Image required for AI name generation</Text>
              )}
            </View>
          )}

          {/* AI Response */}
          {lastResponse && (
            <View style={styles.responseContainer}>
              <View style={styles.responseHeader}>
                <Text style={styles.responseTitle}>AI Generated Name</Text>
                <View
                  style={[
                    styles.confidenceChip,
                    { backgroundColor: getConfidenceColor(lastResponse.confidence) },
                  ]}
                >
                  <Text
                    style={[
                      styles.confidenceText,
                      { color: getConfidenceTextColor(lastResponse.confidence) },
                    ]}
                  >
                    {getConfidenceText(lastResponse.confidence)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleGenerateName}
                  disabled={isGenerating}
                  accessibilityRole="button"
                  accessibilityLabel={isGenerating ? 'Generating name...' : 'Regenerate AI name'}
                  accessibilityHint="Tap to generate a new AI-powered name suggestion"
                  accessibilityState={{ disabled: isGenerating }}
                >
                  {isGenerating ? (
                    <ActivityIndicator size={16} color={DesignSystem.colors.text.secondary} />
                  ) : (
                    <Ionicons name="refresh" size={16} color={DesignSystem.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.generatedNameContainer}>
                <Text style={styles.generatedNameText}>{lastResponse.aiGeneratedName}</Text>
              </View>

              {/* Suggestions */}
              {lastResponse.suggestions && lastResponse.suggestions.length > 1 && (
                <View style={styles.suggestionsContainer}>
                  <View style={styles.suggestionsHeader}>
                    <Ionicons name="bulb" size={16} color={DesignSystem.colors.text.secondary} />
                    <Text style={styles.suggestionsTitle}>Alternative Suggestions</Text>
                  </View>
                  <View style={styles.suggestionsGrid}>
                    {lastResponse.suggestions
                      .filter((s) => s !== lastResponse.aiGeneratedName)
                      .map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.suggestionChip,
                            selectedSuggestion === suggestion && styles.selectedSuggestionChip,
                          ]}
                          onPress={() => handleSuggestionClick(suggestion)}
                          accessibilityRole="button"
                          accessibilityLabel={`Select suggestion: ${suggestion}`}
                          accessibilityHint="Tap to use this name suggestion"
                          accessibilityState={{ selected: selectedSuggestion === suggestion }}
                        >
                          <Text
                            style={[
                              styles.suggestionText,
                              selectedSuggestion === suggestion && styles.selectedSuggestionText,
                            ]}
                          >
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />

          {/* Custom Name Input */}
          <View style={styles.customNameContainer}>
            <View style={styles.customNameHeader}>
              <Ionicons name="create" size={16} color={DesignSystem.colors.text.secondary} />
              <Text style={styles.customNameTitle}>Custom Name</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Enter a custom name or edit the AI suggestion"
              placeholderTextColor={DesignSystem.colors.text.secondary}
            />
            <Text style={styles.helperText}>
              You can use the AI suggestion or create your own name
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Tap to cancel and close the name generator"
              >
                <Ionicons name="close" size={16} color={DesignSystem.colors.text.secondary} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.acceptButton, !customName.trim() && styles.disabledButton]}
              onPress={handleAcceptName}
              disabled={!customName.trim()}
              accessibilityRole="button"
              accessibilityLabel="Use this name"
              accessibilityHint="Tap to confirm and use the selected name"
              accessibilityState={{ disabled: !customName.trim() }}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.acceptButtonText}>Use This Name</Text>
            </TouchableOpacity>
          </View>

          {/* Analysis Details */}
          {lastResponse?.analysisData && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Analysis Details</Text>
              <View style={styles.analysisGrid}>
                {lastResponse.analysisData.detectedTags.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisLabel}>Detected Tags:</Text>
                    <View style={styles.tagsContainer}>
                      {lastResponse.analysisData.detectedTags.slice(0, 5).map((tag, index) => (
                        <View key={index} style={styles.tagChip}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {lastResponse.analysisData.dominantColors.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisLabel}>Detected Colors:</Text>
                    <View style={styles.tagsContainer}>
                      {lastResponse.analysisData.dominantColors.slice(0, 3).map((color, index) => (
                        <View key={index} style={styles.tagChip}>
                          <Text style={styles.tagText}>{color}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Preferences Modal */}
      <Modal
        visible={showPreferencesDialog}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreferencesDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Naming Preferences</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreferencesDialog(false)}
              accessibilityRole="button"
              accessibilityLabel="Close preferences"
              accessibilityHint="Tap to close the naming preferences dialog"
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <NamingPreferences
              onPreferencesChange={() => {
                // Optionally regenerate name with new preferences
                if (lastResponse) {
                  handleGenerateName();
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    alignItems: 'center',
    backgroundColor: '#4caf50',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionsContainer: {
    marginTop: 16,
  },
  aiNameText: {
    color: '#1976d2',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  analysisContainer: {
    borderTopColor: '#eee',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  analysisGrid: {
    gap: 16,
  },
  analysisLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  analysisSection: {
    flex: 1,
  },
  analysisTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 0,
  },
  closeButton: {
    padding: 8,
  },
  compactButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 8,
  },
  confidenceChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customInput: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  customInputContainer: {
    marginBottom: 12,
  },
  customNameContainer: {
    marginTop: 8,
  },
  customNameHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  customNameTitle: {
    color: '#333',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  divider: {
    backgroundColor: '#eee',
    height: 1,
    marginVertical: 16,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
  },
  errorText: {
    color: '#c62828',
    flex: 1,
    marginLeft: 8,
  },
  explanationText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  generateButton: {
    alignItems: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 12,
  },
  generateButtonContainer: {
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  generatedNameContainer: {
    marginBottom: 8,
    marginTop: 8,
  },
  generatedNameText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    height: 80,
    width: 80,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
  },
  itemDetails: {
    flex: 1,
  },
  itemDetailsText: {
    color: '#333',
  },
  itemImage: {
    borderRadius: 8,
    height: 200,
    width: 200,
  },
  itemPreview: {
    marginBottom: 16,
  },
  itemPreviewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  modalContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 200,
    justifyContent: 'center',
    width: 200,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  refreshButton: {
    borderRadius: 6,
    padding: 8,
  },
  regenerateButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
  },
  regenerateButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  responseContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  responseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedSuggestionChip: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  selectedSuggestionText: {
    color: '#fff',
  },
  settingsButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  suggestionChip: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionsTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#666',
    fontSize: 11,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  textInput: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    color: '#333',
    padding: 10,
  },
  title: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  warningText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
});

// Compact version for inline use
export const CompactAINameGenerator: React.FC<{
  item: Partial<WardrobeItem>;
  onNameGenerated: (name: string) => void;
}> = ({ item, onNameGenerated }) => {
  const { generateNameForItem, isGenerating } = useAINaming();

  const handleQuickGenerate = async () => {
    const response = await generateNameForItem(item);
    if (response) {
      onNameGenerated(response.aiGeneratedName);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.compactButton, (isGenerating || !item.imageUri) && styles.disabledButton]}
      onPress={handleQuickGenerate}
      disabled={isGenerating || !item.imageUri}
      accessibilityRole="button"
      accessibilityLabel={isGenerating ? 'Generating AI name...' : 'Generate AI name'}
      accessibilityHint="Tap to generate an AI-powered name for this wardrobe item"
      accessibilityState={{ disabled: isGenerating || !item.imageUri }}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color="#666" />
      ) : (
        <Ionicons name="sparkles" size={16} color="#666" />
      )}
    </TouchableOpacity>
  );
};

export default AINameGenerator;
