import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { memo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StandardButton from '@/components/shared/StandardButton';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { DesignSystem } from '@/theme/DesignSystem';
import { useOptimizedCallback } from '@/utils/performanceUtils';

import {
  getResponsivePadding,
  isTablet,
  responsiveFontSize,
  responsiveSpacing,
} from '@/utils/responsiveUtils';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ProfileOption = memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    danger = false,
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
            <LinearGradient
              colors={
                danger
                  ? [DesignSystem.colors.error[100], DesignSystem.colors.error[50]]
                  : [
                      DesignSystem.colors.background.secondary,
                      DesignSystem.colors.background.elevated,
                    ]
              }
              style={[styles.optionIcon, danger && styles.optionIconDanger]}
            >
              <Ionicons
                name={icon}
                size={18}
                color={danger ? DesignSystem.colors.error[500] : DesignSystem.colors.text.secondary}
              />
            </LinearGradient>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, danger && styles.optionTitleDanger]}>{title}</Text>
              {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          {showArrow && (
            <Ionicons name="chevron-forward" size={16} color={DesignSystem.colors.text.tertiary} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const ProfileCard = memo(
  ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
    <LinearGradient
      colors={[DesignSystem.colors.background.elevated, DesignSystem.colors.background.secondary]}
      style={[styles.profileCard, style]}
    >
      {children}
    </LinearGradient>
  ),
);

const ProfileSection = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ProfileCard>{children}</ProfileCard>
  </View>
));

function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], 'clamp');

    return {
      opacity,
    };
  });

  const handleSignOut = useOptimizedCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      // Sign out error handled silently in production
    }
  }, [signOut]);

  const handleEditProfile = useOptimizedCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const renderFloatingHeader = () => (
    <Animated.View style={[styles.floatingHeader, headerAnimatedStyle]}>
      <LinearGradient
        colors={[DesignSystem.colors.background.primary, DesignSystem.colors.background.secondary]}
        style={styles.floatingHeaderGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('navigation.profile')}</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEditProfile}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Save profile changes' : 'Edit profile'}
            accessibilityHint={
              isEditing
                ? 'Saves your profile changes'
                : 'Allows you to edit your profile information'
            }
          >
            <LinearGradient
              colors={[
                DesignSystem.colors.background.secondary,
                DesignSystem.colors.background.card,
              ]}
              style={styles.headerButtonGradient}
            >
              <Ionicons
                name={isEditing ? 'checkmark' : 'pencil'}
                size={18}
                color={DesignSystem.colors.primary[500]}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=400&h=400&fit=crop&crop=face',
            }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.avatarEditButton}>
              <Ionicons name="camera" size={16} color={DesignSystem.colors.text.inverse} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Ayşe Yılmaz</Text>
          <Text style={styles.userTitle}>{t('profile.fashionLover')}</Text>
          <Text style={styles.userLocation}>İstanbul, TR</Text>
        </View>
      </View>

      <LinearGradient
        colors={[DesignSystem.colors.background.secondary, DesignSystem.colors.background.card]}
        style={styles.statsRow}
      >
        <View style={styles.statItem}>
          <Text style={styles.statValue}>127</Text>
          <Text style={styles.statLabel}>{t('wardrobe.items')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>43</Text>
          <Text style={styles.statLabel}>{t('wardrobe.outfits')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>8.7</Text>
          <Text style={styles.statLabel}>{t('profile.styleScore')}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient
      colors={[DesignSystem.colors.background.primary, DesignSystem.colors.background.secondary]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {renderFloatingHeader()}

      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + DesignSystem.spacing.xxxl },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}

        {/* Account Management */}
        <ProfileSection title={t('profile.account')}>
          <ProfileOption
            icon="person-outline"
            title={t('profile.personalInfo')}
            subtitle={t('profile.manageAccountDetails')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="shield-checkmark-outline"
            title={t('profile.privacySecurity')}
            subtitle={t('profile.controlDataPrivacy')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="notifications-outline"
            title={t('profile.notifications')}
            subtitle={t('profile.customizeAlerts')}
            onPress={() => {
              router.push('/(app)/notifications');
            }}
          />
        </ProfileSection>

        {/* Style Preferences */}
        <ProfileSection title={t('profile.stylePreferences')}>
          <ProfileOption
            icon="color-palette-outline"
            title={t('profile.styleProfile')}
            subtitle={t('profile.setFashionPreferences')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="resize-outline"
            title={t('profile.sizeMeasurements')}
            subtitle={t('profile.updateSizeInfo')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="heart-outline"
            title={t('profile.favoriteBrands')}
            subtitle={t('profile.managePreferredBrands')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
        </ProfileSection>

        {/* App Settings */}
        <ProfileSection title={t('profile.appSettings')}>
          <ProfileOption
            icon="language-outline"
            title={t('profile.language')}
            subtitle={t('profile.currentLanguage')}
            onPress={() => {
              router.push('/(app)/settings');
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="moon-outline"
            title={t('profile.theme')}
            subtitle={t('profile.lightTheme')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
        </ProfileSection>

        {/* Support & Legal */}
        <ProfileSection title={t('profile.supportLegal')}>
          <ProfileOption
            icon="help-circle-outline"
            title={t('profile.helpCenter')}
            subtitle={t('profile.getHelpSupport')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="chatbubble-outline"
            title={t('profile.contactSupport')}
            subtitle={t('profile.sendFeedback')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
          <View style={styles.divider} />
          <ProfileOption
            icon="document-text-outline"
            title={t('profile.termsPrivacy')}
            subtitle={t('profile.readPolicies')}
            onPress={() => {
              Alert.alert(t('common.comingSoon'), t('common.featureComingSoon'));
            }}
          />
        </ProfileSection>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <StandardButton
            title={t('auth.signOut')}
            onPress={() => void handleSignOut()}
            variant="ghost"
            size="large"
            fullWidth
            icon="log-out-outline"
          />
        </View>
      </AnimatedScrollView>
    </LinearGradient>
  );
}

const createResponsiveStyles = () => {
  const padding = getResponsivePadding();
  const isTabletDevice = isTablet();

  return StyleSheet.create({
    avatar: {
      backgroundColor: DesignSystem.colors.background.secondary,
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 60,
      borderWidth: 3,
      height: 120,
      width: 120,
    },
    avatarContainer: {
      marginBottom: DesignSystem.spacing.lg,
      position: 'relative',
    },
    avatarEditButton: {
      alignItems: 'center',
      backgroundColor: DesignSystem.colors.primary[500],
      borderColor: DesignSystem.colors.background.primary,
      borderRadius: 18,
      borderWidth: 3,
      bottom: 0,
      elevation: 3,
      height: 36,
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      shadowColor: DesignSystem.colors.shadow.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      width: 36,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: DesignSystem.spacing.xl,
    },
    container: {
      flex: 1,
    },
    divider: {
      backgroundColor: DesignSystem.colors.border.primary,
      height: 1,
      marginLeft: 20 + 44 + 16,
    },
    floatingHeader: {
      borderBottomColor: DesignSystem.colors.border.primary,
      borderBottomWidth: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1000,
    },
    floatingHeaderGradient: {
      width: '100%',
    },
    headerButton: {
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 20,
      borderWidth: 1,
      height: 40,
      overflow: 'hidden',
      width: 40,
    },
    headerButtonGradient: {
      alignItems: 'center',
      borderRadius: 20,
      height: '100%',
      justifyContent: 'center',
      width: '100%',
    },
    headerContent: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: responsiveSpacing(DesignSystem.spacing.md),
      paddingHorizontal: isTabletDevice ? padding.horizontal * 1.5 : DesignSystem.spacing.lg,
      paddingTop: responsiveSpacing(60),
    },
    headerTitle: {
      color: DesignSystem.colors.text.primary,
      fontFamily: DesignSystem.typography.fontFamily.primary,
      fontSize: responsiveFontSize(DesignSystem.typography.scale.h2.fontSize || 24),
      fontWeight: '400',
    },
    optionContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 64,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.lg,
    },
    optionIcon: {
      alignItems: 'center',
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 16,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      marginRight: 16,
      width: 44,
    },
    optionIconDanger: {
      backgroundColor: DesignSystem.colors.error[100],
      borderColor: DesignSystem.colors.error[200],
    },
    optionLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      flex: 1,
    },
    optionSubtitle: {
      ...DesignSystem.typography.caption,
      color: DesignSystem.colors.text.tertiary,
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
    profileCard: {
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
    },
    profileHeader: {
      paddingBottom: DesignSystem.spacing.xxxl,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingTop: 100,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isTabletDevice ? padding.horizontal * 1.5 : 0,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginBottom: DesignSystem.spacing.xl,
      paddingHorizontal: DesignSystem.spacing.lg,
    },
    sectionTitle: {
      ...DesignSystem.typography.overline,
      color: DesignSystem.colors.text.tertiary,
      marginBottom: DesignSystem.spacing.md,
      paddingLeft: DesignSystem.spacing.xs,
    },
    signOutSection: {
      marginTop: responsiveSpacing(DesignSystem.spacing.lg),
      paddingHorizontal: isTabletDevice ? padding.horizontal * 1.5 : DesignSystem.spacing.lg,
    },
    statDivider: {
      backgroundColor: DesignSystem.colors.border.primary,
      height: 40,
      marginHorizontal: 20,
      width: 1,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      ...DesignSystem.typography.caption.medium,
      color: DesignSystem.colors.text.tertiary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    statValue: {
      ...DesignSystem.typography.scale.h2,
      color: DesignSystem.colors.text.primary,
      fontWeight: '300',
      marginBottom: DesignSystem.spacing.xs,
    },
    statsRow: {
      alignItems: 'center',
      borderColor: DesignSystem.colors.border.primary,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 20,
    },
    userInfo: {
      alignItems: 'center',
    },
    userLocation: {
      ...DesignSystem.typography.caption.medium,
      color: DesignSystem.colors.text.tertiary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    userName: {
      ...DesignSystem.typography.scale.h1,
      color: DesignSystem.colors.text.primary,
      fontWeight: '400',
      marginBottom: DesignSystem.spacing.xs,
    },
    userTitle: {
      ...DesignSystem.typography.body1,
      color: DesignSystem.colors.text.secondary,
      marginBottom: DesignSystem.spacing.xs,
    },
  });
};

// Create responsive styles
const styles = createResponsiveStyles();

export default memo(ProfileScreen);
