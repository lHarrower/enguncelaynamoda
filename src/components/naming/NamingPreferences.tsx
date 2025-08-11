// AI Naming Preferences Component
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import { logInDev } from '@/utils/consoleSuppress';
import { useNamingPreferences } from '@/hooks/useAINaming';
import { NamingStyle } from '@/types/aynaMirror';

interface NamingPreferencesProps {
  onPreferencesChange?: () => void;
}

const NAMING_STYLE_OPTIONS = [
  {
    value: 'descriptive' as NamingStyle,
    label: 'Descriptive',
    description: 'Detailed names with color, brand, and style',
    example: 'Blue Nike Running Shoes'
  },
  {
    value: 'creative' as NamingStyle,
    label: 'Creative',
    description: 'Fun and personalized naming style',
    example: 'My Favorite Blue Sneakers'
  },
  {
    value: 'minimal' as NamingStyle,
    label: 'Minimal',
    description: 'Simple and clean names',
    example: 'Blue Shoes'
  },
  {
    value: 'brand_focused' as NamingStyle,
    label: 'Brand Focused',
    description: 'Emphasizes brand names',
    example: 'Nike Blue Shoes'
  }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' }
];

export const NamingPreferences: React.FC<NamingPreferencesProps> = ({
  onPreferencesChange
}) => {
  const {
    preferences,
    isLoading,
    error,
    loadPreferences,
    updatePreferences
  } = useNamingPreferences();

  const [localPreferences, setLocalPreferences] = useState({
    namingStyle: 'descriptive' as NamingStyle,
    includeBrand: true,
    includeColor: true,
    includeMaterial: false,
    includeStyle: true,
    preferredLanguage: 'en',
    autoAcceptAINames: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        namingStyle: preferences.namingStyle || 'descriptive',
        includeBrand: preferences.includeBrand ?? true,
        includeColor: preferences.includeColor ?? true,
        includeMaterial: preferences.includeMaterial ?? false,
        includeStyle: preferences.includeStyle ?? true,
        preferredLanguage: preferences.preferredLanguage || 'en',
        autoAcceptAINames: preferences.autoAcceptAINames ?? false
      });
    }
  }, [preferences]);

  const handleStyleChange = (value: NamingStyle) => {
    setLocalPreferences(prev => ({
      ...prev,
      namingStyle: value
    }));
  };

  const handleToggleChange = (field: keyof typeof localPreferences, value: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageChange = (value: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredLanguage: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updatePreferences(localPreferences);
      setSaveSuccess(true);
      onPreferencesChange?.();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      logInDev('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences({
        namingStyle: preferences.namingStyle || 'descriptive',
        includeBrand: preferences.includeBrand ?? true,
        includeColor: preferences.includeColor ?? true,
        includeMaterial: preferences.includeMaterial ?? false,
        includeStyle: preferences.includeStyle ?? true,
        preferredLanguage: preferences.preferredLanguage || 'en',
        autoAcceptAINames: preferences.autoAcceptAINames ?? false
      });
    }
  };

  const getPreviewName = () => {
    const { namingStyle, includeBrand, includeColor, includeStyle } = localPreferences;
    
    switch (namingStyle) {
      case 'descriptive':
        if (includeBrand && includeColor) return 'Blue Nike T-Shirt';
        if (includeColor && includeStyle) return 'Casual Blue T-Shirt';
        if (includeColor) return 'Blue T-Shirt';
        return 'T-Shirt';
        
      case 'creative':
        if (includeBrand && includeColor) return 'My Blue Nike Favorite';
        if (includeColor) return 'My Blue Essential';
        return 'Favorite T-Shirt';
        
      case 'minimal':
        if (includeColor) return 'Blue T-Shirt';
        return 'T-Shirt';
        
      case 'brand_focused':
        if (includeBrand && includeColor) return 'Nike Blue T-Shirt';
        if (includeBrand) return 'Nike T-Shirt';
        if (includeColor) return 'Blue T-Shirt';
        return 'T-Shirt';
        
      default:
        return 'Blue T-Shirt';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <Ionicons name="sparkles" size={20} color="#1976d2" />
            <Text style={styles.title}>AI Naming Preferences</Text>
          </View>
          <Text style={styles.subtitle}>
            Customize how AI generates names for your wardrobe items
          </Text>
        </View>

        {error && (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {saveSuccess && (
          <View style={styles.successAlert}>
            <Text style={styles.successText}>Preferences saved successfully!</Text>
          </View>
        )}

        <ScrollView style={styles.scrollContainer}>
          {/* Naming Style */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="brush" size={16} color="#666" />
                <Text style={styles.sectionTitle}>Naming Style</Text>
              </View>
            </View>
            
            <View style={styles.radioGroup}>
              {NAMING_STYLE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => handleStyleChange(option.value)}
                >
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioButton,
                      localPreferences.namingStyle === option.value && styles.radioButtonSelected
                    ]}>
                      {localPreferences.namingStyle === option.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.radioLabel}>
                      <Text style={styles.radioLabelText}>{option.label}</Text>
                      <Text style={styles.radioDescription}>{option.description}</Text>
                      <View style={styles.exampleChip}>
                        <Text style={styles.exampleText}>{option.example}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Include Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="color-palette" size={16} color="#666" />
                <Text style={styles.sectionTitle}>Include in Names</Text>
              </View>
            </View>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Color</Text>
                <Switch
                  value={localPreferences.includeColor}
                  onValueChange={(value) => handleToggleChange('includeColor', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Brand</Text>
                <Switch
                  value={localPreferences.includeBrand}
                  onValueChange={(value) => handleToggleChange('includeBrand', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Style</Text>
                <Switch
                  value={localPreferences.includeStyle}
                  onValueChange={(value) => handleToggleChange('includeStyle', value)}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Material</Text>
                <Switch
                  value={localPreferences.includeMaterial}
                  onValueChange={(value) => handleToggleChange('includeMaterial', value)}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Language */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="business" size={16} color="#666" />
                <Text style={styles.sectionTitle}>Language</Text>
              </View>
            </View>
            <View style={styles.languageContainer}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={styles.languageOption}
                  onPress={() => handleLanguageChange(lang.value)}
                >
                  <View style={[
                    styles.radioButton,
                    localPreferences.preferredLanguage === lang.value && styles.radioButtonSelected
                  ]}>
                    {localPreferences.preferredLanguage === lang.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.languageLabel}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Auto Accept */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Auto Accept AI Names</Text>
              <Switch
                value={localPreferences.autoAcceptAINames}
                onValueChange={(value) => handleToggleChange('autoAcceptAINames', value)}
              />
            </View>
            <View style={styles.autoAcceptDescription}>
              <Text style={styles.autoAcceptText}>Auto-accept AI names</Text>
              <Text style={styles.autoAcceptSubtext}>
                Automatically use AI-generated names without manual approval
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview</Text>
          <Text style={styles.previewDescription}>
            With your current settings, a blue Nike t-shirt would be named:
          </Text>
          <View style={styles.previewChip}>
            <Text style={styles.previewText}>{getPreviewName()}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={isSaving}
          >
            <Ionicons name="refresh" size={16} color="#1976d2" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons name="save" size={16} color="white" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 16,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  headerSection: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorAlert: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  successAlert: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#1976d2',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976d2',
  },
  radioLabel: {
    flex: 1,
  },
  radioLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  exampleChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  exampleText: {
    fontSize: 11,
    color: '#666',
  },
  switchContainer: {
    gap: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  autoAcceptDescription: {
    marginLeft: 32,
  },
  autoAcceptText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  autoAcceptSubtext: {
    fontSize: 12,
    color: '#666',
  },
  previewContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  previewChip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1976d2',
    alignSelf: 'flex-start',
  },
  previewText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  resetButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  resetButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default NamingPreferences;