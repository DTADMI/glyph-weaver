import { describe, it, expect } from 'vitest'
import { getCombinedElement, ELEMENT_COMBINATION_RULES, compileMultiElement } from '../multi-element.js'
import type { ElementId, GlyphAST } from '@glyph-weaver/core'

function makeRing() {
  return {
    found: true,
    center: { x: 0.5, y: 0.5 },
    radius: 0.4,
    complete: true,
    activationEvent: true,
    completeness: 0.95,
    strokeIds: ['ring-stroke-1'],
    gap: 0,
    gapArcLength: 0,
    coverageRatio: 0.98,
    roundness: 0.9,
    lineSmoothness: 0.85,
    neatness: 0.88,
    overdrawAmount: 0.05,
    unsupportedMultipleRings: [],
    unsupportedNestedRings: [],
  }
}

function makeSigil(element: ElementId, overrides = {}) {
  return {
    candidateId: `sigil-${element}`,
    strokeIds: ['stroke-1'],
    id: `${element}-sigil`,
    kind: 'sigil' as const,
    recognized: true,
    confidence: 0.9,
    recognitionStatus: 'valid' as const,
    element,
    layer: 'center' as const,
    radiusNorm: 0.1,
    angleDeg: 45,
    sizeNorm: 0.7,
    lengthNorm: 0.65,
    neatness: 0.9,
    shape: {
      elongation: 0.3,
      dominantAxisStrength: 0.7,
      strokeCount: 2,
      closedness: 0.4,
    },
    semantic: {
      force: 0.5,
      focus: 0.5,
      spread: 0.5,
      range: 0.5,
      lifetimeBias: 0.5,
    },
    ...overrides,
  }
}

function makeAst(element: ElementId, signs: any[] = []): GlyphAST {
  return {
    type: 'GlyphAST',
    version: '0.1.0',
    ring: makeRing(),
    candidates: [],
    primarySigil: makeSigil(element),
    unsupportedMultipleSigils: [],
    signs,
    unknowns: [],
    globalMetrics: {
      neatness: 0.85,
      radialSymmetry: 0.8,
      instability: 0.1,
    },
    warnings: [],
  }
}

describe('ELEMENT_COMBINATION_RULES', () => {
  const RULES = ELEMENT_COMBINATION_RULES as Record<string, Record<string, string>>

  it('maps fire + water to arcane', () => {
    expect(RULES.fire!.water).toBe('arcane')
  })

  it('maps fire + earth to fire', () => {
    expect(RULES.fire!.earth).toBe('fire')
  })

  it('maps light + dark to arcane', () => {
    expect(RULES.light!.dark).toBe('arcane')
  })

  it('maps lightning + water to lightning', () => {
    expect(RULES.lightning!.water).toBe('lightning')
  })

  it('maps wind + fire to fire', () => {
    expect(RULES.wind!.fire).toBe('fire')
  })

  it('maps water + wind to ice', () => {
    expect(RULES.water!.wind).toBe('ice')
  })

  it('maps earth + wind to earth', () => {
    expect(RULES.earth!.wind).toBe('earth')
  })

  it('maps water + light to nature', () => {
    expect(RULES.water!.light).toBe('nature')
  })

  it('has rules for all element pairs', () => {
    const elements: ElementId[] = [
      'fire', 'water', 'wind', 'earth', 'light', 'dark',
      'lightning', 'ice', 'nature', 'arcane',
    ]
    for (const a of elements) {
      const row = RULES[a]
      expect(row).toBeDefined()
      for (const b of elements) {
        if (a !== b) {
          expect(row![b]).toBeDefined()
        }
      }
    }
  })
})

describe('getCombinedElement', () => {
  it('returns same element when both are identical', () => {
    expect(getCombinedElement('fire', 'fire')).toBe('fire')
    expect(getCombinedElement('water', 'water')).toBe('water')
  })

  it('returns arcane for fire+water', () => {
    expect(getCombinedElement('fire', 'water')).toBe('arcane')
    expect(getCombinedElement('water', 'fire')).toBe('arcane')
  })

  it('returns water for ice+fire', () => {
    expect(getCombinedElement('ice', 'fire')).toBe('water')
    expect(getCombinedElement('fire', 'ice')).toBe('water')
  })
})

describe('compileMultiElement', () => {
  it('combines fire and water elements into arcane', () => {
    const fireAst = makeAst('fire')
    const waterAst = makeAst('water')

    const result = compileMultiElement({
      primary: fireAst,
      secondary: waterAst,
      elementA: 'fire',
      elementB: 'water',
    })

    expect(result.valid).toBe(true)
    expect(result.element).toBe('arcane')
    expect(result.signature).toContain('multi')
    expect(result.signature).toContain('arcane')
  })

  it('returns invalid if primary is invalid', () => {
    const invalidAst: GlyphAST = {
      ...makeAst('fire'),
      primarySigil: null,
      ring: { ...makeRing(), found: false },
    }

    const result = compileMultiElement({
      primary: invalidAst,
      secondary: makeAst('water'),
      elementA: 'fire',
      elementB: 'water',
    })

    expect(result.valid).toBe(false)
  })
})
