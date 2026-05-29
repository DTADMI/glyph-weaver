import type { GlyphAST, RecognizedSigil, RecognizedSign, RingCandidate } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'

export interface QualityResult {
  quality: number
  neatness: number
}

export function computeQuality(
  ring: RingCandidate,
  sigil: RecognizedSigil | null,
  signs: RecognizedSign[],
  ast: GlyphAST,
): QualityResult {
  const ringNeatness = ring.found ? ring.neatness : 0
  const sigilNeatness = sigil ? sigil.neatness : 0
  const signNeatness =
    signs.length > 0
      ? signs.reduce((sum, s) => sum + s.neatness, 0) / signs.length
      : 0

  const overallNeatness =
    ringNeatness * 0.35 +
    sigilNeatness * 0.40 +
    signNeatness * 0.25

  const globalNeatness = ast.globalMetrics.neatness
  const stability = ast.globalMetrics.radialSymmetry

  const quality = clamp(
    overallNeatness * 0.5 + globalNeatness * 0.3 + stability * 0.2,
    0,
    1,
  )

  return { quality, neatness: overallNeatness }
}

export function computeStability(quality: number, instability: number): number {
  return clamp(quality * (1 - instability * 0.5), 0, 1)
}

export function computeDuration(
  quality: number,
  neatness: number,
  lifetimeBias: number,
): number {
  const baseDuration = lifetimeBias * DEFAULT_CONFIG.renderer.defaultDuration
  const qualityFactor = quality * 0.6 + neatness * 0.4
  const duration = baseDuration * (0.5 + qualityFactor * 0.5)

  return clamp(duration, DEFAULT_CONFIG.renderer.minDuration, DEFAULT_CONFIG.renderer.maxDuration)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
