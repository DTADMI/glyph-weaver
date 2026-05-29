import type { RecognitionConfig, SymbolCandidate } from '@glyph-weaver/core'

export function computeConfidence(
  inkOverlapScore: number,
  structuralScore: number,
  compositionalScore: number,
  positionScore: number,
  sizeScore: number,
  config: RecognitionConfig,
): number {
  const weights = {
    ink: 1 - config.structuralWeight - config.compositionalWeight - config.positionWeight - config.sizeWeight,
    structural: config.structuralWeight,
    compositional: config.compositionalWeight,
    position: config.positionWeight,
    size: config.sizeWeight,
  }

  return (
    weights.ink * inkOverlapScore +
    weights.structural * structuralScore +
    weights.compositional * compositionalScore +
    weights.position * positionScore +
    weights.size * sizeScore
  )
}

export interface MatchResult {
  id: string
  confidence: number
}

export function detectAmbiguity(matches: MatchResult[], threshold: number): boolean {
  if (matches.length < 2) return false

  const sorted = [...matches].sort((a, b) => b.confidence - a.confidence)
  const top = sorted[0]!
  const runnerUp = sorted[1]!

  return top.confidence - runnerUp.confidence < threshold
}

export function detectContamination(
  candidate: SymbolCandidate,
  nonCandidateStrokeIds: string[],
  allStrokes: { id: string }[],
  distanceThreshold: number,
): boolean {
  if (nonCandidateStrokeIds.length === 0) return false

  let nearbyCount = 0

  for (let i = 0; i < allStrokes.length; i++) {
    if (!nonCandidateStrokeIds.includes(allStrokes[i]!.id)) continue

    const cx = candidate.center.x
    const cy = candidate.center.y
    const halfW = (candidate.bounds.maxX - candidate.bounds.minX) / 2 + distanceThreshold
    const halfH = (candidate.bounds.maxY - candidate.bounds.minY) / 2 + distanceThreshold

    const dx = cx - cx
    const dy = cy - cy
    if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {
      nearbyCount++
    }
  }

  return nearbyCount > 0
}

export function computePositionScore(
  layer: string,
  allowedLayers: string[],
): number {
  if (allowedLayers.length === 0) return 0.5
  if (allowedLayers.includes(layer)) return 1.0
  return 0.3
}

export function computeSizeScore(
  sizeNorm: number,
  expectedMin: number,
  expectedMax: number,
): number {
  if (sizeNorm >= expectedMin && sizeNorm <= expectedMax) return 1.0
  if (sizeNorm < expectedMin) return sizeNorm / expectedMin
  return expectedMax / sizeNorm
}
