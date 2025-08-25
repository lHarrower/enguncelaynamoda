import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DesignSystem } from '../../theme/DesignSystem';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface ProfileOption {
  id: string;
  label: string;
  icon: IoniconsName;
}

export const ProfileScreen: React.FC = () => {
  const profileOptions: ProfileOption[] = [
    { id: 'preferences', label: 'Style Preferences', icon: 'heart-outline' },
    { id: 'saved', label: 'Saved Items', icon: 'bookmark-outline' },
    { id: 'orders', label: 'Order History', icon: 'bag-outline' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.name}>Anna</Text>
          <Text style={styles.subtitle}>Fashion Enthusiast</Text>
        </View>

        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityHint={`Navigate to ${option.label} section`}
            >
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={20} color={DesignSystem.colors.lilac[600]} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={DesignSystem.colors.text.tertiary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.lilac[100],
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  avatarText: {
    color: DesignSystem.colors.lilac[600],
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontSize: DesignSystem.typography.scale.h2.fontSize,
  },
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 20,
  },
  name: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.serif,
    fontSize: DesignSystem.typography.scale.h1.fontSize,
    marginBottom: 4,
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.lilac[50],
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  optionItem: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...DesignSystem.elevation.soft,
  },
  optionLabel: {
    color: DesignSystem.colors.text.primary,
    fontFamily: DesignSystem.typography.fontFamily.sans,
    fontSize: DesignSystem.typography.scale.body1.fontSize,
  },
  optionLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionsContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    color: DesignSystem.colors.text.secondary,
    fontFamily: DesignSystem.typography.fontFamily.sans,
    fontSize: DesignSystem.typography.scale.body1.fontSize,
  },
});
