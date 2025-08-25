import { I18n } from 'i18n-js';

// Import translation files
import en from '../locales/en.json';
import tr from '../locales/tr.json';

// Create i18n instance
const i18n = new I18n({
  en,
  tr,
});

// Set default locale without expo-localization
i18n.locale = 'en';

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Export the configured i18n instance
export default i18n;

// Helper function to get current locale
export const getCurrentLocale = () => i18n.locale;

// Helper function to set locale
export const setLocale = (locale: string) => {
  i18n.locale = locale;
};

// Helper function to translate with fallback
export const t = (key: string, options?: any) => {
  return i18n.t(key, options);
};

// Available locales
export const availableLocales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];
