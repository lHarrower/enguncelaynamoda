import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PastelBackground from '@/components/common/PastelBackground';
import LanguageSelector from '@/components/settings/LanguageSelector';
import { useI18n } from '@/context/I18nContext';
import { DesignSystem } from '@/theme/DesignSystem';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  type: 'toggle' | 'navigate';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
};

const SettingsRow = ({
  icon,
  label,
  description,
  type,
  value,
  onValueChange,
  onPress,
  isLast,
}: SettingsRowProps) => (
  <View>
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={type === 'toggle'}
      accessibilityRole={type === 'toggle' ? 'switch' : 'button'}
      accessibilityLabel={label}
      accessibilityHint={
        description || (type === 'navigate' ? `Navigate to ${label}` : `Toggle ${label}`)
      }
      accessibilityState={type === 'toggle' ? { checked: value } : undefined}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={DesignSystem.colors.text.primary} />
      </View>
      <View style={styles.menuItemTextContainer}>
        <Text style={styles.menuItemText}>{label}</Text>
        {description && <Text style={styles.menuItemDescription}>{description}</Text>}
      </View>
      {type === 'navigate' && (
        <Ionicons name="chevron-forward" size={22} color={DesignSystem.colors.neutral[300]} />
      )}
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E8DEF2', true: DesignSystem.colors.accent.gold }}
          thumbColor={value ? DesignSystem.colors.text.primary : '#f4f3f4'}
          accessibilityLabel={`${label} toggle`}
          accessibilityHint={`Double tap to ${value ? 'disable' : 'enable'} ${label}`}
        />
      )}
    </TouchableOpacity>
    {!isLast && <View style={styles.separator} />}
  </View>
);

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [notifications, setNotifications] = useState({
    newArrivals: true,
    specialOffers: true,
    styleUpdates: false,
  });
  const [darkMode, setDarkMode] = useState(false);

  return (
    <PastelBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <Ionicons name="arrow-back" size={24} color={DesignSystem.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>{t('navigation.settings')}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <SettingsSection title={t('profile.myProfile')}>
            <SettingsRow
              icon="person-outline"
              label={t('profile.editProfile')}
              type="navigate"
              onPress={() => {}}
            />
            <SettingsRow
              icon="lock-closed-outline"
              label="Change Password"
              type="navigate"
              onPress={() => {}}
              isLast
            />
          </SettingsSection>

          <SettingsSection title={t('profile.notifications')}>
            <SettingsRow
              icon="flower-outline"
              label="New Arrivals"
              type="toggle"
              value={notifications.newArrivals}
              onValueChange={(v) => setNotifications((p) => ({ ...p, newArrivals: v }))}
            />
            <SettingsRow
              icon="pricetag-outline"
              label="Special Offers"
              type="toggle"
              value={notifications.specialOffers}
              onValueChange={(v) => setNotifications((p) => ({ ...p, specialOffers: v }))}
            />
            <SettingsRow
              icon="sparkles-outline"
              label="Style Updates"
              description="Get AI-powered style tips"
              type="toggle"
              value={notifications.styleUpdates}
              onValueChange={(v) => setNotifications((p) => ({ ...p, styleUpdates: v }))}
              isLast
            />
          </SettingsSection>

          <SettingsSection title="Appearance">
            <SettingsRow
              icon="moon-outline"
              label={t('profile.theme')}
              type="toggle"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <View style={styles.languageSelectorContainer}>
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name="language-outline"
                  size={22}
                  color={DesignSystem.colors.text.primary}
                />
              </View>
              <View style={styles.languageSelectorWrapper}>
                <LanguageSelector />
              </View>
            </View>
          </SettingsSection>

          <SettingsSection title={t('profile.about')}>
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Service"
              type="navigate"
              onPress={() => {}}
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              type="navigate"
              onPress={() => {}}
            />
            <SettingsRow
              icon="help-circle-outline"
              label={t('profile.help')}
              type="navigate"
              onPress={() => {}}
              isLast
            />
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </PastelBackground>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    width: 40, // for alignment
  },
  card: {
    backgroundColor: DesignSystem.colors.surface.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    ...DesignSystem.elevation.md,
    borderColor: DesignSystem.colors.neutral[300],
    borderWidth: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  container: {
    paddingBottom: 40,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mainTitle: {
    ...DesignSystem.typography.heading.h2,
    color: DesignSystem.colors.text.primary,
  },
  menuIconContainer: {
    alignItems: 'center',
    backgroundColor: '#F7F2FA',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 16,
    width: 44,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemDescription: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    marginTop: 2,
  },
  menuItemText: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.body,
    fontSize: 12,
    marginBottom: 12,
    paddingLeft: 12,
    textTransform: 'uppercase',
  },
  separator: {
    backgroundColor: '#E8DEF2',
    height: 1,
    marginLeft: 76,
  },
  languageSelectorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  languageSelectorWrapper: {
    flex: 1,
  },
});
