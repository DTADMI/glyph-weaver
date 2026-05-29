import { z } from 'zod'
import {
  PointSchema,
  LayerLabelSchema,
  RecognitionStatusSchema,
  ElementIdSchema,
  ManifestationIdSchema,
  DirectionModeSchema,
} from './primitives.js'

const SymbolShapeSchema = z.object({
  elongation: z.number(),
  dominantAxisStrength: z.number(),
  strokeCount: z.number(),
  closedness: z.number(),
})

const SigilSemanticSchema = z.object({
  force: z.number(),
  focus: z.number(),
  spread: z.number(),
  range: z.number(),
  lifetimeBias: z.number(),
})

const SignSemanticSchema = z.object({
  manifestation: ManifestationIdSchema,
  directionMode: DirectionModeSchema,
  force: z.number(),
  focus: z.number(),
  spread: z.number(),
  range: z.number(),
  lifetimeBias: z.number(),
})

export const RecognizedSigilSchema = z.object({
  candidateId: z.string(),
  strokeIds: z.array(z.string()),
  id: z.string(),
  kind: z.literal('sigil'),
  recognized: z.boolean(),
  confidence: z.number(),
  recognitionStatus: RecognitionStatusSchema,
  element: ElementIdSchema,
  layer: LayerLabelSchema,
  radiusNorm: z.number(),
  angleDeg: z.number(),
  sizeNorm: z.number(),
  lengthNorm: z.number(),
  neatness: z.number(),
  shape: SymbolShapeSchema,
  semantic: SigilSemanticSchema,
})

export const RecognizedSignSchema = z.object({
  candidateId: z.string(),
  strokeIds: z.array(z.string()),
  id: z.string(),
  kind: z.literal('sign'),
  recognized: z.boolean(),
  confidence: z.number(),
  recognitionStatus: RecognitionStatusSchema,
  layer: LayerLabelSchema,
  radiusNorm: z.number(),
  angleDeg: z.number(),
  sizeNorm: z.number(),
  lengthNorm: z.number(),
  neatness: z.number(),
  shape: SymbolShapeSchema,
  semantic: SignSemanticSchema,
})

export const UnknownSymbolSchema = z.object({
  candidateId: z.string(),
  strokeIds: z.array(z.string()),
  layer: LayerLabelSchema,
  radiusNorm: z.number(),
  angleDeg: z.number(),
  sizeNorm: z.number(),
  neatness: z.number(),
  bestGuess: z
    .object({
      id: z.string(),
      confidence: z.number(),
    })
    .nullable(),
})

export const SymbolCandidateSchema = z.object({
  candidateId: z.string(),
  strokeIds: z.array(z.string()),
  rawStrokeCount: z.number(),
  cleanedStrokeCount: z.number(),
  bounds: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }),
  center: PointSchema,
  radiusNorm: z.number(),
  angleDeg: z.number(),
  layer: LayerLabelSchema,
  nearBoundary: z.boolean(),
  sizeNorm: z.number(),
  lengthNorm: z.number(),
  orientationDeg: z.number(),
  directedOrientationDeg: z.number(),
  radialFacing: z.enum(['inward', 'outward', 'clockwise', 'counterclockwise', 'unclear']),
  closedness: z.number(),
  overdrawAmount: z.number(),
  neatness: z.number(),
})

export const RingCandidateSchema: z.ZodType<import('../types/glyph-ast.js').RingCandidate> = z.object({
  found: z.boolean(),
  center: PointSchema.nullable(),
  radius: z.number(),
  complete: z.boolean(),
  activationEvent: z.boolean(),
  completeness: z.number(),
  strokeIds: z.array(z.string()),
  gap: z.number(),
  gapArcLength: z.number(),
  coverageRatio: z.number(),
  roundness: z.number(),
  lineSmoothness: z.number(),
  neatness: z.number(),
  overdrawAmount: z.number(),
  unsupportedMultipleRings: z.array(z.lazy(() => RingCandidateSchema)),
  unsupportedNestedRings: z.array(z.lazy(() => RingCandidateSchema)),
})

export const GlobalMetricsSchema = z.object({
  neatness: z.number(),
  radialSymmetry: z.number(),
  instability: z.number(),
})

export const ParserWarningSchema = z.enum([
  'no_ring_detected',
  'ring_incomplete',
  'unsupported_multiple_rings',
  'unsupported_nested_ring',
  'unsupported_multiple_sigils',
  'missing_primary_sigil',
  'center_unknown_contamination',
  'symbol_near_layer_boundary',
  'symbol_contaminated',
  'symbol_ambiguous',
  'symbol_messy',
])

export const GlyphASTSchema = z.object({
  type: z.literal('GlyphAST'),
  version: z.string(),
  ring: RingCandidateSchema,
  candidates: z.array(SymbolCandidateSchema),
  primarySigil: RecognizedSigilSchema.nullable(),
  unsupportedMultipleSigils: z.array(RecognizedSigilSchema),
  signs: z.array(RecognizedSignSchema),
  unknowns: z.array(UnknownSymbolSchema),
  globalMetrics: GlobalMetricsSchema,
  warnings: z.array(ParserWarningSchema),
})
