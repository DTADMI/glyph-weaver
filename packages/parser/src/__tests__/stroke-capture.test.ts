import { describe, it, expect } from 'vitest'
import { normalizeStroke, smoothStroke, simplifyStroke } from '../stroke-capture.js'
import type { Point } from '@glyph-weaver/core'

function makeLine(length: number, angle: number): Point[] {
  const points: Point[] = []
  for (let i = 0; i < length; i++) {
    points.push({
      x: Math.cos(angle) * i * 10,
      y: Math.sin(angle) * i * 10 + 5,
    })
  }
  return points
}

function makeSquare(): Point[] {
  return [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
    { x: 0, y: 0 },
  ]
}

describe('normalizeStroke', () => {
  it('returns empty array for empty input', () => {
    expect(normalizeStroke([])).toEqual([])
  })

  it('returns zero point for single point input', () => {
    expect(normalizeStroke([{ x: 10, y: 20 }])).toEqual([{ x: 0, y: 0 }])
  })

  it('centers points around origin', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ]
    const result = normalizeStroke(points)
    expect(result[0]!.x).toBeCloseTo(-0.5)
    expect(result[0]!.y).toBeCloseTo(-0.5)
    expect(result[1]!.x).toBeCloseTo(0.5)
    expect(result[1]!.y).toBeCloseTo(0.5)
  })

  it('scales to unit range', () => {
    const points = makeLine(10, 0)
    const result = normalizeStroke(points)
    for (const p of result) {
      expect(p.x).toBeGreaterThanOrEqual(-1)
      expect(p.x).toBeLessThanOrEqual(1)
      expect(p.y).toBeGreaterThanOrEqual(-1)
      expect(p.y).toBeLessThanOrEqual(1)
    }
  })

  it('removes duplicate consecutive points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 100 },
    ]
    const result = normalizeStroke(points)
    expect(result.length).toBe(2)
  })

  it('handles points with zero extent in one dimension', () => {
    const points = [
      { x: 5, y: 0 },
      { x: 5, y: 10 },
      { x: 5, y: 20 },
    ]
    const result = normalizeStroke(points)
    expect(result.length).toBe(3)
  })
})

describe('smoothStroke', () => {
  it('returns copy for fewer than 3 points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    const result = smoothStroke(points)
    expect(result).toEqual(points)
    expect(result).not.toBe(points)
  })

  it('applies moving average smoothing', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 10 },
    ]
    const result = smoothStroke(points)
    expect(result[1]!.y).toBeCloseTo((10 + 20 + 10) / 3)
  })

  it('preserves endpoints approximately', () => {
    const points = makeLine(20, 0)
    const result = smoothStroke(points)
    expect(result.length).toBe(points.length)
    expect(result[0]!.x).toBeGreaterThanOrEqual(points[0]!.x)
    expect(result[result.length - 1]!.x).toBeLessThanOrEqual(points[points.length - 1]!.x)
  })

  it('returns same length as input', () => {
    const points = makeLine(10, Math.PI / 4)
    const result = smoothStroke(points)
    expect(result.length).toBe(points.length)
  })
})

describe('simplifyStroke', () => {
  it('returns copy for fewer than 3 points', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    const result = simplifyStroke(points, 0.1)
    expect(result).toEqual(points)
    expect(result).not.toBe(points)
  })

  it('collapses straight line to endpoints', () => {
    const points = makeLine(20, 0)
    const result = simplifyStroke(points, 0.5)
    expect(result.length).toBeLessThan(points.length)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('preserves corners with high tolerance', () => {
    const points = makeSquare()
    const result = simplifyStroke(points, 1.0)
    expect(result.length).toBeGreaterThanOrEqual(4)
  })

  it('simplifies more with higher tolerance', () => {
    const points = makeSquare()
    const lowTol = simplifyStroke(points, 0.1)
    const highTol = simplifyStroke(points, 50.0)
    expect(highTol.length).toBeLessThanOrEqual(lowTol.length)
  })

  it('preserves first and last points', () => {
    const points = makeLine(30, Math.PI / 6)
    const result = simplifyStroke(points, 2.0)
    expect(result[0]!.x).toBeCloseTo(points[0]!.x)
    expect(result[0]!.y).toBeCloseTo(points[0]!.y)
    expect(result[result.length - 1]!.x).toBeCloseTo(points[points.length - 1]!.x)
    expect(result[result.length - 1]!.y).toBeCloseTo(points[points.length - 1]!.y)
  })
})
