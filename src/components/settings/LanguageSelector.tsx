import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '../../context/I18nContext';
import { DesignSystem } from '../../theme/DesignSystem';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
  },
];

interface LanguageSelectorProps {
  showAsModal?: boolean;
  onClose?: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  showAsModal = false,
  onClose,
}) => {
  const { locale, setLocale, t } = useI18n();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const currentLanguage = LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === locale) {
      setIsModalVisible(false);
      return;
    }

    try {
      setIsChangingLanguage(true);
      await setLocale(languageCode);
      setIsModalVisible(false);

      // Show success message
      const newLanguage = LANGUAGES.find((lang) => lang.code === languageCode);
      Alert.alert(
        t('success.settingsSaved'),
        `${t('profile.language')}: ${newLanguage?.nativeName}`,
        [{ text: t('common.done') }],
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(t('common.error'), t('errors.serverError'), [{ text: t('common.retry') }]);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    onClose?.();
  };

  const LanguageList = () => (
    <View style={styles.languageList}>
      {LANGUAGES.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[styles.languageItem, locale === language.code && styles.selectedLanguageItem]}
          onPress={() => handleLanguageChange(language.code)}
          disabled={isChangingLanguage}
        >
          <View style={styles.languageInfo}>
            <Text style={styles.flag}>{language.flag}</Text>
            <View style={styles.languageText}>
              <Text style={styles.languageName}>{language.nativeName}</Text>
              <Text style={styles.languageSubname}>{language.name}</Text>
            </View>
          </View>
          {locale === language.code && (
            <Ionicons name="checkmark-circle" size={24} color={DesignSystem.colors.primary[500]} />
          )}
          {isChangingLanguage && locale !== language.code && (
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={DesignSystem.colors.text.secondary}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (showAsModal) {
    return (
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('profile.language')}</Text>
            <View style={styles.placeholder} />
          </View>
          <LanguageList />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.selector} onPress={openModal}>
        <View style={styles.currentLanguage}>
          <Text style={styles.flag}>{currentLanguage.flag}</Text>
          <View style={styles.languageText}>
            <Text style={styles.languageName}>{currentLanguage.nativeName}</Text>
            <Text style={styles.languageSubname}>{t('profile.language')}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={DesignSystem.colors.text.secondary} />
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={DesignSystem.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('profile.language')}</Text>
            <View style={styles.placeholder} />
          </View>
          <LanguageList />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    padding: DesignSystem.spacing.sm,
  },
  container: {
    width: '100%',
  },
  currentLanguage: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  flag: {
    fontSize: 24,
    marginRight: DesignSystem.spacing.md,
  },
  languageInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  languageItem: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.radius.lg,
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing.sm,
    padding: DesignSystem.spacing.lg,
  },
  languageList: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  languageName: {
    ...DesignSystem.typography.body.large,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  languageSubname: {
    ...DesignSystem.typography.body.small,
    color: DesignSystem.colors.text.secondary,
    marginTop: 2,
  },
  languageText: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: DesignSystem.colors.background.primary,
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: DesignSystem.colors.border.primary,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
  },
  modalTitle: {
    ...DesignSystem.typography.heading.h3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  selectedLanguageItem: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderColor: DesignSystem.colors.primary[200],
    borderWidth: 1,
  },
  selector: {
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.radius.lg,
    flexDirection: 'row',
    padding: DesignSystem.spacing.lg,
  },
});

export default LanguageSelector;
