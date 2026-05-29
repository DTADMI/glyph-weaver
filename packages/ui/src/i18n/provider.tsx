'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Locale, TranslationMap, I18nContextValue } from './config.js'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, COOKIE_KEY, STORAGE_KEY } from './config.js'
import { en, fr } from './translations/index.js'

const translations: Record<Locale, TranslationMap> = { en, fr }

function getNestedValue(obj: TranslationMap, path: string): string {
  const keys = path.split('.')
  let current: TranslationMap | string = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) return path
    current = (current as TranslationMap)[key]!
    if (current === undefined) return path
  }
  return typeof current === 'string' ? current : path
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match?.[1]
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`
}

function resolveClientLocale(): Locale {
  const fromCookie = readCookie(COOKIE_KEY)
  if (fromCookie && SUPPORTED_LOCALES.includes(fromCookie as Locale)) {
    return fromCookie as Locale
  }

  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY)
    if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage as Locale)) {
      return fromStorage as Locale
    }
  } catch {
    // localStorage unavailable
  }

  if (typeof navigator !== 'undefined' && navigator.languages) {
    for (const lang of navigator.languages) {
      const base = lang.split('-')[0]!
      if (SUPPORTED_LOCALES.includes(base as Locale)) {
        return base as Locale
      }
    }
  }

  return DEFAULT_LOCALE
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    setLocaleState(resolveClientLocale())
  }, [])

  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable
    }
    setCookie(COOKIE_KEY, next)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale] ?? translations[DEFAULT_LOCALE]
      return getNestedValue(dict, key)
    },
    [locale],
  )

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t } },
    children,
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}

export type { Locale, I18nContextValue } from './config.js'
