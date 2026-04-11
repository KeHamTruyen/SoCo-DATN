import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  vi: {
    translation: translationVI
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

function syncDocumentLang(lng: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng.split('-')[0] || 'en';
  }
}

i18n.on('languageChanged', (lng) => {
  syncDocumentLang(lng);
});

if (i18n.isInitialized) {
  syncDocumentLang(i18n.language);
} else {
  i18n.on('initialized', () => {
    syncDocumentLang(i18n.language);
  });
}

export default i18n;
