import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ULTRA_PREMIUM_THEME } from '../../constants/UltraPremiumTheme';
import UltraPremiumButton from '../../components/ultra/UltraPremiumButton';
import { useAuth } from '../../context/AuthContext';
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
              color={danger ? ULTRA_PREMIUM_THEME.semantic.status.error : ULTRA_PREMIUM_THEME.semantic.text.secondary} 
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
            color={ULTRA_PREMIUM_THEME.semantic.text.quaternary} 
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
            color={ULTRA_PREMIUM_THEME.semantic.text.primary} 
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
              <Ionicons name="camera" size={16} color={ULTRA_PREMIUM_THEME.semantic.text.inverse} />
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
          { paddingBottom: insets.bottom + ULTRA_PREMIUM_THEME.spacing.massive }
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
          <UltraPremiumButton
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
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
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
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: ULTRA_PREMIUM_THEME.semantic.border.tertiary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: 60,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.md,
  },
  headerTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h2,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    fontWeight: '400',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: ULTRA_PREMIUM_THEME.radius.round,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  profileHeader: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingTop: 100,
    paddingBottom: ULTRA_PREMIUM_THEME.spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    borderWidth: 3,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: ULTRA_PREMIUM_THEME.semantic.background.primary,
    ...ULTRA_PREMIUM_THEME.elevation.soft,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h1,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
    fontWeight: '400',
  },
  userTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.secondary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
  },
  userLocation: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    padding: ULTRA_PREMIUM_THEME.spacing.lg,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...ULTRA_PREMIUM_THEME.typography.scale.h2,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    fontWeight: '300',
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xs,
  },
  statLabel: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
    marginHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
  },
  section: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.xl,
  },
  sectionTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.overline,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
    marginBottom: ULTRA_PREMIUM_THEME.spacing.md,
    paddingLeft: ULTRA_PREMIUM_THEME.spacing.xs,
  },
  profileCard: {
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.primary,
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
    overflow: 'hidden',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    paddingVertical: ULTRA_PREMIUM_THEME.spacing.lg,
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
    borderRadius: ULTRA_PREMIUM_THEME.radius.lg,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ULTRA_PREMIUM_THEME.spacing.md,
    borderWidth: 1,
    borderColor: ULTRA_PREMIUM_THEME.semantic.border.secondary,
  },
  optionIconDanger: {
    backgroundColor: 'rgba(198, 40, 40, 0.1)',
    borderColor: 'rgba(198, 40, 40, 0.2)',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.body1,
    color: ULTRA_PREMIUM_THEME.semantic.text.primary,
    fontWeight: '400',
    marginBottom: 2,
  },
  optionTitleDanger: {
    color: ULTRA_PREMIUM_THEME.semantic.status.error,
  },
  optionSubtitle: {
    ...ULTRA_PREMIUM_THEME.typography.scale.caption,
    color: ULTRA_PREMIUM_THEME.semantic.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: ULTRA_PREMIUM_THEME.semantic.border.tertiary,
    marginLeft: ULTRA_PREMIUM_THEME.spacing.lg + 44 + ULTRA_PREMIUM_THEME.spacing.md,
  },
  signOutSection: {
    paddingHorizontal: ULTRA_PREMIUM_THEME.spacing.lg,
    marginTop: ULTRA_PREMIUM_THEME.spacing.lg,
  },
});

