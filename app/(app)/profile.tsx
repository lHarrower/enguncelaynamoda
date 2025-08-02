import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DesignSystem } from '@/theme/DesignSystem';
import StandardButton from '@/components/shared/StandardButton';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ProfileOption = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true,
  danger = false
}: { 
  icon: React.ComponentProps<typeof Ionicons>['name']; 
  title: string; 
  subtitle?: string; 
  onPress: () => void; 
  showArrow?: boolean;
  danger?: boolean;
}) => {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = 0.98;
  };
  
  const handlePressOut = () => {
    scale.value = 1;
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={styles.optionContainer} 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.optionLeft}>
          <View style={[styles.optionIcon, danger && styles.optionIconDanger]}>
            <Ionicons 
              name={icon} 
              size={18} 
              color={danger ? DesignSystem.colors.error[500] : DesignSystem.colors.text.secondary} 
            />
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, danger && styles.optionTitleDanger]}>{title}</Text>
            {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {showArrow && (
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={DesignSystem.colors.text.quaternary} 
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProfileCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.profileCard, style]}>
    {children}
  </View>
);

const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ProfileCard>
      {children}
    </ProfileCard>
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      'clamp'
    );

    return {
      opacity,
    };
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out from profile screen:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const renderFloatingHeader = () => (
    <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEditProfile}>
          <Ionicons 
            name={isEditing ? "checkmark" : "pencil"} 
            size={18} 
            color={DesignSystem.colors.text.primary} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=400&h=400&fit=crop&crop=face' }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.avatarEditButton}>
              <Ionicons name="camera" size={16} color={DesignSystem.colors.text.inverse} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Emma Johnson</Text>
          <Text style={styles.userTitle}>Fashion Enthusiast</Text>
          <Text style={styles.userLocation}>New York, NY</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>127</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>43</Text>
          <Text style={styles.statLabel}>Outfits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>8.7</Text>
          <Text style={styles.statLabel}>Style Score</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {renderFloatingHeader()}
      
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DesignSystem.spacing.massive }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}

        {/* Account Management */}
        <ProfileSection title="Account">
          <ProfileOption
            icon="person-outline"
            title="Personal Information"
            subtitle="Manage your account details"
            onPress={() => {/* TODO: Implement personal info */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            subtitle="Control your data and privacy"
            onPress={() => {/* TODO: Implement privacy settings */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="notifications-outline"
            title="Notifications"
            subtitle="Customize your alerts"
            onPress={() => {/* TODO: Implement notifications */}}
          />
        </ProfileSection>

        {/* Style Preferences */}
        <ProfileSection title="Style & Preferences">
          <ProfileOption
            icon="color-palette-outline"
            title="Style Profile"
            subtitle="Define your fashion preferences"
            onPress={() => {/* TODO: Implement style preferences */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="resize-outline"
            title="Size & Measurements"
            subtitle="Update your sizing information"
            onPress={() => {/* TODO: Implement size profile */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="heart-outline"
            title="Favorite Brands"
            subtitle="Manage your preferred brands"
            onPress={() => {/* TODO: Implement favorite brands */}}
          />
        </ProfileSection>

        {/* App Settings */}
        <ProfileSection title="App Settings">
          <ProfileOption
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => {/* TODO: Implement language settings */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="moon-outline"
            title="Appearance"
            subtitle="Light mode"
            onPress={() => {/* TODO: Implement appearance settings */}}
          />
        </ProfileSection>

        {/* Support & Legal */}
        <ProfileSection title="Support & Legal">
          <ProfileOption
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => {/* TODO: Implement help center */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="chatbubble-outline"
            title="Contact Support"
            subtitle="Send us your feedback"
            onPress={() => {/* TODO: Implement contact us */}}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="document-text-outline"
            title="Terms & Privacy Policy"
            subtitle="Read our policies"
            onPress={() => {/* TODO: Implement terms & privacy */}}
          />
        </ProfileSection>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <StandardButton
            title="Sign Out"
            onPress={handleSignOut}
            variant="ghost"
            size="large"
            fullWidth
            icon="log-out-outline"
          />
        </View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: DesignSystem.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.tertiary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 60,
    paddingBottom: DesignSystem.spacing.md,
  },
  headerTitle: {
    ...DesignSystem.typography.h2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '400',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.round,
    backgroundColor: DesignSystem.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  profileHeader: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: 100,
    paddingBottom: DesignSystem.spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: DesignSystem.spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DesignSystem.colors.surface.secondary,
    borderWidth: 3,
    borderColor: DesignSystem.colors.border.secondary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DesignSystem.colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: DesignSystem.colors.background.primary,
    ...DesignSystem.elevation.soft,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    ...DesignSystem.typography.h1,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
    fontWeight: '400',
  },
  userTitle: {
    ...DesignSystem.typography.body1,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  userLocation: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.surface.secondary,
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...DesignSystem.typography.h2,
    color: DesignSystem.colors.text.primary,
    fontWeight: '300',
    marginBottom: DesignSystem.spacing.xs,
  },
  statLabel: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: DesignSystem.colors.border.secondary,
    marginHorizontal: DesignSystem.spacing.lg,
  },
  section: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...DesignSystem.typography.overline,
    color: DesignSystem.colors.text.tertiary,
    marginBottom: DesignSystem.spacing.md,
    paddingLeft: DesignSystem.spacing.xs,
  },
  profileCard: {
    backgroundColor: DesignSystem.colors.surface.primary,
    borderRadius: DesignSystem.radius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
    overflow: 'hidden',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
    minHeight: 64,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: DesignSystem.radius.lg,
    backgroundColor: DesignSystem.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.secondary,
  },
  optionIconDanger: {
    backgroundColor: 'rgba(198, 40, 40, 0.1)',
    borderColor: 'rgba(198, 40, 40, 0.2)',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...DesignSystem.typography.body1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '400',
    marginBottom: 2,
  },
  optionTitleDanger: {
    color: DesignSystem.colors.error[500],
  },
  optionSubtitle: {
    ...DesignSystem.typography.caption,
    color: DesignSystem.colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: DesignSystem.colors.border.tertiary,
    marginLeft: DesignSystem.spacing.lg + 44 + DesignSystem.spacing.md,
  },
  signOutSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
  },
});

