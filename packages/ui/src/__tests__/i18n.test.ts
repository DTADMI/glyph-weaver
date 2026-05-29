import { describe, it, expect } from 'vitest'
import { resolveLocale, getServerTranslations } from '../i18n/server.js'

describe('i18n - server', () => {
  describe('resolveLocale', () => {
    it('returns default fr when no cookie or header', () => {
      expect(resolveLocale()).toBe('fr')
    })

    it('returns cookie value when valid', () => {
      expect(resolveLocale('en')).toBe('en')
      expect(resolveLocale('fr')).toBe('fr')
    })

    it('falls back to default for invalid cookie value', () => {
      expect(resolveLocale('de')).toBe('fr')
    })

    it('resolves from Accept-Language header', () => {
      expect(resolveLocale(undefined, 'en-US,en;q=0.9')).toBe('en')
      expect(resolveLocale(undefined, 'fr-CA,fr;q=0.9')).toBe('fr')
    })

    it('cookie takes priority over Accept-Language', () => {
      expect(resolveLocale('en', 'fr-CA,fr;q=0.9')).toBe('en')
    })

    it('handles empty Accept-Language', () => {
      expect(resolveLocale(undefined, '')).toBe('fr')
    })

    it('correctly normalizes compound locale tags', () => {
      expect(resolveLocale(undefined, 'fr-CA')).toBe('fr')
      expect(resolveLocale(undefined, 'en-GB')).toBe('en')
    })
  })

  describe('getServerTranslations', () => {
    it('returns t function for known locale', () => {
      const { t, locale } = getServerTranslations('en')
      expect(locale).toBe('en')
      expect(t('app.name')).toBe('Glyph Weaver')
    })

    it('returns t function for french locale', () => {
      const { t, locale } = getServerTranslations('fr')
      expect(locale).toBe('fr')
      expect(t('app.name')).toBe('Glyph Weaver')
      expect(t('tools.pen')).toBe('Plume')
    })

    it('falls back when key is missing', () => {
      const { t } = getServerTranslations('en')
      expect(t('nonexistent.key.path')).toBe('nonexistent.key.path')
    })

    it('falls back for unsupported locale', () => {
      const { locale } = getServerTranslations('de' as 'en' | 'fr')
      expect(locale).toBe('fr')
    })
  })
})

describe('i18n - translations en', () => {
  it('has all required top-level keys', () => {
    const { t } = getServerTranslations('en')
    const keys = [
      'app.name',
      'app.tagline',
      'tools.pen',
      'tools.eraser',
      'tools.select',
      'tools.hand',
      'buttons.save',
      'buttons.undo',
      'buttons.redo',
      'buttons.clear',
      'buttons.export',
      'state.active',
      'state.prepared',
      'state.invalid',
      'labels.settings',
      'labels.diagnostics',
      'labels.dictionary',
      'labels.about',
      'errors.generic',
    ]
    for (const key of keys) {
      const val = t(key)
      expect(val).not.toBe(key)
      expect(typeof val).toBe('string')
      expect(val.length).toBeGreaterThan(0)
    }
  })
})

describe('i18n - translations fr', () => {
  it('has all required top-level keys in French', () => {
    const { t } = getServerTranslations('fr')
    const keys = [
      'app.name',
      'app.tagline',
      'tools.pen',
      'tools.eraser',
      'tools.select',
      'tools.hand',
      'buttons.save',
      'buttons.undo',
      'buttons.redo',
      'buttons.clear',
      'buttons.export',
      'state.active',
      'state.prepared',
      'state.invalid',
      'labels.settings',
      'labels.diagnostics',
      'labels.dictionary',
      'labels.about',
      'errors.generic',
    ]
    for (const key of keys) {
      const val = t(key)
      expect(val).not.toBe(key)
      expect(typeof val).toBe('string')
      expect(val.length).toBeGreaterThan(0)
    }
  })

  it('French translations differ from English', () => {
    const enTr = getServerTranslations('en')
    const frTr = getServerTranslations('fr')
    expect(enTr.t('tools.pen')).not.toBe(frTr.t('tools.pen'))
    expect(enTr.t('state.active')).not.toBe(frTr.t('state.active'))
    expect(enTr.t('buttons.save')).not.toBe(frTr.t('buttons.save'))
  })
})
