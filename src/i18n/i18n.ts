import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import es from './es.json';
import ptBR from './pt-BR.json';
import ru from './ru.json';
import zhCN from './zh-CN.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    ru: { translation: ru },
    'zh-CN': { translation: zhCN },
    'pt-BR': { translation: ptBR },
  },
  lng: localStorage.getItem('language') ?? navigator.language ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
