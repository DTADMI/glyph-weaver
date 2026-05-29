export type Locale = 'en' | 'fr'

export const DEFAULT_LOCALE: Locale = 'fr'

export const SUPPORTED_LOCALES: Locale[] = ['en', 'fr']

export const COOKIE_KEY = 'glyph-weaver-locale'

export const STORAGE_KEY = 'glyph-weaver-locale'

export interface TranslationMap {
  [key: string]: string | TranslationMap
}

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}
