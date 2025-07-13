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

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  debug: true,
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

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export { i18n };
