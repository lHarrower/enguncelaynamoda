import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_THEME_V2 } from '@/constants/AppThemeV2';
import PastelBackground from '@/components/common/PastelBackground';

type SettingsRowProps = {
  icon: any;
  label: string;
  description?: string;
  type: 'toggle' | 'navigate';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
};

const SettingsRow = ({ icon, label, description, type, value, onValueChange, onPress, isLast }: SettingsRowProps) => (
  <View>
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={type === 'toggle'}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={APP_THEME_V2.semantic.text.primary} />
      </View>
      <View style={styles.menuItemTextContainer}>
        <Text style={styles.menuItemText}>{label}</Text>
        {description && <Text style={styles.menuItemDescription}>{description}</Text>}
      </View>
      {type === 'navigate' && <Ionicons name="chevron-forward" size={22} color={APP_THEME_V2.colors.moonlightSilver} />}
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E8DEF2', true: APP_THEME_V2.semantic.accent }}
          thumbColor={value ? APP_THEME_V2.semantic.text.primary : '#f4f3f4'}
        />
      )}
    </TouchableOpacity>
    {!isLast && <View style={styles.separator} />}
  </View>
);

const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.card}>
            {children}
        </View>
    </View>
);

export default function SettingsScreen() {
  const router = useRouter();
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={APP_THEME_V2.semantic.text.primary} />
            </TouchableOpacity>
            <Text style={styles.mainTitle}>Settings</Text>
            <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
            <SettingsSection title="Account">
                <SettingsRow icon="person-outline" label="Edit Profile" type="navigate" onPress={() => {}} />
                <SettingsRow icon="lock-closed-outline" label="Change Password" type="navigate" onPress={() => {}} isLast/>
            </SettingsSection>
            
            <SettingsSection title="Notifications">
                <SettingsRow 
                    icon="flower-outline" 
                    label="New Arrivals" 
                    type="toggle"
                    value={notifications.newArrivals}
                    onValueChange={v => setNotifications(p => ({...p, newArrivals: v}))}
                />
                <SettingsRow 
                    icon="pricetag-outline" 
                    label="Special Offers" 
                    type="toggle"
                    value={notifications.specialOffers}
                    onValueChange={v => setNotifications(p => ({...p, specialOffers: v}))}
                />
                <SettingsRow 
                    icon="sparkles-outline" 
                    label="Style Updates" 
                    description="Get AI-powered style tips"
                    type="toggle"
                    value={notifications.styleUpdates}
                    onValueChange={v => setNotifications(p => ({...p, styleUpdates: v}))}
                    isLast
                />
            </SettingsSection>
            
            <SettingsSection title="Appearance">
                <SettingsRow 
                    icon="moon-outline" 
                    label="Dark Mode" 
                    type="toggle"
                    value={darkMode}
                    onValueChange={setDarkMode}
                    isLast
                />
            </SettingsSection>

            <SettingsSection title="About">
                <SettingsRow icon="document-text-outline" label="Terms of Service" type="navigate" onPress={() => {}} />
                <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" type="navigate" onPress={() => {}} />
                <SettingsRow icon="help-circle-outline" label="Help & Support" type="navigate" onPress={() => {}} isLast/>
            </SettingsSection>

        </ScrollView>
      </SafeAreaView>
    </PastelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: APP_THEME_V2.spacing.xl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  backButton: {
    padding: 8,
    width: 40, // for alignment
  },
  mainTitle: {
    ...APP_THEME_V2.typography.scale.h2,
    color: APP_THEME_V2.semantic.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
    paddingLeft: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: APP_THEME_V2.typography.fonts.body,
  },
  card: {
    backgroundColor: APP_THEME_V2.semantic.surface,
    borderRadius: APP_THEME_V2.radius.organic,
    ...APP_THEME_V2.elevation.lift,
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: APP_THEME_V2.colors.moonlightSilver,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F2FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
      flex: 1,
  },
  menuItemText: {
    ...APP_THEME_V2.typography.scale.body1,
    color: APP_THEME_V2.semantic.text.primary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    fontSize: 16,
  },
  menuItemDescription: {
    ...APP_THEME_V2.typography.scale.caption,
    color: APP_THEME_V2.semantic.text.secondary,
    fontFamily: APP_THEME_V2.typography.fonts.body,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E8DEF2',
    marginLeft: 76,
  },
});