import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

// Get language from localStorage or default to English
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  debug: true, // Temporarily enable debug mode
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  keySeparator: '.',
  nsSeparator: ':',
  returnEmptyString: false,
  returnNull: false,
  returnObjects: false,
});

// Log to verify
console.log('i18n initialized with resources:', resources);
console.log('Sample translation nav.home:', i18n.t('nav.home'));
console.log('Sample translation auth.login:', i18n.t('auth.login'));
console.log('Sample translation hero.title:', i18n.t('hero.title'));

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export { i18n };
