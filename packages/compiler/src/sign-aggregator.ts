import type { GlyphAST, RecognizedSign, ManifestationId, AnyManifestationProfile } from '@glyph-weaver/core'

export interface SignAggregationResult {
  manifestations: Record<string, AnyManifestationProfile>
  primaryManifestation: ManifestationId | 'none'
  combinedStrength: number
  recognizedCount: number
}

const VALID_RECOGNITION_STATUSES = new Set(['valid', 'valid_messy'])

export function aggregateSigns(ast: GlyphAST): SignAggregationResult {
  const recognized = ast.signs.filter((s) => s.recognized && VALID_RECOGNITION_STATUSES.has(s.recognitionStatus))

  if (recognized.length === 0) {
    return {
      manifestations: {},
      primaryManifestation: 'none',
      combinedStrength: 0,
      recognizedCount: 0,
    }
  }

  const byManifestation = new Map<ManifestationId, RecognizedSign[]>()

  for (const sign of recognized) {
    const m = sign.semantic.manifestation
    const list = byManifestation.get(m)
    if (list) {
      list.push(sign)
    } else {
      byManifestation.set(m, [sign])
    }
  }

  const manifestations: Record<string, AnyManifestationProfile> = {}
  let maxStrength = 0
  let primaryManifestation: ManifestationId | 'none' = 'none'

  for (const [manifestation, signs] of byManifestation) {
    const totalConfidence = signs.reduce((sum, s) => sum + s.confidence, 0)
    const avgNeatness = signs.reduce((sum, s) => sum + s.neatness, 0) / signs.length
    const strength = clamp((totalConfidence / signs.length) * 0.7 + avgNeatness * 0.3, 0, 1)

    const profile = buildManifestationProfile(manifestation, strength, signs)

    manifestations[manifestation] = profile

    if (strength > maxStrength) {
      maxStrength = strength
      primaryManifestation = manifestation
    }
  }

  return {
    manifestations,
    primaryManifestation,
    combinedStrength: maxStrength,
    recognizedCount: recognized.length,
  }
}

function buildManifestationProfile(
  manifestation: ManifestationId,
  strength: number,
  _signs: RecognizedSign[],
): AnyManifestationProfile {
  switch (manifestation) {
    case 'aura':
      return { type: 'aura', strength }
    case 'column':
      return { type: 'column', strength }
    case 'levitation':
      return { type: 'levitation', strength }
    case 'convergence':
      return {
        type: 'convergence',
        strength,
        point: { x: 0, y: 0 },
        radius: 0.5,
        rigidity: 0.5,
      }
    case 'barrier':
      return { type: 'barrier', strength }
    case 'projectile':
      return { type: 'projectile', strength }
    case 'area':
      return { type: 'barrier', strength }
    case 'shield':
      return { type: 'barrier', strength }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
