import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/theme/DesignSystem';
import type { Session } from '@supabase/supabase-js';

interface ProfileHeaderProps {
  session: Session | null;
  onEditProfile: () => void;
  onShareProfile: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  session, 
  onEditProfile, 
  onShareProfile 
}) => {


  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: DesignSystem.spacing.xxxl,
      borderBottomWidth: 1,
      borderBottomColor: DesignSystem.colors.border.primary,
    },
    userAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
  backgroundColor: DesignSystem.colors.gold[500],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: DesignSystem.spacing.lg,
    },
    userInitials: {
      fontSize: 32,
      fontWeight: 'bold',
      color: DesignSystem.colors.background.primary,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: DesignSystem.colors.text.primary,
      marginBottom: DesignSystem.spacing.xs,
    },
    userEmail: {
      fontSize: 14,
      color: DesignSystem.colors.text.primary,
      opacity: 0.7,
      marginBottom: DesignSystem.spacing.lg,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: DesignSystem.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.background.elevated,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border.primary,
      gap: DesignSystem.spacing.sm,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: DesignSystem.colors.text.primary,
    },
  });

  if (!session) {
    return (
      <View style={styles.container}>
  <Ionicons name="person-circle-outline" size={100} color={DesignSystem.colors.gold[500]} />
        <Text style={styles.userName}>Welcome to AYNAMODA</Text>
        <Text style={styles.userEmail}>
          Sign in to access your profile and wardrobe
        </Text>
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
      <Text style={styles.userName}>
        {session.user?.email?.split('@')[0] || 'User'}
      </Text>
      <Text style={styles.userEmail}>
        {session.user?.email || 'user@example.com'}
      </Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onEditProfile}>
          <Ionicons name="pencil" size={16} color={DesignSystem.colors.text.primary} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShareProfile}>
          <Ionicons name="share-outline" size={16} color={DesignSystem.colors.text.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};