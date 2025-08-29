// src/components/shared/StudioHeader.tsx

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignSystem } from '@/theme/DesignSystem';

interface StudioHeaderProps {
  userName?: string;
  messageOfTheDay?: string;
  onProfilePress?: () => void;
  style?: ViewStyle;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  userName = 'Stylist',
  messageOfTheDay,
  onProfilePress,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          accessibilityHint="Tap to open your profile"
        >
          <Ionicons
            name="person-circle-outline"
            size={32}
            color={DesignSystem.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {messageOfTheDay && (
        <View style={styles.messageOfTheDay}>
          <Text style={styles.messageText}>{messageOfTheDay}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing.xxxl,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  greeting: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  messageOfTheDay: {
    backgroundColor: DesignSystem.colors.sage[50],
    borderLeftColor: DesignSystem.colors.sage[500],
    borderLeftWidth: 3,
    borderRadius: DesignSystem.radius.md,
    marginTop: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
  },
  messageText: {
    ...DesignSystem.typography.body.medium,
    color: DesignSystem.colors.text.primary,
    lineHeight: 24,
    textAlign: 'center',
  },
  profileButton: {
    padding: DesignSystem.spacing.xs,
  },
  userName: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    fontSize: 32,
  },
});

export default StudioHeader;
