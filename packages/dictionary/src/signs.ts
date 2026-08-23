import type { SignEntry } from '@glyph-weaver/core'

export const signs: SignEntry[] = [
  {
    id: 'column',
    displayName: 'Column',
    allowedLayers: ['middle', 'outer'],
    sourceNotes:
      'Column causes the magic of its glyph to manifest in a column or beam above the glyph.',
    semantic: {
      manifestation: 'column',
      directionMode: 'orientation',
      force: 0.1,
      focus: 0.08,
      spread: -0.04,
      range: 0.12,
      lifetimeBias: 0.02,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.5, y: 0.05 },
          { x: 0.5, y: 0.95 },
        ],
      ],
    },
  },
  {
    id: 'levitation',
    displayName: 'Levitation',
    allowedLayers: ['middle', 'outer'],
    sourceNotes:
      'Levitation reduces gravity, causing the spell effect to float above the glyph. Balanced levitation signs can fully suspend the effect.',
    semantic: {
      manifestation: 'levitation',
      directionMode: 'position',
      force: -0.05,
      focus: 0.04,
      spread: 0.08,
      range: -0.04,
      lifetimeBias: 0.04,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.3, y: 0.7 },
          { x: 0.5, y: 0.3 },
          { x: 0.7, y: 0.7 },
        ],
      ],
    },
  },
  {
    id: 'convergence',
    displayName: 'Convergence',
    allowedLayers: ['middle', 'outer'],
    sourceNotes:
      'Convergence compresses the spell effect sideways around its current path, making the effect narrower and more focused.',
    semantic: {
      manifestation: 'convergence',
      directionMode: 'inward',
      force: 0.06,
      focus: 0.14,
      spread: -0.1,
      range: -0.02,
      lifetimeBias: 0.0,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.1, y: 0.5 },
          { x: 0.5, y: 0.8 },
          { x: 0.9, y: 0.5 },
        ],
        [
          { x: 0.1, y: 0.5 },
          { x: 0.5, y: 0.2 },
          { x: 0.9, y: 0.5 },
        ],
      ],
    },
  },
]
