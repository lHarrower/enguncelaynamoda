// AI Name Generator Component
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { useAINaming } from '@/hooks/useAINaming';
import { WardrobeItem, NamingResponse } from '@/types/aynaMirror';
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
  showPreferences = false
}) => {
  const {
    isGenerating,
    error,
    lastResponse,
    generateNameForItem,
    clearError,
    getEffectiveName,
    saveNamingChoice
  } = useAINaming();

  const [customName, setCustomName] = useState(initialName);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate name on mount if item has image
  useEffect(() => {
    if (item.imageUri && !hasGenerated && !initialName) {
      handleGenerateName();
    }
  }, [item.imageUri]);

  // Update custom name when AI name is generated
  useEffect(() => {
    if (lastResponse && !customName) {
      setCustomName(lastResponse.aiGeneratedName);
      setSelectedSuggestion(lastResponse.aiGeneratedName);
    }
  }, [lastResponse, customName]);

  const handleGenerateName = async () => {
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
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomName(suggestion);
  };

  const handleAcceptName = async () => {
    const finalName = customName.trim() || (lastResponse?.aiGeneratedName) || 'Item';
    const isAIGenerated = selectedSuggestion === lastResponse?.aiGeneratedName;
    
    // Save naming choice if we have an item ID
    if (item.id && lastResponse) {
      await saveNamingChoice(
        item.id,
        isAIGenerated ? 'ai' : 'user',
        isAIGenerated ? undefined : finalName
      );
    }
    
    onNameSelected(finalName, isAIGenerated);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return DesignSystem.colors.success[100];
    if (confidence >= 0.6) return DesignSystem.colors.warning[100];
    return DesignSystem.colors.error[100];
  };


  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };
  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 0.8) return DesignSystem.colors.success[700];
    if (confidence >= 0.6) return DesignSystem.colors.warning[700];
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
              >
                <Ionicons name="settings" size={20} color={DesignSystem.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Generate intelligent names for your wardrobe items
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={DesignSystem.colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.closeButton}>
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
                    {item.colors && item.colors.length > 0 && ` • Colors: ${item.colors.join(', ')}`}
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
                style={[styles.generateButton, (!item.imageUri || isGenerating) && styles.disabledButton]}
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
                <Text style={styles.warningText}>
                  Image required for AI name generation
                </Text>
              )}
            </View>
          )}

          {/* AI Response */}
          {lastResponse && (
            <View style={styles.responseContainer}>
              <View style={styles.responseHeader}>
                <Text style={styles.responseTitle}>AI Generated Name</Text>
                <View style={[styles.confidenceChip, { backgroundColor: getConfidenceColor(lastResponse.confidence) }]}>
                  <Text style={[styles.confidenceText, { color: getConfidenceTextColor(lastResponse.confidence) }]}>{getConfidenceText(lastResponse.confidence)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleGenerateName}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator size={16} color={DesignSystem.colors.text.secondary} />
                  ) : (
                    <Ionicons name="refresh" size={16} color={DesignSystem.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.generatedNameContainer}>
                <Text style={styles.generatedNameText}>
                  {lastResponse.aiGeneratedName}
                </Text>
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
                      .filter(s => s !== lastResponse.aiGeneratedName)
                      .map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.suggestionChip,
                            selectedSuggestion === suggestion && styles.selectedSuggestionChip
                          ]}
                          onPress={() => handleSuggestionClick(suggestion)}
                        >
                          <Text style={[
                            styles.suggestionText,
                            selectedSuggestion === suggestion && styles.selectedSuggestionText
                          ]}>
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
              >
                <Ionicons name="close" size={16} color={DesignSystem.colors.text.secondary} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.acceptButton, !customName.trim() && styles.disabledButton]}
              onPress={handleAcceptName}
              disabled={!customName.trim()}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.acceptButtonText}>Use This Name</Text>
            </TouchableOpacity>
          </View>

          {/* Analysis Details */}
          {lastResponse?.analysisData && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>
                Analysis Details
              </Text>
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
            <Text style={styles.modalTitle}>
              Naming Preferences
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPreferencesDialog(false)}
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
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 0,
  },
  headerContainer: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#c62828',
    marginLeft: 8,
    flex: 1,
  },
  itemPreview: {
    marginBottom: 16,
  },
  itemPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemDetails: {
    flex: 1,
  },
  itemDetailsText: {
    color: '#333',
  },
  generateButtonContainer: {
    alignItems: 'center',
  },
  warningText: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  confidenceChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
  },
  generatedNameContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  generatedNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSuggestionChip: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  selectedSuggestionText: {
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  customNameContainer: {
    marginTop: 8,
  },
  customNameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  customNameTitle: {
    color: '#333',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  cancelButtonText: {
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  placeholderContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  responseContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  aiNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  suggestionText: {
    color: '#2e7d32',
    fontSize: 12,
  },
  actionsContainer: {
    marginTop: 16,
  },
  customInputContainer: {
    marginBottom: 12,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  regenerateButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  regenerateButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  analysisContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  analysisGrid: {
    gap: 16,
  },
  analysisSection: {
    flex: 1,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  compactButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
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