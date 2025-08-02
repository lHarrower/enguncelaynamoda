// AYNA Mirror Settings Screen - User Preferences Management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import DateTimePicker with error handling
let DateTimePicker: any;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (error) {
  // Silently handle DateTimePicker not being available in Expo Go
  DateTimePicker = null;
}
import { DesignSystem } from '../theme/DesignSystem';
import { userPreferencesService } from '../services/userPreferencesService';
import { 
  UserPreferences, 
  NotificationPreferences, 
  PrivacySettings,
  ConfidenceNoteStyle 
} from '../types/aynaMirror';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  navigation: any;
}

export default function AynaMirrorSettingsScreen({ navigation }: SettingsScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Preference states
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [timezone, setTimezone] = useState('UTC');
  const [confidenceNoteStyle, setConfidenceNoteStyle] = useState<ConfidenceNoteStyle>('encouraging');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareUsageData: false,
    allowLocationTracking: true,
    enableSocialFeatures: true,
    dataRetentionDays: 365
  });
  
  // UI states
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const preferences = await userPreferencesService.getUserPreferences(user.id);
      
      setNotificationTime(preferences.notificationTime);
      setTimezone(preferences.timezone);
      setConfidenceNoteStyle(preferences.stylePreferences.confidenceNoteStyle || 'encouraging');
      setPrivacySettings(preferences.privacySettings);
      
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      // Update notification preferences
      await userPreferencesService.updateNotificationPreferences(user.id, {
        preferredTime: notificationTime,
        timezone,
        confidenceNoteStyle,
        enableWeekends: true,
        enableQuickOptions: true
      });
      
      // Update privacy settings
      await userPreferencesService.updatePrivacySettings(user.id, privacySettings);
      
      Alert.alert('Success', 'Your preferences have been saved!');
      
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const detectTimezone = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      const detectedTimezone = await userPreferencesService.detectAndUpdateTimezone(user.id);
      setTimezone(detectedTimezone);
      Alert.alert('Timezone Updated', `Your timezone has been set to ${detectedTimezone}`);
    } catch (error) {
      console.error('Failed to detect timezone:', error);
      Alert.alert('Error', 'Failed to detect your timezone. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNotificationTime(selectedTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const confidenceNoteOptions: { value: ConfidenceNoteStyle; label: string; description: string }[] = [
    { 
      value: 'encouraging', 
      label: 'Encouraging', 
      description: 'Supportive and uplifting messages' 
    },
    { 
      value: 'witty', 
      label: 'Witty', 
      description: 'Clever and playful confidence notes' 
    },
    { 
      value: 'poetic', 
      label: 'Poetic', 
      description: 'Beautiful and artistic expressions' 
    },
    { 
      value: 'friendly', 
      label: 'Friendly', 
      description: 'Warm and casual like a best friend' 
    }
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading your preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={DesignSystem.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AYNA Mirror Settings</Text>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Ritual</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notification Time</Text>
            <Text style={styles.settingDescription}>When to receive your daily outfit recommendations</Text>
          </View>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(notificationTime)}</Text>
            <Ionicons name="time-outline" size={20} color={DesignSystem.colors.sage[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Timezone</Text>
            <Text style={styles.settingDescription}>{timezone}</Text>
          </View>
          <TouchableOpacity 
            style={styles.detectButton}
            onPress={detectTimezone}
            disabled={saving}
          >
            <Text style={styles.detectButtonText}>Auto-Detect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confidence Note Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidence Note Style</Text>
        <Text style={styles.sectionDescription}>
          Choose how your daily confidence notes should feel
        </Text>
        
        {confidenceNoteOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              confidenceNoteStyle === option.value && styles.optionItemSelected
            ]}
            onPress={() => setConfidenceNoteStyle(option.value)}
          >
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionLabel,
                confidenceNoteStyle === option.value && styles.optionLabelSelected
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.optionDescription,
                confidenceNoteStyle === option.value && styles.optionDescriptionSelected
              ]}>
                {option.description}
              </Text>
            </View>
            {confidenceNoteStyle === option.value && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={DesignSystem.colors.sage[500]} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Share Usage Data</Text>
            <Text style={styles.settingDescription}>
              Help improve AYNA Mirror by sharing anonymous usage patterns
            </Text>
          </View>
          <Switch
            value={privacySettings.shareUsageData}
            onValueChange={(value) => 
              setPrivacySettings(prev => ({ ...prev, shareUsageData: value }))
            }
            trackColor={{ 
              false: DesignSystem.colors.sage[200],
                true: DesignSystem.colors.sage[500] 
            }}
            thumbColor={DesignSystem.colors.background.elevated}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location for Weather</Text>
            <Text style={styles.settingDescription}>
              Use your location to provide weather-appropriate outfit recommendations
            </Text>
          </View>
          <Switch
            value={privacySettings.allowLocationTracking}
            onValueChange={(value) => 
              setPrivacySettings(prev => ({ ...prev, allowLocationTracking: value }))
            }
            trackColor={{ 
              false: APP_THEME_V2.colors.cloudGray, 
              true: APP_THEME_V2.semantic.accent 
            }}
            thumbColor={APP_THEME_V2.colors.whisperWhite}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Social Features</Text>
            <Text style={styles.settingDescription}>
              Enable sharing outfits and receiving compliment tracking
            </Text>
          </View>
          <Switch
            value={privacySettings.enableSocialFeatures}
            onValueChange={(value) => 
              setPrivacySettings(prev => ({ ...prev, enableSocialFeatures: value }))
            }
            trackColor={{ 
              false: APP_THEME_V2.colors.cloudGray, 
              true: APP_THEME_V2.semantic.accent 
            }}
            thumbColor={APP_THEME_V2.colors.whisperWhite}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={savePreferences}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Text>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      {showTimePicker && DateTimePicker && (
        <DateTimePicker
          value={notificationTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: DesignSystem.colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.sage[200],
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  section: {
    backgroundColor: DesignSystem.colors.background.elevated,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    ...DesignSystem.elevation.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    marginBottom: 8,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  sectionDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 16,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.sage[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  settingDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[200],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
    marginRight: 8,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  detectButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detectButtonText: {
    fontSize: 14,
    color: DesignSystem.colors.background.elevated,
    fontWeight: '500',
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: DesignSystem.colors.sage[200],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[500],
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  optionLabelSelected: {
    color: DesignSystem.colors.sage[500],
  },
  optionDescription: {
    fontSize: 14,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
  optionDescriptionSelected: {
    color: DesignSystem.colors.text.primary,
  },
  saveButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...DesignSystem.elevation.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.background.elevated,
    fontFamily: DesignSystem.typography.body.fontFamily,
  },
});