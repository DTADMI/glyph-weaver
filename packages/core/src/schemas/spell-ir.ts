import { z } from 'zod'
import { ElementIdSchema, ManifestationIdSchema } from './primitives.js'

export const Direction3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  xTiltDeg: z.number(),
  yTiltDeg: z.number(),
  tiltFromZDeg: z.number(),
})

const ManifestationProfileBaseSchema = z.object({
  strength: z.number(),
})

export const AuraProfileSchema = ManifestationProfileBaseSchema.extend({
  type: z.literal('aura'),
})

export const ColumnProfileSchema = ManifestationProfileBaseSchema.extend({
  type: z.literal('column'),
})

export const LevitationProfileSchema = ManifestationProfileBaseSchema.extend({
  type: z.literal('levitation'),
})

export const ConvergenceProfileSchema = ManifestationProfileBaseSchema.extend({
  type: z.literal('convergence'),
  point: z.object({ x: z.number(), y: z.number() }),
  radius: z.number(),
  rigidity: z.number(),
})

export const BarrierProfileSchema = ManifestationProfileBaseSchema.extend({
  type: z.literal('barrier'),
})

export const ProjectileProfileSchema = ManifestationProfileBaseSchema.extend({
  type: z.literal('projectile'),
})

export const AnyManifestationProfileSchema = z.discriminatedUnion('type', [
  AuraProfileSchema,
  ColumnProfileSchema,
  LevitationProfileSchema,
  ConvergenceProfileSchema,
  BarrierProfileSchema,
  ProjectileProfileSchema,
])

export const SpellIRSchema = z.object({
  type: z.literal('SpellIR'),
  valid: z.boolean(),
  active: z.boolean(),
  prepared: z.boolean(),
  status: z.string(),
  activatedAt: z.number().nullable(),
  element: ElementIdSchema.nullable(),
  elementConfidence: z.number(),
  primarySizeNorm: z.number(),
  effectScale: z.number(),
  primaryManifestation: z.union([ManifestationIdSchema, z.literal('none')]),
  manifestations: z.record(z.string(), AnyManifestationProfileSchema),
  direction: Direction3DSchema,
  directionCoherence: z.number(),
  gravity: z.number(),
  force: z.number(),
  spread: z.number(),
  focus: z.number(),
  range: z.number(),
  duration: z.number(),
  stability: z.number(),
  quality: z.number(),
  neatness: z.number(),
  warnings: z.array(z.string()),
  signature: z.string(),
})
