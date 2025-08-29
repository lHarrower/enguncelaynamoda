/**
 * KVKK Banner - İlk kullanım için KVKK rıza banner'ı
 *
 * Bu bileşen:
 * - Yeni kullanıcılara KVKK bilgilendirmesi yapar
 * - Temel rızaları alır
 * - Kullanıcıyı detaylı ayarlara yönlendirir
 * - KVKK compliance sağlar
 */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useSafeTheme } from '@/hooks/useSafeTheme';
import {
  ConsentType,
  DataProcessingPurpose,
  kvkkConsentService,
  LegalBasis,
} from '@/services/kvkkConsentService';
import { errorInDev } from '@/utils/consoleSuppress';

interface KVKKBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
  onCustomize?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const KVKK_BANNER_SHOWN_KEY = 'kvkk_banner_shown';

export const KVKKBanner: React.FC<KVKKBannerProps> = ({ onAccept, onReject, onCustomize }) => {
  const theme = useSafeTheme();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const slideAnim = new Animated.Value(300); // Banner başlangıçta ekranın altında

  useEffect(() => {
    checkBannerVisibility();
  }, [user]);

  useEffect(() => {
    if (visible) {
      // Banner'ı yukarı kaydır
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const checkBannerVisibility = async () => {
    if (!user) return;

    try {
      // Banner daha önce gösterildi mi?
      const bannerShown = await AsyncStorage.getItem(`${KVKK_BANNER_SHOWN_KEY}_${user.id}`);

      // Kullanıcının temel rızaları var mı?
      const hasEssentialConsents = kvkkConsentService.hasValidConsent(
        user.id,
        ConsentType.AI_PROCESSING,
      );

      // Banner gösterilmemişse veya temel rızalar yoksa banner'ı göster
      if (!bannerShown || !hasEssentialConsents) {
        setVisible(true);
      }
    } catch (error) {
      errorInDev('KVKK banner görünürlük kontrolü hatası:', error);
    }
  };

  const hideBanner = async () => {
    if (!user) return;

    // Banner'ı aşağı kaydır
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });

    // Banner gösterildi olarak işaretle
    await AsyncStorage.setItem(`${KVKK_BANNER_SHOWN_KEY}_${user.id}`, 'true');
  };

  const handleAcceptAll = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Temel rızaları ver
      const essentialConsents = [
        {
          type: ConsentType.AI_PROCESSING,
          purpose: DataProcessingPurpose.PERSONALIZED_RECOMMENDATIONS,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        },
        {
          type: ConsentType.ANALYTICS,
          purpose: DataProcessingPurpose.ANALYTICS_IMPROVEMENT,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        },
        {
          type: ConsentType.CRASH_REPORTING,
          purpose: DataProcessingPurpose.ANALYTICS_IMPROVEMENT,
          legalBasis: LegalBasis.LEGITIMATE_INTEREST,
        },
      ];

      for (const consent of essentialConsents) {
        await kvkkConsentService.grantConsent(
          user.id,
          consent.type,
          consent.purpose,
          consent.legalBasis,
          365, // 1 yıl
        );
      }

      await hideBanner();
      onAccept?.();
    } catch (error) {
      errorInDev('KVKK rıza verme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Sadece zorunlu rızaları ver (AI işleme)
      await kvkkConsentService.grantConsent(
        user.id,
        ConsentType.AI_PROCESSING,
        DataProcessingPurpose.PERSONALIZED_RECOMMENDATIONS,
        LegalBasis.LEGITIMATE_INTEREST,
        365,
      );

      await hideBanner();
      onReject?.();
    } catch (error) {
      errorInDev('KVKK rıza reddetme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = async () => {
    await hideBanner();
    onCustomize?.();
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://aynamoda.app/kvkk');
  };

  if (!visible || !user) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.banner,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Gizlilik Tercihleri</Text>
        </View>

        <Text style={[styles.description, { color: theme.colors.text }]}>
          AYNAMODA olarak kişisel verilerinizin güvenliği bizim için önemlidir. KVKK kapsamında
          verilerinizin nasıl işlendiği konusunda bilgilendirilmeniz gerekmektedir.
        </Text>

        <View style={styles.purposes}>
          <View style={styles.purposeItem}>
            <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
            <Text style={[styles.purposeText, { color: theme.colors.textSecondary }]}>
              Kişiselleştirilmiş stil önerileri
            </Text>
          </View>
          <View style={styles.purposeItem}>
            <Ionicons name="analytics" size={16} color={theme.colors.primary} />
            <Text style={[styles.purposeText, { color: theme.colors.textSecondary }]}>
              Uygulama performansının iyileştirilmesi
            </Text>
          </View>
          <View style={styles.purposeItem}>
            <Ionicons name="shield" size={16} color={theme.colors.primary} />
            <Text style={[styles.purposeText, { color: theme.colors.textSecondary }]}>
              Güvenlik ve hata tespiti
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.policyLink} onPress={openPrivacyPolicy}>
          <Text style={[styles.policyLinkText, { color: theme.colors.primary }]}>
            KVKK Politikasını İncele
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.customizeButton, { borderColor: theme.colors.border }]}
            onPress={handleCustomize}
            disabled={loading}
          >
            <Text style={[styles.customizeButtonText, { color: theme.colors.text }]}>
              Özelleştir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rejectButton, { borderColor: theme.colors.border }]}
            onPress={handleRejectAll}
            disabled={loading}
          >
            <Text style={[styles.rejectButtonText, { color: theme.colors.textSecondary }]}>
              Sadece Gerekli
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAcceptAll}
            disabled={loading}
          >
            <Text style={styles.acceptButtonText}>
              {loading ? 'Kaydediliyor...' : 'Tümünü Kabul Et'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
          Tercihlerinizi istediğiniz zaman ayarlar bölümünden değiştirebilirsiniz.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  banner: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  purposes: {
    marginBottom: 16,
    gap: 8,
  },
  purposeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  purposeText: {
    fontSize: 13,
    flex: 1,
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 16,
    gap: 4,
  },
  policyLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  customizeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  customizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default KVKKBanner;
