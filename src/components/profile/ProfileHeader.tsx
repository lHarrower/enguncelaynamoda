import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DIMENSIONS, SPACING } from '../../constants/AppConstants';
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
  const { colors, isDark } = useTheme();

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: SPACING.XXXL,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userAvatar: {
      width: DIMENSIONS.AVATAR_SIZE,
      height: DIMENSIONS.AVATAR_SIZE,
      borderRadius: DIMENSIONS.AVATAR_SIZE / 2,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.LG,
    },
    userInitials: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? colors.text : colors.background,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SPACING.XS,
    },
    userEmail: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
      marginBottom: SPACING.LG,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: SPACING.MD,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.LG,
      paddingVertical: SPACING.SM,
      borderRadius: DIMENSIONS.BORDER_RADIUS_ROUND,
      borderWidth: 1,
      borderColor: colors.border,
      gap: SPACING.SM,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });

  if (!session) {
    return (
      <View style={styles.container}>
        <Ionicons name="person-circle-outline" size={100} color={colors.tint} />
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
          <Ionicons name="pencil" size={16} color={colors.text} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShareProfile}>
          <Ionicons name="share-outline" size={16} color={colors.text} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 