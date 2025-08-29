/**
 * KVKK Consent Modal - Türkiye Kişisel Verilerin Korunması Kanunu rıza modalı
 *
 * Bu bileşen KVKK kapsamında:
 * - Kullanıcıdan gerekli rızaları alır
 * - Veri işleme amaçlarını açıklar
 * - Kullanıcı haklarını bildirir
 * - Rıza geçmişini gösterir
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
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

interface KVKKConsentModalProps {
  visible: boolean;
  onClose: () => void;
  requiredConsents?: ConsentType[];
  onConsentGranted?: (consents: ConsentType[]) => void;
}

interface ConsentItem {
  type: ConsentType;
  title: string;
  description: string;
  purpose: DataProcessingPurpose;
  required: boolean;
  legalBasis: LegalBasis;
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    type: ConsentType.NOTIFICATIONS,
    title: 'Bildirimler',
    description: 'Günlük stil önerileri ve uygulama güncellemeleri için bildirim gönderebiliriz.',
    purpose: DataProcessingPurpose.SERVICE_PROVISION,
    required: false,
    legalBasis: LegalBasis.CONSENT,
  },
  {
    type: ConsentType.AI_PROCESSING,
    title: 'AI Kişiselleştirme',
    description: 'Stil tercihlerinizi analiz ederek size özel öneriler sunabiliriz.',
    purpose: DataProcessingPurpose.PERSONALIZED_RECOMMENDATIONS,
    required: true,
    legalBasis: LegalBasis.LEGITIMATE_INTEREST,
  },
  {
    type: ConsentType.ANALYTICS,
    title: 'Kullanım Analizi',
    description:
      'Uygulama performansını iyileştirmek için anonim kullanım verileri toplayabiliriz.',
    purpose: DataProcessingPurpose.ANALYTICS_IMPROVEMENT,
    required: false,
    legalBasis: LegalBasis.LEGITIMATE_INTEREST,
  },
  {
    type: ConsentType.MARKETING,
    title: 'Pazarlama İletişimi',
    description: 'Yeni özellikler ve özel teklifler hakkında e-posta gönderebiliriz.',
    purpose: DataProcessingPurpose.MARKETING_COMMUNICATION,
    required: false,
    legalBasis: LegalBasis.CONSENT,
  },
  {
    type: ConsentType.LOCATION,
    title: 'Konum Bilgisi',
    description: 'Hava durumuna uygun kıyafet önerileri için konum bilginizi kullanabiliriz.',
    purpose: DataProcessingPurpose.PERSONALIZED_RECOMMENDATIONS,
    required: false,
    legalBasis: LegalBasis.CONSENT,
  },
  {
    type: ConsentType.CRASH_REPORTING,
    title: 'Hata Raporlama',
    description: 'Uygulama hatalarını tespit etmek için anonim hata raporları gönderebiliriz.',
    purpose: DataProcessingPurpose.ANALYTICS_IMPROVEMENT,
    required: false,
    legalBasis: LegalBasis.LEGITIMATE_INTEREST,
  },
];

export const KVKKConsentModal: React.FC<KVKKConsentModalProps> = ({
  visible,
  onClose,
  requiredConsents = [],
  onConsentGranted,
}) => {
  const theme = useSafeTheme();
  const { user } = useAuth();
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>(
    {} as Record<ConsentType, boolean>,
  );
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<ConsentType | null>(null);

  useEffect(() => {
    if (visible && user) {
      loadCurrentConsents();
    }
  }, [visible, user]);

  const loadCurrentConsents = async () => {
    if (!user) return;

    const currentConsents: Record<ConsentType, boolean> = {} as Record<ConsentType, boolean>;

    for (const item of CONSENT_ITEMS) {
      currentConsents[item.type] = kvkkConsentService.hasValidConsent(user.id, item.type);
    }

    setConsents(currentConsents);
  };

  const handleConsentChange = (type: ConsentType, granted: boolean) => {
    setConsents((prev) => ({ ...prev, [type]: granted }));
  };

  const handleSaveConsents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const grantedConsents: ConsentType[] = [];

      for (const [type, granted] of Object.entries(consents)) {
        const consentType = type as ConsentType;
        const item = CONSENT_ITEMS.find((i) => i.type === consentType);
        if (!item) continue;

        if (granted) {
          await kvkkConsentService.grantConsent(
            user.id,
            consentType,
            item.purpose,
            item.legalBasis,
            365, // 1 yıl geçerli
          );
          grantedConsents.push(consentType);
        } else {
          await kvkkConsentService.withdrawConsent(user.id, consentType);
        }
      }

      // Gerekli rızaların kontrolü
      const missingRequired = requiredConsents.filter((required) => !consents[required]);
      if (missingRequired.length > 0) {
        Alert.alert(
          'Gerekli Rızalar',
          `Uygulamayı kullanmak için aşağıdaki rızalar gereklidir:\n${missingRequired.join(', ')}`,
          [{ text: 'Tamam' }],
        );
        return;
      }

      onConsentGranted?.(grantedConsents);
      onClose();
    } catch (error) {
      errorInDev('KVKK rıza kaydetme hatası:', error);
      Alert.alert('Hata', 'Rızalar kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://aynamoda.app/kvkk');
  };

  const openDataRights = () => {
    Alert.alert(
      'KVKK Haklarınız',
      'KVKK kapsamında aşağıdaki haklarınız bulunmaktadır:\n\n' +
        '• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n' +
        '• İşleme amaçlarını öğrenme\n' +
        '• Yanlış verilerin düzeltilmesini talep etme\n' +
        '• Verilerinizin silinmesini talep etme\n' +
        '• Veri işlemeye itiraz etme\n' +
        '• Verilerinizi başka platforma taşıma\n\n' +
        'Bu haklarınızı kullanmak için kvkk@aynamoda.app adresine başvurabilirsiniz.',
      [
        { text: 'E-posta Gönder', onPress: () => Linking.openURL('mailto:kvkk@aynamoda.app') },
        { text: 'Tamam', style: 'cancel' },
      ],
    );
  };

  const renderConsentItem = (item: ConsentItem) => {
    const isGranted = consents[item.type] || false;
    const isExpanded = showDetails === item.type;

    return (
      <View key={item.type} style={[styles.consentItem, { borderColor: theme.colors.border }]}>
        <View style={styles.consentHeader}>
          <View style={styles.consentInfo}>
            <Text style={[styles.consentTitle, { color: theme.colors.text }]}>
              {item.title}
              {item.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <Text style={[styles.consentDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.consentToggle, isGranted && styles.consentToggleActive]}
            onPress={() => handleConsentChange(item.type, !isGranted)}
          >
            {isGranted && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
        </View>

        <View style={styles.consentActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => setShowDetails(isExpanded ? null : item.type)}
          >
            <Text style={[styles.detailsButtonText, { color: theme.colors.primary }]}>
              {isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={[styles.consentDetails, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Amaç:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.purpose}</Text>

            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Hukuki Dayanak:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.legalBasis === LegalBasis.CONSENT
                ? 'Açık Rıza'
                : item.legalBasis === LegalBasis.LEGITIMATE_INTEREST
                  ? 'Meşru Menfaat'
                  : item.legalBasis === LegalBasis.CONTRACT
                    ? 'Sözleşmenin İfası'
                    : item.legalBasis}
            </Text>

            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Gereklilik:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.required
                ? 'Zorunlu - Uygulamanın temel işlevleri için gerekli'
                : 'İsteğe Bağlı - İstediğiniz zaman değiştirebilirsiniz'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            KVKK Rıza Yönetimi
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.introText, { color: theme.colors.text }]}>
              Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, verilerinizin nasıl işlendiği
              konusunda bilgilendirilmeniz ve rızanızın alınması gerekmektedir.
            </Text>

            <View style={styles.infoButtons}>
              <TouchableOpacity style={styles.infoButton} onPress={openPrivacyPolicy}>
                <Ionicons name="document-text" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoButtonText, { color: theme.colors.primary }]}>
                  KVKK Politikası
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.infoButton} onPress={openDataRights}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
                <Text style={[styles.infoButtonText, { color: theme.colors.primary }]}>
                  Haklarınız
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.consentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rıza Tercihleri</Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              Aşağıdaki veri işleme faaliyetleri için tercihlerinizi belirtebilirsiniz:
            </Text>

            {CONSENT_ITEMS.map(renderConsentItem)}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              * Zorunlu rızalar uygulamanın temel işlevleri için gereklidir.
            </Text>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Rızalarınızı istediğiniz zaman ayarlar bölümünden değiştirebilirsiniz.
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSaveConsents}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Kaydediliyor...' : 'Rızaları Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  intro: {
    paddingVertical: 20,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  consentsSection: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
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
    alignItems: 'flex-start',
    gap: 12,
  },
  consentInfo: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  requiredMark: {
    color: '#FF6B6B',
  },
  consentDescription: {
    fontSize: 13,
    lineHeight: 18,
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
  consentActions: {
    marginTop: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  consentDetails: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KVKKConsentModal;
