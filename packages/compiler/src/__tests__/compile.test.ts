import { describe, it, expect } from 'vitest'
import { compileSpell } from '../compile.js'
import type { GlyphAST } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'

function makeRing(overrides = {}) {
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
    ...overrides,
  }
}

function makeFireSigil(overrides = {}) {
  return {
    candidateId: 'sigil-1',
    strokeIds: ['stroke-1', 'stroke-2'],
    id: 'fire-sigil',
    kind: 'sigil' as const,
    recognized: true,
    confidence: 0.9,
    recognitionStatus: 'valid' as const,
    element: 'fire' as const,
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
      force: 0.8,
      focus: 0.6,
      spread: 0.5,
      range: 0.7,
      lifetimeBias: 0.8,
    },
    ...overrides,
  }
}

function makeColumnSign(overrides = {}) {
  return {
    candidateId: 'sign-1',
    strokeIds: ['stroke-3'],
    id: 'column-sign',
    kind: 'sign' as const,
    recognized: true,
    confidence: 0.85,
    recognitionStatus: 'valid' as const,
    layer: 'middle' as const,
    radiusNorm: 0.25,
    angleDeg: 90,
    sizeNorm: 0.3,
    lengthNorm: 0.4,
    neatness: 0.85,
    shape: {
      elongation: 0.6,
      dominantAxisStrength: 0.8,
      strokeCount: 1,
      closedness: 0.2,
    },
    semantic: {
      manifestation: 'column' as const,
      directionMode: 'position' as const,
      force: 0.3,
      focus: 0.4,
      spread: 0.2,
      range: 0.5,
      lifetimeBias: 0.6,
    },
    ...overrides,
  }
}

function makeAst(overrides: Partial<GlyphAST> = {}): GlyphAST {
  return {
    type: 'GlyphAST',
    version: '0.1.0',
    ring: makeRing(),
    candidates: [],
    primarySigil: makeFireSigil(),
    unsupportedMultipleSigils: [],
    signs: [makeColumnSign()],
    unknowns: [],
    globalMetrics: {
      neatness: 0.85,
      radialSymmetry: 0.8,
      instability: 0.1,
    },
    warnings: [],
    ...overrides,
  }
}

describe('compileSpell', () => {
  it('compiles a valid fire + column spell', () => {
    const ast = makeAst()
    const result = compileSpell(ast)

    expect(result.type).toBe('SpellIR')
    expect(result.valid).toBe(true)
    expect(result.element).toBe('fire')
    expect(result.elementConfidence).toBe(0.9)
    expect(result.primaryManifestation).toBe('column')
    expect(result.force).toBeGreaterThan(0)
    expect(result.force).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxForce)
    expect(result.spread).toBeGreaterThan(0)
    expect(result.spread).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxSpread)
    expect(result.focus).toBeGreaterThan(0)
    expect(result.focus).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxFocus)
    expect(result.range).toBeGreaterThan(0)
    expect(result.range).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxRange)
    expect(result.quality).toBeGreaterThan(0)
    expect(result.quality).toBeLessThanOrEqual(1)
    expect(result.neatness).toBeGreaterThan(0)
    expect(result.neatness).toBeLessThanOrEqual(1)
    expect(result.stability).toBeGreaterThan(0)
    expect(result.stability).toBeLessThanOrEqual(1)
    expect(result.duration).toBeGreaterThanOrEqual(DEFAULT_CONFIG.renderer.minDuration)
    expect(result.duration).toBeLessThanOrEqual(DEFAULT_CONFIG.renderer.maxDuration)
    expect(result.signature).toContain('fire')
    expect(result.signature).toContain('column')
  })

  it('returns invalid spell when no primary sigil', () => {
    const ast = makeAst({ primarySigil: null })
    const result = compileSpell(ast)

    expect(result.valid).toBe(false)
    expect(result.status).toBe('invalid')
    expect(result.element).toBeNull()
    expect(result.signature).toBe('invalid')
  })

  it('returns invalid spell when ring is not found', () => {
    const ast = makeAst({ ring: makeRing({ found: false }) })
    const result = compileSpell(ast)

    expect(result.valid).toBe(false)
    expect(result.status).toBe('invalid')
  })

  it('handles spell with no signs', () => {
    const ast = makeAst({ signs: [] })
    const result = compileSpell(ast)

    expect(result.valid).toBe(true)
    expect(result.primaryManifestation).toBe('none')
    expect(Object.keys(result.manifestations)).toHaveLength(0)
  })

  it('produces signature string with expected format', () => {
    const ast = makeAst()
    const result = compileSpell(ast)

    const parts = result.signature.split(':')
    expect(parts[0]).toBe('fire')
    expect(parts[1]).toBe('column')
    expect(typeof Number(parts[2])).toBe('number')
  })

  it('clamps parameters to valid range', () => {
    const ast = makeAst({
      primarySigil: makeFireSigil({
        semantic: { force: 2.0, focus: 2.0, spread: 2.0, range: 2.0, lifetimeBias: 0.8 },
      }),
    })
    const result = compileSpell(ast)

    expect(result.force).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxForce)
    expect(result.spread).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxSpread)
    expect(result.focus).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxFocus)
    expect(result.range).toBeLessThanOrEqual(DEFAULT_CONFIG.compiler.maxRange)
  })
})
