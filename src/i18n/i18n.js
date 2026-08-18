import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importing JSON files
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import uz from '../locales/uz.json';
import kk from '../locales/kk.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
  kk: { translation: kk }, // Добавлен казахский язык
};

i18n
  .use(LanguageDetector) // Detects the user's language
  .use(initReactI18next) // React integration
  .init({
    resources, // Local translations
    fallbackLng: 'uz', // Default language
    interpolation: {
      escapeValue: false, // No escaping required for React
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'], // Order of language detection
      caches: ['localStorage'], // Store language in localStorage
    },
  });

export default i18n;
