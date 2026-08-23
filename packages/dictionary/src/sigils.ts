import type { SigilEntry } from '@glyph-weaver/core'

export const sigils: SigilEntry[] = [
  {
    id: 'fire',
    displayName: 'Fire',
    element: 'fire',
    allowedLayers: ['center', 'middle', 'outer'],
    recognitionRotationInvariant: false,
    semantic: {
      force: 0.12,
      focus: 0.04,
      spread: 0.02,
      range: 0.08,
      lifetimeBias: 0.08,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.5, y: 0.1 },
          { x: 0.5, y: 0.9 },
        ],
        [
          { x: 0.3, y: 0.35 },
          { x: 0.7, y: 0.35 },
        ],
      ],
    },
  },
  {
    id: 'water',
    displayName: 'Water',
    element: 'water',
    allowedLayers: ['center', 'middle', 'outer'],
    recognitionRotationInvariant: false,
    semantic: {
      force: 0.08,
      focus: 0.06,
      spread: 0.04,
      range: 0.1,
      lifetimeBias: 0.05,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.2, y: 0.5 },
          { x: 0.5, y: 0.8 },
          { x: 0.8, y: 0.5 },
          { x: 0.5, y: 0.2 },
          { x: 0.2, y: 0.5 },
        ],
      ],
    },
  },
  {
    id: 'wind-directs-air',
    displayName: 'Wind (Directs Air)',
    element: 'wind',
    allowedLayers: ['center', 'middle', 'outer'],
    recognitionRotationInvariant: false,
    semantic: {
      force: 0.1,
      focus: 0.02,
      spread: 0.08,
      range: 0.12,
      lifetimeBias: 0.03,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.4, y: 0.2 },
          { x: 0.6, y: 0.5 },
          { x: 0.4, y: 0.8 },
        ],
        [
          { x: 0.6, y: 0.2 },
          { x: 0.4, y: 0.5 },
          { x: 0.6, y: 0.8 },
        ],
      ],
    },
  },
  {
    id: 'earth',
    displayName: 'Earth',
    element: 'earth',
    allowedLayers: ['center', 'middle', 'outer'],
    recognitionRotationInvariant: false,
    semantic: {
      force: 0.15,
      focus: 0.12,
      spread: 0.0,
      range: 0.04,
      lifetimeBias: 0.1,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.25, y: 0.25 },
          { x: 0.75, y: 0.25 },
          { x: 0.75, y: 0.75 },
          { x: 0.25, y: 0.75 },
          { x: 0.25, y: 0.25 },
        ],
      ],
    },
  },
  {
    id: 'light',
    displayName: 'Light',
    element: 'light',
    allowedLayers: ['center', 'middle', 'outer'],
    recognitionRotationInvariant: false,
    semantic: {
      force: 0.05,
      focus: 0.15,
      spread: -0.02,
      range: 0.2,
      lifetimeBias: 0.06,
    },
    strokeTemplate: {
      sourceAspectRatio: 1,
      strokes: [
        [
          { x: 0.5, y: 0.05 },
          { x: 0.5, y: 0.95 },
        ],
        [
          { x: 0.05, y: 0.5 },
          { x: 0.95, y: 0.5 },
        ],
        [
          { x: 0.2, y: 0.2 },
          { x: 0.8, y: 0.8 },
        ],
        [
          { x: 0.2, y: 0.8 },
          { x: 0.8, y: 0.2 },
        ],
      ],
    },
  },
]
