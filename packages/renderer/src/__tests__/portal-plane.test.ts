import { describe, it, expect } from 'vitest'
import { projectPortal, portalOutDirection } from '../webgl/portal-plane.js'
import type { RingCandidate, Direction3D } from '@glyph-weaver/core'

function createMockRing(overrides: Partial<RingCandidate> = {}): RingCandidate {
  return {
    found: true,
    center: { x: 100, y: 100 },
    radius: 80,
    complete: true,
    activationEvent: true,
    completeness: 1.0,
    strokeIds: ['s1'],
    gap: 0,
    gapArcLength: 0,
    coverageRatio: 1.0,
    roundness: 0.9,
    lineSmoothness: 0.85,
    neatness: 0.8,
    overdrawAmount: 0,
    unsupportedMultipleRings: [],
    unsupportedNestedRings: [],
    ...overrides,
  }
}

function createMockDirection(overrides: Partial<Direction3D> = {}): Direction3D {
  return {
    x: 0,
    y: -1,
    z: 0,
    xTiltDeg: 0,
    yTiltDeg: 0,
    tiltFromZDeg: 0,
    ...overrides,
  }
}

describe('projectPortal', () => {
  it('should project a ring without direction as a circle', () => {
    const ring = createMockRing()
    const result = projectPortal(ring)
    expect(result.centerX).toBe(100)
    expect(result.centerY).toBe(100)
    expect(result.radiusX).toBe(80)
    expect(result.radiusY).toBe(80)
    expect(result.rotationDeg).toBe(0)
    expect(result.tiltDeg).toBe(0)
  })

  it('should offset center by provided coordinates', () => {
    const ring = createMockRing()
    const result = projectPortal(ring, undefined, 200, 300)
    expect(result.centerX).toBe(300)
    expect(result.centerY).toBe(400)
  })

  it('should squash Y radius when direction has tilt', () => {
    const ring = createMockRing()
    const direction = createMockDirection({ tiltFromZDeg: 60 })
    const result = projectPortal(ring, direction)
    expect(result.radiusY).toBeCloseTo(40)
    expect(result.radiusX).toBe(80)
    expect(result.radiusY).toBeLessThan(result.radiusX)
  })

  it('should set rotation based on direction angle', () => {
    const ring = createMockRing()
    const direction = createMockDirection({ x: 1, y: 0 })
    const result = projectPortal(ring, direction)
    expect(result.rotationDeg).toBeCloseTo(0)
  })

  it('should set 90-degree rotation for upward direction', () => {
    const ring = createMockRing()
    const direction = createMockDirection({ x: 0, y: -1 })
    const result = projectPortal(ring, direction)
    expect(result.rotationDeg).toBeCloseTo(-90)
  })

  it('should handle missing center gracefully', () => {
    const ring = createMockRing({ center: null })
    const result = projectPortal(ring)
    expect(result.centerX).toBe(0)
    expect(result.centerY).toBe(0)
  })

  it('should not let radiusY go below 10% of original', () => {
    const ring = createMockRing()
    const direction = createMockDirection({ tiltFromZDeg: 89 })
    const result = projectPortal(ring, direction)
    expect(result.radiusY).toBeGreaterThanOrEqual(8)
  })
})

describe('portalOutDirection', () => {
  it('should normalize a direction vector to unit length', () => {
    const direction = createMockDirection({ x: 3, y: 4 })
    const result = portalOutDirection(direction)
    expect(result.x).toBeCloseTo(0.6)
    expect(result.y).toBeCloseTo(0.8)
  })

  it('should default to upward vector for zero direction', () => {
    const direction = createMockDirection({ x: 0, y: 0 })
    const result = portalOutDirection(direction)
    expect(result.x).toBe(0)
    expect(result.y).toBe(-1)
  })

  it('should handle negative direction components', () => {
    const direction = createMockDirection({ x: -1, y: 0 })
    const result = portalOutDirection(direction)
    expect(result.x).toBe(-1)
    expect(result.y).toBe(0)
  })
})
