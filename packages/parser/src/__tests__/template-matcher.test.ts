import { describe, it, expect } from 'vitest'
import { templateMatch, rotationInvariantMatch, computeStructuralScore, computeCompositionalScore } from '../template-matcher.js'
import type { Point, StrokeTemplate, SymbolCandidate, RecognitionConfig, SigilEntry } from '@glyph-weaver/core'

const testConfig: RecognitionConfig = {
  minConfidence: 0.65,
  rotationResolution: 36,
  rasterGridSize: 32,
  maskRadius: 2,
  inkOverlapThreshold: 0.2,
  structuralWeight: 0.25,
  compositionalWeight: 0.15,
  positionWeight: 0.3,
  sizeWeight: 0.1,
}

function templateFromPoints(strokes: Point[][]): StrokeTemplate {
  return {
    sourceAspectRatio: 1,
    strokes: strokes.map((s) =>
      s.map((p) => ({ x: (p.x + 1) / 2, y: (p.y + 1) / 2 })),
    ),
  }
}

function makeVerticalLine(): Point[][] {
  return [[{ x: 0, y: -0.8 }, { x: 0, y: 0.8 }]]
}

function makeHorizontalLine(): Point[][] {
  return [[{ x: -0.8, y: 0 }, { x: 0.8, y: 0 }]]
}

function makeCross(): Point[][] {
  return [
    [{ x: 0, y: -0.8 }, { x: 0, y: 0.8 }],
    [{ x: -0.8, y: 0 }, { x: 0.8, y: 0 }],
  ]
}

function makeCandidate(strokes: Point[][]): SymbolCandidate {
  return {
    candidateId: 'test-cand',
    strokeIds: ['s1'],
    rawStrokeCount: strokes.length,
    cleanedStrokeCount: strokes.length,
    bounds: { minX: -1, minY: -1, maxX: 1, maxY: 1 },
    center: { x: 0, y: 0 },
    radiusNorm: 0.5,
    angleDeg: 0,
    layer: 'center',
    nearBoundary: false,
    sizeNorm: 0.3,
    lengthNorm: 0.4,
    orientationDeg: 0,
    directedOrientationDeg: 0,
    radialFacing: 'unclear',
    closedness: 0,
    overdrawAmount: 0,
    neatness: 0.8,
  }
}

describe('templateMatch', () => {
  it('returns high score for identical shapes', () => {
    const points = makeVerticalLine()
    const template = templateFromPoints(points)
    const score = templateMatch(points, template, 32, 2)
    expect(score).toBeGreaterThan(0.7)
  })

  it('returns low score for very different shapes', () => {
    const points = makeVerticalLine()
    const template = templateFromPoints(makeHorizontalLine())
    const score = templateMatch(points, template, 32, 2)
    expect(score).toBeLessThan(0.5)
  })

  it('returns some score for slightly offset shapes', () => {
    const points = makeVerticalLine()
    const offset: Point[][] = [[{ x: 0.02, y: -0.8 }, { x: 0.02, y: 0.8 }]]
    const template = templateFromPoints(points)
    const score = templateMatch(offset, template, 64, 3)
    expect(score).toBeGreaterThan(0.3)
  })

  it('matches cross against cross template', () => {
    const points = makeCross()
    const template = templateFromPoints(points)
    const score = templateMatch(points, template, 32, 2)
    expect(score).toBeGreaterThan(0.5)
  })
})

describe('rotationInvariantMatch', () => {
  it('finds rotated vertical line matching vertical template', () => {
    const points = makeVerticalLine()
    const template = templateFromPoints(points)
    const entry: SigilEntry = {
      id: 'test',
      displayName: 'Test',
      element: 'fire',
      allowedLayers: ['center'],
      recognitionRotationInvariant: true,
      strokeTemplate: template,
      semantic: { force: 0.1, focus: 0.1, spread: 0.1, range: 0.1, lifetimeBias: 0.1 },
    }
    const score = rotationInvariantMatch(points, entry, testConfig)
    expect(score).toBeGreaterThan(0.5)
  })

  it('finds rotated cross matching cross template', () => {
    const rotatedCross: Point[][] = makeCross().map((stroke) =>
      stroke.map((p) => {
        const angle = Math.PI / 4
        return {
          x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
          y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
        }
      }),
    )
    const template = templateFromPoints(makeCross())
    const entry: SigilEntry = {
      id: 'test',
      displayName: 'Test',
      element: 'fire',
      allowedLayers: ['center'],
      recognitionRotationInvariant: true,
      strokeTemplate: template,
      semantic: { force: 0.1, focus: 0.1, spread: 0.1, range: 0.1, lifetimeBias: 0.1 },
    }
    const score = rotationInvariantMatch(rotatedCross, entry, testConfig)
    expect(score).toBeGreaterThan(0.5)
  })
})

describe('computeStructuralScore', () => {
  it('returns high score for matching stroke count', () => {
    const candidate = makeCandidate(makeVerticalLine())
    const template = templateFromPoints(makeVerticalLine())
    const score = computeStructuralScore(candidate, template)
    expect(score).toBeGreaterThan(0.5)
  })

  it('returns lower score for different stroke count', () => {
    const candidate = makeCandidate(makeVerticalLine())
    const template = templateFromPoints(makeCross())
    const score = computeStructuralScore(candidate, template)
    expect(score).toBeLessThan(0.7)
  })
})

describe('computeCompositionalScore', () => {
  it('returns 0 for empty template', () => {
    const candidate = makeCandidate(makeVerticalLine())
    const template: StrokeTemplate = { sourceAspectRatio: 1, strokes: [] }
    const score = computeCompositionalScore(candidate, template)
    expect(score).toBe(0)
  })

  it('returns positive score for matching composition', () => {
    const candidate = makeCandidate(makeVerticalLine())
    const template = templateFromPoints(makeVerticalLine())
    const score = computeCompositionalScore(candidate, template)
    expect(score).toBeGreaterThan(0)
  })
})
