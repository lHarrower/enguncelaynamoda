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
import { EDITORIAL_THEME } from '../../constants/EditorialTheme';

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
                    color={EDITORIAL_THEME.colors.lilac[600]}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={EDITORIAL_THEME.colors.grey[400]}
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
    backgroundColor: EDITORIAL_THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: EDITORIAL_THEME.layout.containerPadding,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: EDITORIAL_THEME.colors.lilac[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes['2xl'],
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.lilac[600],
  },
  name: {
    fontSize: EDITORIAL_THEME.typography.serif.sizes['3xl'],
    fontFamily: EDITORIAL_THEME.typography.serif.family,
    color: EDITORIAL_THEME.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: EDITORIAL_THEME.typography.sans.family,
    color: EDITORIAL_THEME.colors.text.secondary,
  },
  optionsContainer: {
    paddingHorizontal: EDITORIAL_THEME.layout.containerPadding,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: EDITORIAL_THEME.colors.white,
    borderRadius: EDITORIAL_THEME.borderRadius.lg,
    marginBottom: 12,
    ...EDITORIAL_THEME.shadows.soft,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EDITORIAL_THEME.colors.lilac[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    fontSize: EDITORIAL_THEME.typography.sans.sizes.base,
    fontFamily: 'Inter_400Regular',
    color: EDITORIAL_THEME.colors.text.primary,
  },
});