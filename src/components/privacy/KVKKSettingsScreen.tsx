/**
 * KVKK Settings Screen - KVKK rıza ve veri yönetimi ayarları
 *
 * Bu ekran kullanıcıların:
 * - Mevcut rızalarını görüntülemesini
 * - Rızalarını güncellemesini
 * - Veri haklarını kullanmasını
 * - KVKK geçmişini görüntülemesini sağlar
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import { useSafeTheme } from '../../hooks/useSafeTheme';
import { ConsentType, KVKKConsent, kvkkConsentService } from '../../services/kvkkConsentService';
import { KVKKConsentModal } from './KVKKConsentModal';

interface ConsentDisplayItem {
  type: ConsentType;
  title: string;
  description: string;
  icon: string;
  category: 'essential' | 'functional' | 'analytics' | 'marketing';
}

const CONSENT_DISPLAY_ITEMS: ConsentDisplayItem[] = [
  {
    type: ConsentType.AI_PROCESSING,
    title: 'AI Kişiselleştirme',
    description: 'Stil önerileriniz için AI analizi',
    icon: 'sparkles',
    category: 'essential',
  },
  {
    type: ConsentType.NOTIFICATIONS,
    title: 'Bildirimler',
    description: 'Günlük öneriler ve güncellemeler',
    icon: 'notifications',
    category: 'functional',
  },
  {
    type: ConsentType.LOCATION,
    title: 'Konum Bilgisi',
    description: 'Hava durumuna uygun öneriler',
    icon: 'location',
    category: 'functional',
  },
  {
    type: ConsentType.ANALYTICS,
    title: 'Kullanım Analizi',
    description: 'Uygulama iyileştirmeleri için',
    icon: 'analytics',
    category: 'analytics',
  },
  {
    type: ConsentType.CRASH_REPORTING,
    title: 'Hata Raporlama',
    description: 'Teknik sorunların çözümü için',
    icon: 'bug',
    category: 'analytics',
  },
  {
    type: ConsentType.MARKETING,
    title: 'Pazarlama İletişimi',
    description: 'Özel teklifler ve haberler',
    icon: 'mail',
    category: 'marketing',
  },
];

const CATEGORY_TITLES = {
  essential: 'Temel İşlevler',
  functional: 'İşlevsel Özellikler',
  analytics: 'Analiz ve İyileştirme',
  marketing: 'Pazarlama ve İletişim',
};

export const KVKKSettingsScreen: React.FC = () => {
  const theme = useSafeTheme();
  const { user } = useAuth();
  const [consents, setConsents] = useState<KVKKConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadConsents();
    }, [user]),
  );

  const loadConsents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userConsents = await kvkkConsentService.getConsentHistory(user.id);
      setConsents(userConsents);
    } catch (error) {
      console.error('KVKK rızaları yüklenirken hata:', error);
      Alert.alert('Hata', 'Rıza bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConsents();
    setRefreshing(false);
  };

  const hasActiveConsent = (type: ConsentType): boolean => {
    if (!user) return false;
    return kvkkConsentService.hasValidConsent(user.id, type);
  };

  const getConsentDate = (type: ConsentType): string | null => {
    const consent = consents
      .filter((c) => c.consentType === type && c.granted)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return consent ? new Date(consent.timestamp).toLocaleDateString('tr-TR') : null;
  };

  const handleToggleConsent = async (type: ConsentType, currentlyGranted: boolean) => {
    if (!user) return;

    try {
      setProcessingAction(type);

      if (currentlyGranted) {
        await kvkkConsentService.withdrawConsent(user.id, type);
      } else {
        // Yeni rıza için modal aç
        setShowConsentModal(true);
        return;
      }

      await loadConsents();
    } catch (error) {
      console.error('Rıza güncellenirken hata:', error);
      Alert.alert('Hata', 'Rıza güncellenirken bir hata oluştu.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDataExport = async () => {
    if (!user) return;

    Alert.alert(
      'Veri Dışa Aktarma',
      'Kişisel verilerinizi dışa aktarmak istediğinizi onaylıyor musunuz? Bu işlem birkaç dakika sürebilir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            try {
              setProcessingAction('export');
              const exportData = await kvkkConsentService.exportUserData(user.id);

              // E-posta ile gönderme simülasyonu
              Alert.alert(
                'Dışa Aktarma Tamamlandı',
                'Verileriniz e-posta adresinize gönderilecektir. Bu işlem 24 saat içinde tamamlanacaktır.',
                [{ text: 'Tamam' }],
              );
            } catch (error) {
              console.error('Veri dışa aktarma hatası:', error);
              Alert.alert('Hata', 'Veri dışa aktarılırken bir hata oluştu.');
            } finally {
              setProcessingAction(null);
            }
          },
        },
      ],
    );
  };

  const handleDataDeletion = async () => {
    if (!user) return;

    Alert.alert(
      'Veri Silme Talebi',
      'Bu işlem geri alınamaz! Tüm kişisel verileriniz kalıcı olarak silinecektir. Hesabınız da kapatılacaktır.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingAction('delete');
              await kvkkConsentService.deleteUserData(user.id);

              Alert.alert(
                'Silme Talebi Alındı',
                'Veri silme talebiniz alınmıştır. Bu işlem 30 gün içinde tamamlanacaktır. Bu süre içinde hesabınıza giriş yaparak talebi iptal edebilirsiniz.',
                [{ text: 'Tamam' }],
              );
            } catch (error) {
              console.error('Veri silme hatası:', error);
              Alert.alert('Hata', 'Veri silme talebi oluşturulurken bir hata oluştu.');
            } finally {
              setProcessingAction(null);
            }
          },
        },
      ],
    );
  };

  const openKVKKPolicy = () => {
    Linking.openURL('https://aynamoda.app/kvkk');
  };

  const contactDataProtectionOfficer = () => {
    Linking.openURL('mailto:kvkk@aynamoda.app?subject=KVKK Başvurusu');
  };

  const renderConsentItem = (item: ConsentDisplayItem) => {
    const isActive = hasActiveConsent(item.type);
    const consentDate = getConsentDate(item.type);
    const isProcessing = processingAction === item.type;

    return (
      <View key={item.type} style={[styles.consentItem, { borderColor: theme.colors.border }]}>
        <View style={styles.consentHeader}>
          <View style={[styles.consentIcon, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
          </View>

          <View style={styles.consentInfo}>
            <Text style={[styles.consentTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.consentDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            {isActive && consentDate && (
              <Text style={[styles.consentDate, { color: theme.colors.textSecondary }]}>
                Rıza tarihi: {consentDate}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.consentToggle, isActive && styles.consentToggleActive]}
            onPress={() => handleToggleConsent(item.type, isActive)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : isActive ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConsentCategory = (category: keyof typeof CATEGORY_TITLES) => {
    const categoryItems = CONSENT_DISPLAY_ITEMS.filter((item) => item.category === category);
    if (categoryItems.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
          {CATEGORY_TITLES[category]}
        </Text>
        {categoryItems.map(renderConsentItem)}
      </View>
    );
  };

  const renderDataRightsSection = () => (
    <View style={styles.dataRightsSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Veri Haklarınız</Text>
      <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
        KVKK kapsamında sahip olduğunuz hakları kullanabilirsiniz:
      </Text>

      <TouchableOpacity
        style={[styles.dataRightButton, { borderColor: theme.colors.border }]}
        onPress={handleDataExport}
        disabled={processingAction === 'export'}
      >
        <Ionicons name="download" size={20} color={theme.colors.primary} />
        <View style={styles.dataRightInfo}>
          <Text style={[styles.dataRightTitle, { color: theme.colors.text }]}>
            Verilerimi İndir
          </Text>
          <Text style={[styles.dataRightDescription, { color: theme.colors.textSecondary }]}>
            Kişisel verilerinizi indirilebilir formatta alın
          </Text>
        </View>
        {processingAction === 'export' && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.dataRightButton, { borderColor: theme.colors.border }]}
        onPress={handleDataDeletion}
        disabled={processingAction === 'delete'}
      >
        <Ionicons name="trash" size={20} color="#FF6B6B" />
        <View style={styles.dataRightInfo}>
          <Text style={[styles.dataRightTitle, { color: theme.colors.text }]}>Verilerimi Sil</Text>
          <Text style={[styles.dataRightDescription, { color: theme.colors.textSecondary }]}>
            Tüm kişisel verilerinizi kalıcı olarak silin
          </Text>
        </View>
        {processingAction === 'delete' && <ActivityIndicator size="small" color="#FF6B6B" />}
      </TouchableOpacity>
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bilgi ve İletişim</Text>

      <TouchableOpacity
        style={[styles.infoButton, { borderColor: theme.colors.border }]}
        onPress={openKVKKPolicy}
      >
        <Ionicons name="document-text" size={20} color={theme.colors.primary} />
        <Text style={[styles.infoButtonText, { color: theme.colors.text }]}>KVKK Politikası</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.infoButton, { borderColor: theme.colors.border }]}
        onPress={contactDataProtectionOfficer}
      >
        <Ionicons name="mail" size={20} color={theme.colors.primary} />
        <Text style={[styles.infoButtonText, { color: theme.colors.text }]}>
          Veri Sorumlusu ile İletişim
        </Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          KVKK ayarları yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>KVKK Ayarları</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Kişisel verilerinizin işlenmesi ile ilgili tercihlerinizi yönetin
          </Text>
        </View>

        {(['essential', 'functional', 'analytics', 'marketing'] as const).map(
          renderConsentCategory,
        )}

        {renderDataRightsSection()}
        {renderInfoSection()}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Bu ayarlar KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında hazırlanmıştır.
            Sorularınız için kvkk@aynamoda.app adresine başvurabilirsiniz.
          </Text>
        </View>
      </ScrollView>

      <KVKKConsentModal
        visible={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsentGranted={() => {
          setShowConsentModal(false);
          loadConsents();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  consentItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentInfo: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  consentDate: {
    fontSize: 12,
    marginTop: 4,
  },
  consentToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentToggleActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dataRightsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  dataRightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  dataRightInfo: {
    flex: 1,
  },
  dataRightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataRightDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoSection: {
    marginBottom: 32,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  infoButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default KVKKSettingsScreen;
