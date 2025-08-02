// src/components/shared/StudioHeader.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignSystem } from '@/theme/DesignSystem';

interface StudioHeaderProps {
  userName?: string;
  messageOfTheDay?: string;
  onProfilePress?: () => void;
  style?: any;
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
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
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
    paddingHorizontal: DesignSystem.spacing.xl,
    marginBottom: DesignSystem.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    ...DesignSystem.typography.scale.caption,
    color: DesignSystem.colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    ...DesignSystem.typography.scale.hero,
    color: DesignSystem.colors.text.primary,
    fontSize: 32,
  },
  profileButton: {
    padding: 4,
  },
  messageOfTheDay: {
    marginTop: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.sage[50],
    borderRadius: DesignSystem.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: DesignSystem.colors.sage[500],
  },
  messageText: {
    ...DesignSystem.typography.scale.body1,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudioHeader;