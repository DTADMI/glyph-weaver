import { describe, it, expect } from 'vitest'

import { ONBOARDING_STEPS } from '../components/OnboardingTour.js'
import { en } from '../i18n/translations/index.js'
import { fr } from '../i18n/translations/index.js'

type Dict = { [key: string]: unknown }

/** Flatten nested dictionaries into dotted keys. */
function flatten(obj: Dict, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flatten(value as Dict, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

/**
 * The tour content is data, so a missing translation is not a type error: it
 * renders the raw key to a first-time user. This asserts every key the tour
 * uses exists in BOTH locales.
 */
describe('onboarding tour', () => {
  const enKeys = new Set(flatten(en as Dict))
  const frKeys = new Set(flatten(fr as Dict))

  it('propose au moins trois etapes', () => {
    expect(ONBOARDING_STEPS.length).toBeGreaterThanOrEqual(3)
  })

  it('traduit chaque titre et corps en et fr', () => {
    const required = [
      ...ONBOARDING_STEPS.flatMap((step) => [step.title, step.body]),
      'onboarding.step',
      'onboarding.next',
      'onboarding.skip',
      'onboarding.done',
    ]

    const missing = required.filter((key) => !enKeys.has(key) || !frKeys.has(key))
    expect(missing, `cles manquantes : ${missing.join(', ')}`).toEqual([])
  })

  it('ne reutilise pas une cle deux fois', () => {
    const bodies = ONBOARDING_STEPS.map((step) => step.body)
    expect(new Set(bodies).size).toBe(bodies.length)
  })
})
