import type {
  Point,
  LayerLabel,
  RadialFacing,
  RecognitionStatus,
  DirectionMode,
  ManifestationId,
  ElementId,
} from './primitives.js'

export interface RingCandidate {
  found: boolean
  center: Point | null
  radius: number
  complete: boolean
  activationEvent: boolean
  completeness: number
  strokeIds: string[]
  gap: number
  gapArcLength: number
  coverageRatio: number
  roundness: number
  lineSmoothness: number
  neatness: number
  overdrawAmount: number
  unsupportedMultipleRings: RingCandidate[]
  unsupportedNestedRings: RingCandidate[]
}

export interface SymbolCandidate {
  candidateId: string
  strokeIds: string[]
  rawStrokeCount: number
  cleanedStrokeCount: number
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  center: Point
  radiusNorm: number
  angleDeg: number
  layer: LayerLabel
  nearBoundary: boolean
  sizeNorm: number
  lengthNorm: number
  orientationDeg: number
  directedOrientationDeg: number
  radialFacing: RadialFacing
  closedness: number
  overdrawAmount: number
  neatness: number
}

export interface RecognizedSigil {
  candidateId: string
  strokeIds: string[]
  id: string
  kind: 'sigil'
  recognized: boolean
  confidence: number
  recognitionStatus: RecognitionStatus
  element: ElementId
  layer: LayerLabel
  radiusNorm: number
  angleDeg: number
  sizeNorm: number
  lengthNorm: number
  neatness: number
  shape: SymbolShape
  semantic: SigilSemantic
}

export interface RecognizedSign {
  candidateId: string
  strokeIds: string[]
  id: string
  kind: 'sign'
  recognized: boolean
  confidence: number
  recognitionStatus: RecognitionStatus
  layer: LayerLabel
  radiusNorm: number
  angleDeg: number
  sizeNorm: number
  lengthNorm: number
  neatness: number
  shape: SymbolShape
  semantic: SignSemantic
}

export interface UnknownSymbol {
  candidateId: string
  strokeIds: string[]
  layer: LayerLabel
  radiusNorm: number
  angleDeg: number
  sizeNorm: number
  neatness: number
  bestGuess: {
    id: string
    confidence: number
  } | null
}

export interface SymbolShape {
  elongation: number
  dominantAxisStrength: number
  strokeCount: number
  closedness: number
}

export interface SigilSemantic {
  force: number
  focus: number
  spread: number
  range: number
  lifetimeBias: number
}

export interface SignSemantic {
  manifestation: ManifestationId
  directionMode: DirectionMode
  force: number
  focus: number
  spread: number
  range: number
  lifetimeBias: number
}

export interface GlobalMetrics {
  neatness: number
  radialSymmetry: number
  instability: number
}

export type ParserWarning =
  | 'no_ring_detected'
  | 'ring_incomplete'
  | 'unsupported_multiple_rings'
  | 'unsupported_nested_ring'
  | 'unsupported_multiple_sigils'
  | 'missing_primary_sigil'
  | 'center_unknown_contamination'
  | 'symbol_near_layer_boundary'
  | 'symbol_contaminated'
  | 'symbol_ambiguous'
  | 'symbol_messy'

export interface GlyphAST {
  type: 'GlyphAST'
  version: string
  ring: RingCandidate
  candidates: SymbolCandidate[]
  primarySigil: RecognizedSigil | null
  unsupportedMultipleSigils: RecognizedSigil[]
  signs: RecognizedSign[]
  unknowns: UnknownSymbol[]
  globalMetrics: GlobalMetrics
  warnings: ParserWarning[]
}
