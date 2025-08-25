// AYNA Mirror Settings Screen - User Preferences Management
import { Ionicons } from '@expo/vector-icons';
import React, { ComponentType, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// DateTimePicker props interface
interface DateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'compact';
  is24Hour?: boolean;
  onChange: (
    event: { type: string; nativeEvent: { timestamp: number } },
    selectedDate?: Date,
  ) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

// DateTimePicker will be loaded dynamically
let DateTimePicker: any = null;

// Function to load DateTimePicker dynamically
const loadDateTimePicker = async (): Promise<any> => {
  if (DateTimePicker) {
    return DateTimePicker;
  }

  try {
    const module = await import('@react-native-community/datetimepicker');
    DateTimePicker = module.default;
    return DateTimePicker;
  } catch (error) {
    // Silently handle DateTimePicker not being available in Expo Go
    return null;
  }
};
import { useAuth } from '../context/AuthContext';
import { userPreferencesService } from '../services/userPreferencesService';
import { DesignSystem } from '../theme/DesignSystem';
import { ConfidenceNoteStyle, PrivacySettings } from '../types/aynaMirror';
import { errorInDev } from '../utils/consoleSuppress';

interface NavigationProp {
  goBack: () => void;
  navigate: (route: string) => void;
}

interface SettingsScreenProps {
  navigation: NavigationProp;
}

export default function AynaMirrorSettingsScreen({ navigation }: SettingsScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preference states
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [timezone, setTimezone] = useState('UTC');
  const [confidenceNoteStyle, setConfidenceNoteStyle] =
    useState<ConfidenceNoteStyle>('encouraging');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareUsageData: false,
    allowLocationTracking: true,
    enableSocialFeatures: true,
    dataRetentionDays: 365,
  });

  // UI states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateTimePickerComponent, setDateTimePickerComponent] = useState<any>(null);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      const preferences = await userPreferencesService.getUserPreferences(user.id);

      setNotificationTime(preferences.notificationTime);
      setTimezone(preferences.timezone);
      setConfidenceNoteStyle(preferences.stylePreferences.confidenceNoteStyle || 'encouraging');
      setPrivacySettings(preferences.privacySettings);
    } catch (error) {
      errorInDev('Failed to load preferences:', error instanceof Error ? error : String(error));
      Alert.alert('Error', 'Failed to load your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setSaving(true);

      // Update notification preferences
      await userPreferencesService.updateNotificationPreferences(user.id, {
        preferredTime: notificationTime,
        timezone,
        confidenceNoteStyle,
        enableWeekends: true,
        enableQuickOptions: true,
      });

      // Update privacy settings
      await userPreferencesService.updatePrivacySettings(user.id, privacySettings);

      Alert.alert('Success', 'Your preferences have been saved!');
    } catch (error) {
      errorInDev('Failed to save preferences:', error instanceof Error ? error : String(error));
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const detectTimezone = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setSaving(true);
      const detectedTimezone = await userPreferencesService.detectAndUpdateTimezone(user.id);
      setTimezone(detectedTimezone);
      Alert.alert('Timezone Updated', `Your timezone has been set to ${detectedTimezone}`);
    } catch (error) {
      errorInDev('Failed to detect timezone:', error instanceof Error ? error : String(error));
      Alert.alert('Error', 'Failed to detect your timezone. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onTimeChange = (
    event: { type: string; nativeEvent?: { timestamp: number } },
    selectedTime?: Date,
  ) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNotificationTime(selectedTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const confidenceNoteOptions: {
    value: ConfidenceNoteStyle;
    label: string;
    description: string;
  }[] = [
    {
      value: 'encouraging',
      label: 'Encouraging',
      description: 'Supportive and uplifting messages',
    },
    {
      value: 'witty',
      label: 'Witty',
      description: 'Clever and playful confidence notes',
    },
    {
      value: 'poetic',
      label: 'Poetic',
      description: 'Beautiful and artistic expressions',
    },
    {
      value: 'friendly',
      label: 'Friendly',
      description: 'Warm and casual like a best friend',
    },
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
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate back to the previous screen"
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
            <Text style={styles.settingDescription}>
              When to receive your daily outfit recommendations
            </Text>
          </View>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={async () => {
              const component = await loadDateTimePicker();
              if (component) {
                setDateTimePickerComponent(component);
                setShowTimePicker(true);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`Notification time ${formatTime(notificationTime)}`}
            accessibilityHint="Tap to change the daily notification time"
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
            accessibilityRole="button"
            accessibilityLabel="Auto-detect timezone"
            accessibilityHint="Automatically detect and set your current timezone"
            accessibilityState={{ disabled: saving }}
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
              confidenceNoteStyle === option.value && styles.optionItemSelected,
            ]}
            onPress={() => setConfidenceNoteStyle(option.value)}
            accessibilityRole="button"
            accessibilityLabel={`${option.label} confidence note style`}
            accessibilityHint={`Select ${option.label.toLowerCase()} style: ${option.description}`}
            accessibilityState={{ selected: confidenceNoteStyle === option.value }}
          >
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  confidenceNoteStyle === option.value && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  confidenceNoteStyle === option.value && styles.optionDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
            </View>
            {confidenceNoteStyle === option.value && (
              <Ionicons name="checkmark-circle" size={24} color={DesignSystem.colors.sage[500]} />
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
              setPrivacySettings((prev) => ({ ...prev, shareUsageData: value }))
            }
            trackColor={{
              false: DesignSystem.colors.sage[200],
              true: DesignSystem.colors.sage[500],
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
              setPrivacySettings((prev) => ({ ...prev, allowLocationTracking: value }))
            }
            trackColor={{
              false: DesignSystem.colors.neutral[300],
              true: DesignSystem.colors.sage[500],
            }}
            thumbColor={DesignSystem.colors.background.elevated}
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
              setPrivacySettings((prev) => ({ ...prev, enableSocialFeatures: value }))
            }
            trackColor={{
              false: DesignSystem.colors.neutral[200],
              true: DesignSystem.colors.sage[500],
            }}
            thumbColor={DesignSystem.colors.text.inverse}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={savePreferences}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel={saving ? 'Saving preferences' : 'Save preferences'}
        accessibilityHint="Save all your preference changes"
        accessibilityState={{ disabled: saving }}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Preferences'}</Text>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      {showTimePicker &&
        dateTimePickerComponent &&
        React.createElement(dateTimePickerComponent, {
          value: notificationTime,
          mode: 'time',
          is24Hour: false,
          display: 'default',
          onChange: onTimeChange,
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  detectButton: {
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detectButtonText: {
    color: DesignSystem.colors.background.elevated,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.elevated,
    borderBottomColor: DesignSystem.colors.sage[200],
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 20,
    fontWeight: '600',
  },
  loadingText: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionDescription: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 14,
  },
  optionDescriptionSelected: {
    color: DesignSystem.colors.text.primary,
  },
  optionItem: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[200],
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionItemSelected: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderColor: DesignSystem.colors.sage[500],
  },
  optionLabel: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: DesignSystem.colors.sage[500],
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[500],
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    ...DesignSystem.elevation.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: DesignSystem.colors.background.elevated,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: DesignSystem.colors.background.elevated,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    ...DesignSystem.elevation.medium,
  },
  sectionDescription: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingDescription: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.sage[100],
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.sage[200],
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeText: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
    marginRight: 8,
  },
});
