/**
 * KVKK Context - Uygulama genelinde KVKK compliance yönetimi
 *
 * Bu context:
 * - KVKK durumunu global olarak yönetir
 * - Rıza değişikliklerini tüm uygulamaya yayar
 * - Compliance kontrollerini sağlar
 * - Banner ve modal yönetimini yapar
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { KVKKBanner } from '@/components/privacy/KVKKBanner';
import { KVKKConsentModal } from '@/components/privacy/KVKKConsentModal';
import { useAuth } from '@/hooks/useAuth';
import { useKVKK } from '@/hooks/useKVKK';
import { ConsentType, DataProcessingPurpose, LegalBasis } from '@/services/kvkkConsentService';

interface KVKKContextType {
  // Compliance Status
  isCompliant: boolean;
  complianceScore: number;
  missingConsents: ConsentType[];

  // Consent Management
  hasConsent: (type: ConsentType) => boolean;
  requestConsent: (types: ConsentType[], purpose?: string) => Promise<boolean>;
  grantConsent: (
    type: ConsentType,
    purpose: DataProcessingPurpose,
    legalBasis: LegalBasis,
  ) => Promise<void>;
  withdrawConsent: (type: ConsentType) => Promise<void>;

  // UI Management
  showConsentModal: (requiredConsents?: ConsentType[]) => void;
  hideConsentModal: () => void;
  showKVKKSettings: () => void;

  // Data Rights
  exportUserData: () => Promise<void>;
  deleteUserData: () => Promise<void>;

  // State
  loading: boolean;
  error: string | null;
}

const KVKKContext = createContext<KVKKContextType | undefined>(undefined);

interface KVKKProviderProps {
  children: ReactNode;
  onNavigateToSettings?: () => void;
}

export const KVKKProvider: React.FC<KVKKProviderProps> = ({ children, onNavigateToSettings }) => {
  const { user } = useAuth();
  const kvkk = useKVKK();
  const [showModal, setShowModal] = useState(false);
  const [modalRequiredConsents, setModalRequiredConsents] = useState<ConsentType[]>([]);
  const [pendingConsentResolve, setPendingConsentResolve] = useState<
    ((success: boolean) => void) | null
  >(null);

  // Kullanıcı değiştiğinde KVKK durumunu kontrol et
  useEffect(() => {
    if (user && !kvkk.loading) {
      checkInitialCompliance();
    }
  }, [user, kvkk.loading, kvkk.isCompliant]);

  const checkInitialCompliance = () => {
    // Eğer kullanıcı yeni ise veya temel rızalar eksikse banner göster
    if (!kvkk.isCompliant && kvkk.missingConsents.length > 0) {
      const hasEssentialConsents = kvkk.hasConsent(ConsentType.AI_PROCESSING);
      if (!hasEssentialConsents) {
        // Banner otomatik olarak gösterilecek (KVKKBanner bileşeninde)
      }
    }
  };

  // Rıza talep etme
  const requestConsent = async (types: ConsentType[], purpose?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalRequiredConsents(types);
      setPendingConsentResolve(() => resolve);
      setShowModal(true);
    });
  };

  // Modal'ı göster
  const showConsentModal = (requiredConsents: ConsentType[] = []) => {
    setModalRequiredConsents(requiredConsents);
    setShowModal(true);
  };

  // Modal'ı gizle
  const hideConsentModal = () => {
    setShowModal(false);
    setModalRequiredConsents([]);
    if (pendingConsentResolve) {
      pendingConsentResolve(false);
      setPendingConsentResolve(null);
    }
  };

  // KVKK ayarlarını göster
  const showKVKKSettings = () => {
    onNavigateToSettings?.();
  };

  // Rıza verme
  const grantConsent = async (
    type: ConsentType,
    purpose: DataProcessingPurpose,
    legalBasis: LegalBasis,
  ) => {
    await kvkk.grantConsent(type, purpose, legalBasis);
  };

  // Rıza geri çekme
  const withdrawConsent = async (type: ConsentType) => {
    await kvkk.withdrawConsent(type);
  };

  // Veri dışa aktarma
  const exportUserData = async () => {
    await kvkk.exportData();
  };

  // Veri silme
  const deleteUserData = async () => {
    await kvkk.deleteData();
  };

  // Modal onay callback'i
  const handleConsentModalGranted = (grantedConsents: ConsentType[]) => {
    setShowModal(false);

    if (pendingConsentResolve) {
      // Gerekli rızaların tümü verildi mi kontrol et
      const allRequiredGranted = modalRequiredConsents.every((required) =>
        grantedConsents.includes(required),
      );
      pendingConsentResolve(allRequiredGranted);
      setPendingConsentResolve(null);
    }

    setModalRequiredConsents([]);
  };

  // Banner callback'leri
  const handleBannerAccept = () => {
    // Banner kabul edildi, compliance tekrar kontrol edilecek
    kvkk.refreshConsents();
  };

  const handleBannerReject = () => {
    // Sadece gerekli rızalar verildi
    kvkk.refreshConsents();
  };

  const handleBannerCustomize = () => {
    // Özelleştirme için modal aç
    showConsentModal();
  };

  const contextValue: KVKKContextType = {
    // Compliance Status
    isCompliant: kvkk.isCompliant,
    complianceScore: kvkk.complianceScore,
    missingConsents: kvkk.missingConsents,

    // Consent Management
    hasConsent: kvkk.hasConsent,
    requestConsent,
    grantConsent,
    withdrawConsent,

    // UI Management
    showConsentModal,
    hideConsentModal,
    showKVKKSettings,

    // Data Rights
    exportUserData,
    deleteUserData,

    // State
    loading: kvkk.loading,
    error: kvkk.error,
  };

  return (
    <KVKKContext.Provider value={contextValue}>
      {children}

      {/* KVKK Banner - İlk kullanım için */}
      <KVKKBanner
        onAccept={handleBannerAccept}
        onReject={handleBannerReject}
        onCustomize={handleBannerCustomize}
      />

      {/* KVKK Consent Modal - Detaylı rıza yönetimi için */}
      <KVKKConsentModal
        visible={showModal}
        onClose={hideConsentModal}
        requiredConsents={modalRequiredConsents}
        onConsentGranted={handleConsentModalGranted}
      />
    </KVKKContext.Provider>
  );
};

// Hook to use KVKK context
export const useKVKKContext = (): KVKKContextType => {
  const context = useContext(KVKKContext);
  if (context === undefined) {
    throw new Error('useKVKKContext must be used within a KVKKProvider');
  }
  return context;
};

// HOC for components that require specific consents
export const withKVKKConsent = <P extends object>(
  Component: React.ComponentType<P>,
  requiredConsents: ConsentType[],
  fallbackComponent?: React.ComponentType<P>,
) => {
  return (props: P) => {
    const { hasConsent, requestConsent, loading } = useKVKKContext();
    const [consentChecked, setConsentChecked] = useState(false);
    const [hasRequiredConsents, setHasRequiredConsents] = useState(false);

    useEffect(() => {
      const checkConsents = async () => {
        if (loading) return;

        const allConsentsGranted = requiredConsents.every((consent) => hasConsent(consent));

        if (!allConsentsGranted) {
          const success = await requestConsent(requiredConsents);
          setHasRequiredConsents(success);
        } else {
          setHasRequiredConsents(true);
        }

        setConsentChecked(true);
      };

      checkConsents();
    }, [loading, hasConsent, requestConsent]);

    if (!consentChecked || loading) {
      return null; // veya loading component
    }

    if (!hasRequiredConsents && fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }

    if (!hasRequiredConsents) {
      return null; // Rıza verilmedi ve fallback yok
    }

    return <Component {...props} />;
  };
};

export default KVKKContext;
