import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru.json'
import kk from './locales/kk.json'

export const SUPPORTED_LANGUAGES = ['ru', 'kk'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const STORAGE_KEY = 'researchers_lang'

function detectLanguage(): AppLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'ru' || stored === 'kk') return stored

  const browser = navigator.language.toLowerCase()
  if (browser.startsWith('kk') || browser.startsWith('kz')) return 'kk'
  return 'ru'
}

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
  },
  lng: detectLanguage(),
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  document.documentElement.lang = lng === 'kk' ? 'kk' : 'ru'
})

document.documentElement.lang = i18n.language === 'kk' ? 'kk' : 'ru'

export default i18n
