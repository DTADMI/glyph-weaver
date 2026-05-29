import type { Locale, TranslationMap } from './config.js'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, COOKIE_KEY } from './config.js'
import { en, fr } from './translations/index.js'

const translations: Record<Locale, TranslationMap> = { en, fr }

function getNestedValue(obj: TranslationMap, path: string): string {
  const keys = path.split('.')
  let current: TranslationMap | string = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return path
    }
    current = (current as TranslationMap)[key]!
    if (current === undefined) {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}

export function resolveLocale(cookieValue?: string, acceptLanguage?: string): Locale {
  if (cookieValue && SUPPORTED_LOCALES.includes(cookieValue as Locale)) {
    return cookieValue as Locale
  }

  if (acceptLanguage) {
    const langs = acceptLanguage.split(',').map((l) => l.split(';')[0]!.trim())
    for (const lang of langs) {
      const base = lang.split('-')[0]!
      if (SUPPORTED_LOCALES.includes(base as Locale)) {
        return base as Locale
      }
    }
  }

  return DEFAULT_LOCALE
}

export function parseAcceptLanguage(header: string | null): string | undefined {
  if (!header) return undefined
  return header
}

export function getServerTranslations(locale: Locale): {
  locale: Locale
  t: (key: string) => string
  cookieKey: string
} {
  const lang = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  const dict = translations[lang] ?? translations[DEFAULT_LOCALE]

  return {
    locale: lang,
    cookieKey: COOKIE_KEY,
    t: (key: string) => getNestedValue(dict, key),
  }
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, COOKIE_KEY } from './config.js'
export type { Locale, TranslationMap } from './config.js'
