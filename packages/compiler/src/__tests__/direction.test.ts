import { describe, it, expect } from 'vitest'
import { computeDirection } from '../direction-computer.js'
import type { RecognizedSign } from '@glyph-weaver/core'

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

function makeSign(overrides: Partial<RecognizedSign> = {}): RecognizedSign {
  return {
    candidateId: 'sign-1',
    strokeIds: ['stroke-1'],
    id: 'test-sign',
    kind: 'sign',
    recognized: true,
    confidence: 0.9,
    recognitionStatus: 'valid',
    layer: 'middle',
    radiusNorm: 0.3,
    angleDeg: 0,
    sizeNorm: 0.3,
    lengthNorm: 0.4,
    neatness: 0.85,
    shape: {
      elongation: 0.5,
      dominantAxisStrength: 0.7,
      strokeCount: 1,
      closedness: 0.3,
    },
    semantic: {
      manifestation: 'column',
      directionMode: 'position',
      force: 0.3,
      focus: 0.3,
      spread: 0.3,
      range: 0.3,
      lifetimeBias: 0.5,
    },
    ...overrides,
  }
}

describe('computeDirection', () => {
  it('returns default direction for empty signs', () => {
    const ring = makeRing()
    const result = computeDirection([], ring)

    expect(result.direction.x).toBe(0)
    expect(result.direction.y).toBe(0)
    expect(result.direction.z).toBe(1)
    expect(result.coherence).toBe(0)
  })

  it('computes position-based direction from sign angle', () => {
    const ring = makeRing()

    const signRight = makeSign({
      angleDeg: 0,
      semantic: { manifestation: 'column', directionMode: 'position', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([signRight], ring)

    expect(result.direction.x).toBeGreaterThan(0)
    expect(result.direction.y).toBeCloseTo(0, 1)
    expect(result.coherence).toBe(1)
  })

  it('computes orientation-based direction', () => {
    const ring = makeRing()

    const signUp = makeSign({
      angleDeg: 90,
      semantic: { manifestation: 'column', directionMode: 'orientation', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([signUp], ring)

    expect(result.direction.y).toBeGreaterThan(0)
    expect(result.coherence).toBe(1)
  })

  it('computes inward direction mode', () => {
    const ring = makeRing()

    const sign = makeSign({
      semantic: { manifestation: 'barrier', directionMode: 'inward', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([sign], ring)

    expect(result.direction.tiltFromZDeg).toBe(0)
    expect(result.coherence).toBe(1)
  })

  it('returns lower coherence for spread-out signs', () => {
    const ring = makeRing()

    const sign1 = makeSign({
      angleDeg: 0,
      semantic: { manifestation: 'column', directionMode: 'position', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })
    const sign2 = makeSign({
      candidateId: 'sign-2',
      id: 'sign-2',
      angleDeg: 180,
      semantic: { manifestation: 'column', directionMode: 'position', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([sign1, sign2], ring)

    expect(result.coherence).toBeLessThan(1)
    expect(result.coherence).toBeGreaterThanOrEqual(0)
  })

  it('normalizes direction vector', () => {
    const ring = makeRing()

    const sign = makeSign({
      angleDeg: 45,
      semantic: { manifestation: 'column', directionMode: 'position', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([sign], ring)
    const length = Math.sqrt(
      result.direction.x ** 2 + result.direction.y ** 2 + result.direction.z ** 2,
    )

    expect(length).toBeCloseTo(1, 5)
  })

  it('produces tilt values within valid range', () => {
    const ring = makeRing({ maxTiltDeg: 76 })

    const sign = makeSign({
      angleDeg: 45,
      semantic: { manifestation: 'column', directionMode: 'position', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([sign], ring)

    expect(result.direction.tiltFromZDeg).toBeGreaterThanOrEqual(0)
    expect(result.direction.xTiltDeg).toBeDefined()
    expect(result.direction.yTiltDeg).toBeDefined()
  })

  it('blends multiple direction modes', () => {
    const ring = makeRing()

    const posSign = makeSign({
      angleDeg: 0,
      semantic: { manifestation: 'column', directionMode: 'position', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })
    const orientSign = makeSign({
      candidateId: 'sign-2',
      id: 'sign-2',
      angleDeg: 90,
      semantic: { manifestation: 'projectile', directionMode: 'orientation', force: 0.3, focus: 0.3, spread: 0.3, range: 0.3, lifetimeBias: 0.5 },
    })

    const result = computeDirection([posSign, orientSign], ring)

    expect(result.direction.x).toBeGreaterThan(0)
    expect(result.direction.y).toBeGreaterThan(0)
    expect(result.coherence).toBe(1)
  })
})
