import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from '../locales/ru.json';
import uz from '../locales/uz.json';
import cyrl from '../locales/cyrl.json';

const resources = {
  uz:   { translation: uz },   // Lotin
  cyrl: { translation: cyrl }, // Kiril
  kk:   { translation: cyrl }, // eski kod → kiril
  ru:   { translation: ru },
};

const ALLOWED = ['uz', 'cyrl', 'ru'];

function normalizeLng(lng) {
  const code = (lng || 'uz').split('-')[0];
  if (code === 'kk' || code === 'kiril' || code === 'uzcyrl') return 'cyrl';
  return ALLOWED.includes(code) ? code : 'uz';
}

globalThis.getInitialAdminTab = () => {
  const language = normalizeLng(localStorage.getItem('i18nextLng'));
  return language === 'cyrl' ? 'kk' : language;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'cyrl', 'kk', 'ru'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage'],
      convertDetectedLanguage: normalizeLng,
    },
  });

const stored = localStorage.getItem('i18nextLng') || '';
const next = normalizeLng(stored);
if (next !== stored) {
  i18n.changeLanguage(next);
}

export default i18n;
