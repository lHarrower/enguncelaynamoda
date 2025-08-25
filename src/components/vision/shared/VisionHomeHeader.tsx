import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface VisionHomeHeaderProps {
  userName?: string;
  onProfilePress: () => void;
}

const VisionHomeHeader: React.FC<VisionHomeHeaderProps> = ({
  userName = 'Beautiful',
  onProfilePress,
}) => {
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
    <View style={styles.header}>
      <View>
        <Text style={[DesignSystem.typography.scale.caption, styles.greetingLabel]}>
          {getGreeting()}
        </Text>
        <Text style={[DesignSystem.typography.heading.h2, styles.welcomeTitle]}>{userName}</Text>
      </View>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        accessibilityHint="Tap to open profile settings"
      >
        <BlurView intensity={20} style={styles.profileBlur}>
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={DesignSystem.colors.neutral.charcoal}
          />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingLabel: {
    color: DesignSystem.colors.neutral.slate,
    marginBottom: DesignSystem.spacing.xs,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: DesignSystem.spacing.xl,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.sanctuary,
  },
  profileBlur: {
    padding: DesignSystem.spacing.sm,
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  welcomeTitle: {
    color: DesignSystem.colors.neutral.charcoal,
  },
});

export default VisionHomeHeader;
