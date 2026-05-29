import { z } from 'zod'
import { ElementIdSchema, ManifestationIdSchema, DirectionModeSchema, LayerLabelSchema } from './primitives.js'

export const StrokeTemplatePointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const StrokeTemplateSchema = z.object({
  sourceAspectRatio: z.number(),
  strokes: z.array(z.array(StrokeTemplatePointSchema)),
})

export const SigilEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  element: ElementIdSchema,
  allowedLayers: z.array(LayerLabelSchema),
  strokeTemplate: StrokeTemplateSchema,
  recognitionRotationInvariant: z.boolean(),
  semantic: z.object({
    force: z.number(),
    focus: z.number(),
    spread: z.number(),
    range: z.number(),
    lifetimeBias: z.number(),
  }),
})

export const SignEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  allowedLayers: z.array(LayerLabelSchema),
  sourceNotes: z.string().optional(),
  semantic: z.object({
    manifestation: ManifestationIdSchema,
    directionMode: DirectionModeSchema,
    force: z.number(),
    focus: z.number(),
    spread: z.number(),
    range: z.number(),
    lifetimeBias: z.number(),
  }),
  strokeTemplate: StrokeTemplateSchema,
})

export const SampleSpellEntrySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  element: ElementIdSchema,
  manifestations: z.array(ManifestationIdSchema),
  strokes: z.array(z.array(StrokeTemplatePointSchema)),
})

export const DictionarySchema = z.object({
  sigils: z.array(SigilEntrySchema),
  signs: z.array(SignEntrySchema),
  sampleSpells: z.array(SampleSpellEntrySchema),
})
