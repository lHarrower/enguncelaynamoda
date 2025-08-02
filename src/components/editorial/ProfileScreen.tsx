import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '../../theme/DesignSystem';

export const ProfileScreen: React.FC = () => {
  const profileOptions = [
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
            <TouchableOpacity key={option.id} style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={DesignSystem.colors.lilac[600]}
                  />
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
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DesignSystem.colors.lilac[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: DesignSystem.typography.scale.h2.fontSize,
    fontFamily: DesignSystem.typography.serif.family,
    color: DesignSystem.colors.lilac[600],
  },
  name: {
    fontSize: DesignSystem.typography.scale.h1.fontSize,
    fontFamily: DesignSystem.typography.serif.family,
    color: DesignSystem.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: DesignSystem.typography.scale.body1.fontSize,
    fontFamily: DesignSystem.typography.sans.family,
    color: DesignSystem.colors.text.secondary,
  },
  optionsContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.radius.lg,
    marginBottom: 12,
    ...DesignSystem.elevation.small,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.lilac[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    fontSize: DesignSystem.typography.scale.body1.fontSize,
    fontFamily: DesignSystem.typography.sans.family,
    color: DesignSystem.colors.text.primary,
  },
});