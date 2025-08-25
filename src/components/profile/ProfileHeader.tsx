import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DesignSystem } from '@/theme/DesignSystem';

interface ProfileHeaderProps {
  session: Session | null;
  onEditProfile: () => void;
  onShareProfile: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  session,
  onEditProfile,
  onShareProfile,
}) => {
  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const styles = StyleSheet.create({
    actionButton: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.background.elevated,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      gap: DesignSystem.spacing.sm,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.sm,
    },
    actionButtonText: {
      color: DesignSystem.colors.text.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: DesignSystem.spacing.md,
    },
    container: {
      alignItems: 'center',
      borderBottomColor: DesignSystem.colors.border.primary,
      borderBottomWidth: 1,
      paddingVertical: DesignSystem.spacing.xxxl,
    },
    userAvatar: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.gold[500],
      borderRadius: 40,
      height: 80,
      justifyContent: 'center',
      marginBottom: DesignSystem.spacing.lg,
      width: 80,
    },
    userEmail: {
      color: DesignSystem.colors.text.primary,
      fontSize: 14,
      marginBottom: DesignSystem.spacing.lg,
      opacity: 0.7,
    },
    userInitials: {
      color: DesignSystem.colors.background.primary,
      fontSize: 32,
      fontWeight: 'bold',
    },
    userName: {
      color: DesignSystem.colors.text.primary,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: DesignSystem.spacing.xs,
    },
  });

  if (!session) {
    return (
      <View style={styles.container}>
        <Ionicons name="person-circle-outline" size={100} color={DesignSystem.colors.gold[500]} />
        <Text style={styles.userName}>Welcome to AYNAMODA</Text>
        <Text style={styles.userEmail}>Sign in to access your profile and wardrobe</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.userAvatar}>
        <Text style={styles.userInitials}>
          {session.user?.email ? getUserInitials(session.user.email) : 'U'}
        </Text>
      </View>
      <Text style={styles.userName}>{session.user?.email?.split('@')[0] || 'User'}</Text>
      <Text style={styles.userEmail}>{session.user?.email || 'user@aynamoda.app'}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEditProfile}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          accessibilityHint="Tap to edit your profile information"
        >
          <Ionicons name="pencil" size={16} color={DesignSystem.colors.text.primary} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShareProfile}
          accessibilityRole="button"
          accessibilityLabel="Share profile"
          accessibilityHint="Tap to share your profile with others"
        >
          <Ionicons name="share-outline" size={16} color={DesignSystem.colors.text.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
