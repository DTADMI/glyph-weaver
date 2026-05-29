import { describe, it, expect } from 'vitest'
import { screenDirection, applyTilt, project3Dto2D } from '../direction.js'
import type { Direction3D } from '@glyph-weaver/core'

describe('screenDirection', () => {
  it('should normalize a non-zero direction vector', () => {
    const dir: Direction3D = { x: 3, y: 4, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 }
    const result = screenDirection(dir)
    expect(result.x).toBeCloseTo(0.6)
    expect(result.y).toBeCloseTo(0.8)
    expect(result.length).toBeCloseTo(5)
  })

  it('should return zero vector for zero-length direction', () => {
    const dir: Direction3D = { x: 0, y: 0, z: 1, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 45 }
    const result = screenDirection(dir)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
    expect(result.length).toBe(0)
  })

  it('should handle negative values', () => {
    const dir: Direction3D = { x: -1, y: -1, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 }
    const result = screenDirection(dir)
    const expected = -1 / Math.SQRT2
    expect(result.x).toBeCloseTo(expected)
    expect(result.y).toBeCloseTo(expected)
  })
})

describe('applyTilt', () => {
  it('should return unchanged values for zero tilt', () => {
    const result = applyTilt(10, 20, 0)
    expect(result.x).toBe(10)
    expect(result.y).toBe(20)
  })

  it('should rotate values with 90-degree tilt', () => {
    const result = applyTilt(1, 0, 90)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(1)
  })

  it('should handle 180-degree tilt (inversion)', () => {
    const result = applyTilt(1, 1, 180)
    expect(result.x).toBeCloseTo(-1)
    expect(result.y).toBeCloseTo(-1)
  })
})

describe('project3Dto2D', () => {
  const camera = { fov: 60, near: 0.1, far: 100 }

  it('should project a point at z=-1 to screen coordinates', () => {
    const result = project3Dto2D({ x: 0, y: 0, z: -1 }, camera, 800, 600)
    expect(result.x).toBeCloseTo(400, 0)
    expect(result.y).toBeCloseTo(300, 0)
  })

  it('should handle points with z near zero', () => {
    const result = project3Dto2D({ x: 0.5, y: 0.5, z: 0 }, camera, 800, 600)
    expect(result.x).toBeCloseTo(600, -1)
    expect(result.y).toBeCloseTo(150, -1)
  })

  it('should produce larger screen x for positive x input', () => {
    const r1 = project3Dto2D({ x: -1, y: 0, z: -2 }, camera, 800, 600)
    const r2 = project3Dto2D({ x: 1, y: 0, z: -2 }, camera, 800, 600)
    expect(r2.x).toBeGreaterThan(r1.x)
  })
})
