'use client'

import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../i18n/index.js'

/** Persisted so the tour is shown once, not on every visit. */
export const ONBOARDING_STORAGE_KEY = 'glyph-weaver-onboarding-done'

/**
 * The tour content as i18n key pairs. Kept as data (not JSX) so a test can
 * assert that every key exists in every locale: a missing key would otherwise
 * render the raw key to a first-time user, silently.
 */
export const ONBOARDING_STEPS = [
  { title: 'onboarding.title', body: 'onboarding.subtitle' },
  { title: 'onboarding.drawTitle', body: 'onboarding.draw' },
  { title: 'onboarding.inkTitle', body: 'onboarding.ink' },
  { title: 'onboarding.validateTitle', body: 'onboarding.validate' },
] as const

/**
 * First-run tutorial: a small, dismissible dialog that names the three actions
 * a new user needs (draw, choose the ink, validate). Native elements and a real
 * dialog role keep keyboard and screen-reader support; Escape closes it.
 */
export function OnboardingTour() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== '1')
    } catch {
      // Private mode or no storage: showing the tour once is harmless.
      setVisible(true)
    }
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '1')
    } catch {
      // Nothing to persist; the tour will simply show again next time.
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, dismiss])

  if (!visible) return null

  const current = ONBOARDING_STEPS[step]!
  const isLast = step === ONBOARDING_STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gw-onboarding-title"
        data-testid="onboarding-tour"
        className="w-full max-w-sm rounded-lg border p-5 shadow-xl"
        style={{ backgroundColor: 'var(--gw-bg-secondary)', borderColor: 'var(--gw-border)' }}
      >
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--gw-text-muted)' }}>
          {t('onboarding.step')} {step + 1}/{ONBOARDING_STEPS.length}
        </p>
        <h2
          id="gw-onboarding-title"
          className="mt-1 text-lg font-semibold"
          style={{ color: 'var(--gw-accent-gold)' }}
        >
          {t(current.title)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--gw-text-secondary)' }}>
          {t(current.body)}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="rounded px-3 py-1.5 text-sm"
            style={{ color: 'var(--gw-text-muted)' }}
          >
            {t('onboarding.skip')}
          </button>
          <button
            type="button"
            onClick={() => (isLast ? dismiss() : setStep((value) => value + 1))}
            className="rounded px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: 'var(--gw-accent-purple)', color: 'var(--gw-text-primary)' }}
          >
            {isLast ? t('onboarding.done') : t('onboarding.next')}
          </button>
        </div>
      </div>
    </div>
  )
}
