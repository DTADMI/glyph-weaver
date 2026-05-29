import { z } from 'zod'

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
  t: z.number().optional(),
  pressure: z.number().optional(),
})

export const BoundsSchema = z.object({
  minX: z.number(),
  minY: z.number(),
  maxX: z.number(),
  maxY: z.number(),
  width: z.number(),
  height: z.number(),
  centerX: z.number(),
  centerY: z.number(),
})

export const LayerLabelSchema = z.enum(['center', 'middle', 'outer', 'unknown'])

export const RadialFacingSchema = z.enum([
  'inward',
  'outward',
  'clockwise',
  'counterclockwise',
  'unclear',
])

export const RecognitionStatusSchema = z.enum([
  'valid',
  'ambiguous',
  'contaminated',
  'valid_messy',
  'unrecognized',
])

export const DirectionModeSchema = z.enum(['position', 'orientation', 'inward'])

export const ElementIdSchema = z.enum([
  'fire',
  'water',
  'wind',
  'earth',
  'light',
  'dark',
  'lightning',
  'ice',
  'nature',
  'arcane',
])

export const ManifestationIdSchema = z.enum([
  'aura',
  'column',
  'levitation',
  'convergence',
  'barrier',
  'projectile',
  'area',
  'shield',
])

export const CompilerWarningSchema = z.enum([
  'primary_sigil_confidence_low',
  'multiple_sigils_unsupported',
  'multiple_rings_unsupported',
  'nested_rings_unsupported',
  'unsupported_element',
  'no_valid_sigil',
  'ring_too_messy',
  'sign_confidence_low',
  'mixed_manifestations',
])
