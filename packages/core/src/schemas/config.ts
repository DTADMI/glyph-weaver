import { z } from 'zod'

export const RecognitionConfigSchema = z.object({
  minConfidence: z.number(),
  rotationResolution: z.number(),
  rasterGridSize: z.number(),
  maskRadius: z.number(),
  inkOverlapThreshold: z.number(),
  structuralWeight: z.number(),
  compositionalWeight: z.number(),
  positionWeight: z.number(),
  sizeWeight: z.number(),
})

export const RendererConfigSchema = z.object({
  particleCap: z.number(),
  portalOpacity: z.number(),
  effectOpacity: z.number(),
  defaultEffectScale: z.number(),
  minEffectScale: z.number(),
  maxEffectScale: z.number(),
  defaultDuration: z.number(),
  minDuration: z.number(),
  maxDuration: z.number(),
  fps: z.number(),
})

export const CompilerConfigSchema = z.object({
  maxForce: z.number(),
  maxSpread: z.number(),
  maxFocus: z.number(),
  maxRange: z.number(),
  defaultGravity: z.number(),
  maxTiltDeg: z.number(),
})

export const AppConfigSchema = z.object({
  appVersion: z.string(),
  appName: z.string(),
  recognition: RecognitionConfigSchema,
  renderer: RendererConfigSchema,
  compiler: CompilerConfigSchema,
})
