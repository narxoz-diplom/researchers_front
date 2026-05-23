import { ru, kk } from 'date-fns/locale'
import type { Locale } from 'date-fns'
import type { AppLanguage } from '@/i18n'

const LOCALES: Record<AppLanguage, Locale> = {
  ru,
  kk,
}

export function getDateLocale(language: string): Locale {
  if (language === 'kk') return LOCALES.kk
  return LOCALES.ru
}
