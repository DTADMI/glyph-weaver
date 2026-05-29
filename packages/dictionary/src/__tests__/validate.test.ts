import { describe, it, expect } from 'vitest'
import { validateDictionary, assertValidDictionary } from '../validate.js'
import { DEFAULT_DICTIONARY } from '../index.js'

describe('validateDictionary', () => {
  it('validates the default dictionary as valid', () => {
    const result = validateDictionary(DEFAULT_DICTIONARY)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns errors for an empty object', () => {
    const result = validateDictionary({})
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns errors for a dictionary with a bad sigil entry', () => {
    const bad = {
      ...DEFAULT_DICTIONARY,
      sigils: [
        {
          id: 'bad',
          displayName: 'Bad Sigil',
          element: 'not-an-element',
          allowedLayers: [],
          strokeTemplate: { sourceAspectRatio: 1, strokes: [] },
          recognitionRotationInvariant: false,
          semantic: { force: 0, focus: 0, spread: 0, range: 0, lifetimeBias: 0 },
        },
      ],
    }
    const result = validateDictionary(bad)
    expect(result.valid).toBe(false)
  })

  it('returns errors for a dictionary with a bad sign entry', () => {
    const bad = {
      ...DEFAULT_DICTIONARY,
      signs: [
        {
          id: 'bad-sign',
          displayName: 'Bad Sign',
          allowedLayers: ['center'],
          semantic: {
            manifestation: 'not-real',
            directionMode: 'position',
            force: 0,
            focus: 0,
            spread: 0,
            range: 0,
            lifetimeBias: 0,
          },
          strokeTemplate: { sourceAspectRatio: 1, strokes: [] },
        },
      ],
    }
    const result = validateDictionary(bad)
    expect(result.valid).toBe(false)
  })

  it('returns errors for a dictionary with a bad sample spell entry', () => {
    const bad = {
      ...DEFAULT_DICTIONARY,
      sampleSpells: [
        {
          id: 'bad-spell',
          displayName: 'Bad Spell',
          description: 'Bad',
          element: 'fire',
          manifestations: ['bad-manifestation'],
          strokes: [],
        },
      ],
    }
    const result = validateDictionary(bad)
    expect(result.valid).toBe(false)
  })
})

describe('assertValidDictionary', () => {
  it('does not throw for a valid dictionary', () => {
    expect(() => assertValidDictionary(DEFAULT_DICTIONARY)).not.toThrow()
  })

  it('throws for an invalid dictionary', () => {
    expect(() => assertValidDictionary({})).toThrow('Dictionary validation failed')
  })
})
