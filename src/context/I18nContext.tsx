import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';

import i18n, { availableLocales, setLocale } from '@/config/i18n';
import { useLanguage, useUIActions } from '@/store/globalStore';
import { errorInDev } from '@/utils/consoleSuppress';

interface I18nOptions {
  [key: string]: string | number | boolean;
}

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  t: (key: string, options?: I18nOptions) => string;
  availableLocales: typeof availableLocales;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'user_locale';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const locale = useLanguage();
  const { setLanguage } = useUIActions();
  
  // Convert global store language to locale format
  const currentLocale = locale === 'tr' ? 'tr' : 'en';
  const isRTL = ['ar', 'he', 'fa'].includes(currentLocale);

  useEffect(() => {
    initializeLocale();
  }, []);

  const initializeLocale = async () => {
    try {
      // Try to get saved locale from storage
      const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);

      if (savedLocale && availableLocales.some((l) => l.code === savedLocale)) {
        // Update i18n with saved locale
        setLocale(savedLocale);
      } else {
        // Use current global store language or fallback to English
        const fallbackLocale = currentLocale || 'en';
        setLocale(fallbackLocale);
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, fallbackLocale);
      }
    } catch (error) {
      errorInDev('Error initializing locale:', error);
      setLocale('en'); // Fallback to English
    }
  };

  const changeLocale = async (newLocale: string) => {
    try {
      // Update i18n
      setLocale(newLocale);

      // Convert locale to global store format and update
      const globalLanguage = newLocale === 'tr' ? 'tr' : 'en';
      setLanguage(globalLanguage);

      // Save to storage
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      errorInDev('Error changing locale:', error);
    }
  };

  const t = (key: string, options?: I18nOptions) => {
    return i18n.t(key, options);
  };

  const value: I18nContextType = {
    locale: currentLocale,
    setLocale: changeLocale,
    t,
    availableLocales,
    isRTL,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Helper hook for translations
export const useTranslation = () => {
  const { t } = useI18n();
  return { t };
};
