import { describe, it, expect } from 'vitest'
import { detectRing, detectCompleteness, computeRingQuality } from '../ring-detector.js'
import type { CleanedStroke } from '../stroke-capture.js'
import type { Point } from '@glyph-weaver/core'

function makeCirclePoints(center: Point, radius: number, count: number, noise = 0): Point[] {
  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI
    const nx = noise * (Math.random() - 0.5) * 2
    const ny = noise * (Math.random() - 0.5) * 2
    points.push({
      x: center.x + Math.cos(angle) * radius + nx,
      y: center.y + Math.sin(angle) * radius + ny,
    })
  }
  return points
}

function makeEllipsePoints(center: Point, rx: number, ry: number, count: number): Point[] {
  const points: Point[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI
    points.push({
      x: center.x + Math.cos(angle) * rx,
      y: center.y + Math.sin(angle) * ry,
    })
  }
  return points
}

function makeCleanedStroke(points: Point[], id: string): CleanedStroke {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let sumX = 0, sumY = 0
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
    sumX += p.x
    sumY += p.y
  }
  return {
    id,
    points,
    rawPoints: points,
    center: { x: sumX / points.length, y: sumY / points.length },
    bounds: {
      minX: minX === Infinity ? 0 : minX,
      minY: minY === Infinity ? 0 : minY,
      maxX: maxX === -Infinity ? 0 : maxX,
      maxY: maxY === -Infinity ? 0 : maxY,
      width: (maxX === -Infinity ? 0 : maxX) - (minX === Infinity ? 0 : minX),
      height: (maxY === -Infinity ? 0 : maxY) - (minY === Infinity ? 0 : minY),
    },
  }
}

describe('detectRing', () => {
  it('detects a clean circle', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 64)
    const stroke = makeCleanedStroke(points, 's1')
    const result = detectRing([stroke])
    expect(result.found).toBe(true)
    expect(result.center).not.toBeNull()
    if (result.center) {
      expect(result.center.x).toBeCloseTo(0, 0)
      expect(result.center.y).toBeCloseTo(0, 0)
    }
    expect(result.radius).toBeCloseTo(1, 1)
  })

  it('detects a circle offset from origin', () => {
    const points = makeCirclePoints({ x: 2, y: 3 }, 1.5, 64)
    const stroke = makeCleanedStroke(points, 's1')
    const result = detectRing([stroke])
    expect(result.found).toBe(true)
    if (result.center) {
      expect(result.center.x).toBeCloseTo(2, 0)
      expect(result.center.y).toBeCloseTo(3, 0)
    }
    expect(result.radius).toBeCloseTo(1.5, 1)
  })

  it('returns high roundness for clean circle', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 128)
    const stroke = makeCleanedStroke(points, 's1')
    const result = detectRing([stroke])
    expect(result.roundness).toBeGreaterThan(0.8)
  })

  it('marks ring as complete when fully drawn', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 128)
    const stroke = makeCleanedStroke(points, 's1')
    const result = detectRing([stroke])
    expect(result.complete).toBe(true)
    expect(result.completeness).toBeGreaterThan(0.95)
  })

  it('marks ring as incomplete when partially drawn', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 32)
    const partial = points.slice(0, 20)
    const stroke = makeCleanedStroke(partial, 's1')
    const result = detectRing([stroke])
    expect(result.complete).toBe(false)
  })

  it('returns not found for very few random points', () => {
    const points: Point[] = []
    for (let i = 0; i < 7; i++) {
      points.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      })
    }
    const stroke = makeCleanedStroke(points, 's1')
    const result = detectRing([stroke])
    expect(result.found).toBe(false)
  })

  it('handles empty input', () => {
    const result = detectRing([])
    expect(result.found).toBe(false)
    expect(result.center).toBeNull()
  })

  it('handles small ellipse reasonably', () => {
    const points = makeEllipsePoints({ x: 0, y: 0 }, 1, 0.8, 64)
    const stroke = makeCleanedStroke(points, 's1')
    const result = detectRing([stroke])
    expect(result.found).toBe(true)
    expect(result.radius).toBeGreaterThan(0.5)
  })

  it('assigns stroke IDs for ring strokes', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 64)
    const stroke = makeCleanedStroke(points, 'ring-1')
    const result = detectRing([stroke])
    expect(result.strokeIds).toContain('ring-1')
  })
})

describe('detectCompleteness', () => {
  it('returns full completeness for 360 degree coverage', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 64)
    const result = detectCompleteness(points, { x: 0, y: 0 })
    expect(result.completeness).toBeGreaterThan(0.9)
    expect(result.complete).toBe(true)
  })

  it('detects gaps in coverage', () => {
    const full = makeCirclePoints({ x: 0, y: 0 }, 1, 64)
    const half = full.slice(0, 32)
    const result = detectCompleteness(half, { x: 0, y: 0 })
    expect(result.completeness).toBeLessThan(0.6)
    expect(result.complete).toBe(false)
  })

  it('handles degenerate input', () => {
    const result = detectCompleteness([], { x: 0, y: 0 })
    expect(result.completeness).toBe(0)
    expect(result.complete).toBe(false)
  })
})

describe('computeRingQuality', () => {
  it('scores clean circle highly', () => {
    const points = makeCirclePoints({ x: 0, y: 0 }, 1, 128)
    const result = computeRingQuality({ center: { x: 0, y: 0 }, radius: 1, points })
    expect(result.roundness).toBeGreaterThan(0.7)
    expect(result.lineSmoothness).toBeGreaterThan(0.7)
    expect(result.neatness).toBeGreaterThan(0.7)
  })

  it('scores noisy circle lower', () => {
    const clean = makeCirclePoints({ x: 0, y: 0 }, 1, 128)
    const noisy = makeCirclePoints({ x: 0, y: 0 }, 1, 128, 0.3)
    const cleanResult = computeRingQuality({ center: { x: 0, y: 0 }, radius: 1, points: clean })
    const noisyResult = computeRingQuality({ center: { x: 0, y: 0 }, radius: 1, points: noisy })
    expect(cleanResult.neatness).toBeGreaterThan(noisyResult.neatness)
  })
})
