import { describe, it, expect } from 'vitest'
import { exportToSVG, exportGlyphToSVG } from '../export/svg-export.js'
import type { Stroke, GlyphAST } from '@glyph-weaver/core'

describe('exportToSVG', () => {
  it('should generate valid SVG with stroke paths', () => {
    const strokes: Stroke[] = [
      {
        id: 's1',
        points: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        color: '#ff0000',
        width: 2,
        timestamp: Date.now(),
      },
    ]

    const svg = exportToSVG(strokes, 200, 100)
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('width="200"')
    expect(svg).toContain('height="100"')
    expect(svg).toContain('viewBox="0 0 200 100"')
    expect(svg).toContain('<path')
    expect(svg).toContain('stroke="#ff0000"')
    expect(svg).toContain('fill="none"')
  })

  it('should include ring highlight when requested', () => {
    const strokes: Stroke[] = [
      {
        id: 's1',
        points: [{ x: 50, y: 50 }],
        color: '#000',
        width: 1,
        timestamp: 0,
      },
    ]
    const svg = exportToSVG(strokes, 200, 100, true)
    expect(svg).toContain('<circle')
    expect(svg).toContain('stroke-dasharray="8,4"')
  })

  it('should handle empty strokes', () => {
    const svg = exportToSVG([], 100, 100)
    expect(svg).toContain('<svg')
    expect(svg).toContain('width="100"')
  })

  it('should escape XML special characters in stroke color', () => {
    const strokes: Stroke[] = [
      {
        id: 's1',
        points: [{ x: 0, y: 0 }],
        color: '#ff"000',
        width: 1,
        timestamp: 0,
      },
    ]
    const svg = exportToSVG(strokes, 100, 100)
    expect(svg).toContain('&quot;')
  })
})

describe('exportGlyphToSVG', () => {
  const baseGlyphAST: GlyphAST = {
    type: 'GlyphAST',
    version: '0.1.0',
    ring: {
      found: true,
      center: { x: 0, y: 0 },
      radius: 100,
      complete: true,
      activationEvent: false,
      completeness: 1,
      strokeIds: [],
      gap: 0,
      gapArcLength: 0,
      coverageRatio: 1,
      roundness: 1,
      lineSmoothness: 1,
      neatness: 1,
      overdrawAmount: 0,
      unsupportedMultipleRings: [],
      unsupportedNestedRings: [],
    },
    candidates: [],
    primarySigil: null,
    unsupportedMultipleSigils: [],
    signs: [],
    unknowns: [],
    globalMetrics: { neatness: 0.8, radialSymmetry: 0.7, instability: 0.2 },
    warnings: [],
  }

  it('should generate annotated SVG with ring', () => {
    const svg = exportGlyphToSVG(baseGlyphAST, 800, 800)
    expect(svg).toContain('<svg')
    expect(svg).toContain('class="ring-complete"')
  })

  it('should include sigil annotations when primarySigil present', () => {
    const ast: GlyphAST = {
      ...baseGlyphAST,
      primarySigil: {
        candidateId: 'c1',
        strokeIds: ['s1'],
        id: 'fire-sigil',
        kind: 'sigil',
        recognized: true,
        confidence: 0.85,
        recognitionStatus: 'valid',
        element: 'fire',
        layer: 'center',
        radiusNorm: 0.3,
        angleDeg: 45,
        sizeNorm: 0.5,
        lengthNorm: 0.6,
        neatness: 0.9,
        shape: {
          elongation: 0.3,
          dominantAxisStrength: 0.7,
          strokeCount: 3,
          closedness: 0.4,
        },
        semantic: {
          force: 0.7,
          focus: 0.5,
          spread: 0.3,
          range: 0.6,
          lifetimeBias: 0.5,
        },
      },
    }
    const svg = exportGlyphToSVG(ast)
    expect(svg).toContain('sigil: fire-sigil')
    expect(svg).toContain('class="sigil-highlight"')
  })

  it('should include sign annotations', () => {
    const ast: GlyphAST = {
      ...baseGlyphAST,
      signs: [
        {
          candidateId: 'c2',
          strokeIds: ['s2'],
          id: 'barrier-sign',
          kind: 'sign',
          recognized: true,
          confidence: 0.75,
          recognitionStatus: 'valid',
          layer: 'middle',
          radiusNorm: 0.5,
          angleDeg: 90,
          sizeNorm: 0.4,
          lengthNorm: 0.5,
          neatness: 0.8,
          shape: {
            elongation: 0.2,
            dominantAxisStrength: 0.8,
            strokeCount: 2,
            closedness: 0.6,
          },
          semantic: {
            manifestation: 'barrier',
            directionMode: 'inward',
            force: 0.5,
            focus: 0.6,
            spread: 0.4,
            range: 0.5,
            lifetimeBias: 0.5,
          },
        },
      ],
    }
    const svg = exportGlyphToSVG(ast)
    expect(svg).toContain('sign: barrier-sign')
    expect(svg).toContain('class="sign-marker"')
  })
})
