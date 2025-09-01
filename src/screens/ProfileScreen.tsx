/**
 * Profile Screen - Serene Personal Sanctuary
 * Embodying "Digital Zen Garden" philosophy with mindful user experience
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { UNIFIED_COLORS, TYPOGRAPHY, SPACING, ELEVATION } from '@/theme/DesignSystem';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api/apiClient';

type Props = MainTabScreenProps<'Profile'>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  preferences?: {
    style_preferences?: string[];
    size_info?: Record<string, string>;
    favorite_brands?: string[];
  };
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.getUserProfile();
      setProfile(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Yakında', 'Profil düzenleme özelliği yakında eklenecek.');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UNIFIED_COLORS.terracotta[600]} />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  const ProfileOption = ({ icon, title, subtitle, onPress, showArrow = true, danger = false }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={[styles.optionIcon, danger && styles.optionIconDanger]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? UNIFIED_COLORS.error[600] : UNIFIED_COLORS.terracotta[600]}
          />
        </View>
        <View style={styles.optionText}>
          <Text style={[styles.optionTitle, danger && styles.optionTitleDanger]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={UNIFIED_COLORS.text.tertiary}
        />
      )}
    </TouchableOpacity>
  );

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={UNIFIED_COLORS.terracotta[600]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Serene Header */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profile?.avatar_url || 'https://via.placeholder.com/120x120/E8D5C4/8B4513?text=👤',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <Ionicons name="camera" size={16} color={UNIFIED_COLORS.text.inverse} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.name || user?.email || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
            {profile?.bio && <Text style={styles.userBio}>{profile.bio}</Text>}
            {profile?.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={UNIFIED_COLORS.text.tertiary} />
                <Text style={styles.userLocation}>{profile.location}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={16} color={UNIFIED_COLORS.terracotta[600]} />
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Kıyafet</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Kombin</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Favori</Text>
        </View>
      </View>

      {/* Account Management */}
      <ProfileSection title="Hesap Yönetimi">
        <ProfileOption
          icon="person-outline"
          title="Kişisel Bilgiler"
          subtitle="Hesap detaylarınızı yönetin"
          onPress={handleEditProfile}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="shield-checkmark-outline"
          title="Gizlilik ve Güvenlik"
          subtitle="Veri gizliliğinizi kontrol edin"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="notifications-outline"
          title="Bildirimler"
          subtitle="Uyarıları özelleştirin"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
      </ProfileSection>

      {/* Style Preferences */}
      <ProfileSection title="Stil Tercihleri">
        <ProfileOption
          icon="color-palette-outline"
          title="Stil Profili"
          subtitle="Moda tercihlerinizi belirleyin"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="resize-outline"
          title="Beden ve Ölçüler"
          subtitle="Beden bilgilerinizi güncelleyin"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="heart-outline"
          title="Favori Markalar"
          subtitle="Tercih ettiğiniz markaları yönetin"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
      </ProfileSection>

      {/* App Settings */}
      <ProfileSection title="Uygulama Ayarları">
        <ProfileOption
          icon="language-outline"
          title="Dil"
          subtitle="Türkçe"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="moon-outline"
          title="Tema"
          subtitle="Açık tema"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
      </ProfileSection>

      {/* Support & Legal */}
      <ProfileSection title="Destek ve Yasal">
        <ProfileOption
          icon="help-circle-outline"
          title="Yardım Merkezi"
          subtitle="SSS ve destek"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="document-text-outline"
          title="Kullanım Koşulları"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
        <View style={styles.divider} />
        <ProfileOption
          icon="shield-outline"
          title="Gizlilik Politikası"
          onPress={() => Alert.alert('Yakında', 'Bu özellik yakında eklenecek.')}
        />
      </ProfileSection>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={UNIFIED_COLORS.error[600]} />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UNIFIED_COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UNIFIED_COLORS.background.primary,
  },
  loadingText: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.zen,
    paddingBottom: SPACING.xl,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: UNIFIED_COLORS.background.secondary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: UNIFIED_COLORS.terracotta[600],
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: UNIFIED_COLORS.background.primary,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  userName: {
    ...TYPOGRAPHY.heading.h2,
    color: UNIFIED_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  userBio: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLocation: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.tertiary,
    marginLeft: SPACING.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UNIFIED_COLORS.background.elevated,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.border.primary,
  },
  editButtonText: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.terracotta[600],
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: UNIFIED_COLORS.background.elevated,
    marginHorizontal: SPACING.xl,
    borderRadius: 16,
    padding: SPACING.lg,
    ...ELEVATION.soft,
    marginBottom: SPACING.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.heading.h2,
    color: UNIFIED_COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: UNIFIED_COLORS.border.primary,
    marginHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: UNIFIED_COLORS.background.elevated,
    borderRadius: 16,
    ...ELEVATION.soft,
    overflow: 'hidden',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UNIFIED_COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIconDanger: {
    backgroundColor: UNIFIED_COLORS.error[100],
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.text.primary,
    fontWeight: '500',
  },
  optionTitleDanger: {
    color: UNIFIED_COLORS.error[600],
  },
  optionSubtitle: {
    ...TYPOGRAPHY.body.small,
    color: UNIFIED_COLORS.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: UNIFIED_COLORS.border.primary,
    marginLeft: SPACING.lg + 40 + SPACING.md, // Icon width + margin
  },
  signOutSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UNIFIED_COLORS.error[50],
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UNIFIED_COLORS.error[200],
  },
  signOutText: {
    ...TYPOGRAPHY.body.medium,
    color: UNIFIED_COLORS.error[600],
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default ProfileScreen;