import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import frTranslation from '@/locales/fr/translation.json'

export const defaultNS = 'translation'

export const resources = {
  fr: { translation: frTranslation },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})

export default i18n
