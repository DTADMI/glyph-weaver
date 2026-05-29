import type {
  Stroke,
  GlyphAST,
  RingCandidate,
  SymbolCandidate,
  SigilEntry,
  SignEntry,
  RecognitionConfig,
} from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { DEFAULT_DICTIONARY } from '@glyph-weaver/dictionary'

import { normalizeStroke, smoothStroke, simplifyStroke, computeCenterAndBounds } from './stroke-capture.js'
import type { CleanedStroke } from './stroke-capture.js'
export type { CleanedStroke } from './stroke-capture.js'

import { connectedComponents, segmentStrokes } from './stroke-analysis.js'
import { detectRing, detectCompleteness, computeRingQuality, detectMultipleRings, detectActivation } from './ring-detector.js'
import { roundness, smoothness as ringSmoothness, computeNeatness } from './ring-metrics.js'
import { templateMatch, rotationInvariantMatch, computeStructuralScore, computeCompositionalScore } from './template-matcher.js'
import { detectLayer, computeRadiusNorm, computeAngleDeg, computeOrientationDeg } from './layer-detector.js'
import { computeConfidence, detectAmbiguity, detectContamination, computePositionScore, computeSizeScore } from './confidence-scorer.js'

import {
  buildGlyphAST,
  buildRingOutput,
  buildCandidateOutput,
  buildRecognitionOutput,
  buildUnknownOutput,
  computeGlobalMetrics,
  determineRadialFacing,
  computeClosedness,
} from './ast-builder.js'

export const PARSER_VERSION = '0.1.0'

export {
  normalizeStroke,
  smoothStroke,
  simplifyStroke,
  computeCenterAndBounds,

  connectedComponents,
  segmentStrokes,

  detectRing,
  detectCompleteness,
  computeRingQuality,
  detectMultipleRings,
  detectActivation,

  roundness,
  ringSmoothness,
  computeNeatness,

  templateMatch,
  rotationInvariantMatch,
  computeStructuralScore,
  computeCompositionalScore,

  detectLayer,
  computeRadiusNorm,
  computeAngleDeg,
  computeOrientationDeg,

  computeConfidence,
  detectAmbiguity,
  detectContamination,
  computePositionScore,
  computeSizeScore,

  buildGlyphAST,
  buildRingOutput,
  buildCandidateOutput,
  buildRecognitionOutput,
  buildUnknownOutput,
  computeGlobalMetrics,
  determineRadialFacing,
  computeClosedness,
}

export interface ParseOptions {
  config?: RecognitionConfig
  simplifyTolerance?: number
  clusterEps?: number
  clusterMinPts?: number
}

let candidateCounter = 0

function nextCandidateId(): string {
  candidateCounter++
  return `cand-${candidateCounter}`
}

function processStrokes(strokes: Stroke[], tolerance: number): CleanedStroke[] {
  const cleaned: CleanedStroke[] = []

  for (let i = 0; i < strokes.length; i++) {
    const raw = strokes[i]!
    const normalized = normalizeStroke(raw.points)
    const smoothed = smoothStroke(normalized)
    const simplified = simplifyStroke(smoothed, tolerance)
    const info = computeCenterAndBounds(simplified)

    cleaned.push({
      id: raw.id,
      points: simplified,
      rawPoints: raw.points,
      center: info.center,
      bounds: info.bounds,
    })
  }

  return cleaned
}

function buildCandidates(
  cleanedStrokes: CleanedStroke[],
  ring: RingCandidate,
  eps: number,
  minPts: number,
): SymbolCandidate[] {
  const nonRingStrokes = cleanedStrokes.filter((s) => !ring.strokeIds.includes(s.id))

  if (nonRingStrokes.length === 0) return []

  const clusters = segmentStrokes(nonRingStrokes, eps, minPts)

  const remainingSet = new Set<string>()
  for (let i = 0; i < nonRingStrokes.length; i++) {
    remainingSet.add(nonRingStrokes[i]!.id)
  }

  const candidates: SymbolCandidate[] = []

  for (let ci = 0; ci < clusters.length; ci++) {
    const clusterIndices = clusters[ci]!
    const clusterStrokeIds: string[] = []
    const allClusterPoints: { x: number; y: number }[] = []

    for (let j = 0; j < clusterIndices.length; j++) {
      const idx = clusterIndices[j]!
      const stroke = nonRingStrokes[idx]!
      clusterStrokeIds.push(stroke.id)
      remainingSet.delete(stroke.id)
      for (let k = 0; k < stroke.points.length; k++) {
        allClusterPoints.push(stroke.points[k]!)
      }
    }

    const candidate = createSymbolCandidate(
      clusterStrokeIds,
      allClusterPoints,
      ring,
      cleanedStrokes.filter((s) => clusterStrokeIds.includes(s.id)),
    )

    candidates.push(candidate)
  }

  for (const leftoverId of remainingSet) {
    const stroke = nonRingStrokes.find((s) => s.id === leftoverId)!
    const candidate = createSymbolCandidate([stroke.id], [...stroke.points], ring, [stroke])
    candidates.push(candidate)
  }

  return candidates
}

function createSymbolCandidate(
  strokeIds: string[],
  allPoints: { x: number; y: number }[],
  ring: RingCandidate,
  strokes: CleanedStroke[],
): SymbolCandidate {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let sumX = 0
  let sumY = 0

  for (let i = 0; i < allPoints.length; i++) {
    const p = allPoints[i]!
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
    sumX += p.x
    sumY += p.y
  }

  const center = { x: allPoints.length > 0 ? sumX / allPoints.length : 0, y: allPoints.length > 0 ? sumY / allPoints.length : 0 }
  const radiusNorm = ring.center !== null ? computeRadiusNorm(center, ring.center, ring.radius) : 0
  const angleDeg = ring.center !== null ? computeAngleDeg(center, ring.center) : 0
  const layer = ring.center !== null ? detectLayer(center, ring.center, ring.radius) : 'unknown'

  const pointsForOrientation = strokes.map((s) => s.points)
  const orientationDeg = computeOrientationDeg(pointsForOrientation)

  return {
    candidateId: nextCandidateId(),
    strokeIds,
    rawStrokeCount: strokeIds.length,
    cleanedStrokeCount: strokeIds.length,
    bounds: {
      minX: minX === Infinity ? 0 : minX,
      minY: minY === Infinity ? 0 : minY,
      maxX: maxX === -Infinity ? 0 : maxX,
      maxY: maxY === -Infinity ? 0 : maxY,
    },
    center,
    radiusNorm,
    angleDeg,
    layer,
    nearBoundary: detectNearBoundary(radiusNorm),
    sizeNorm: computeSizeNorm(strokes, ring),
    lengthNorm: computeLengthNorm(strokes),
    orientationDeg,
    directedOrientationDeg: orientationDeg,
    radialFacing: ring.center !== null ? determineRadialFacing(center, ring.center, orientationDeg) : 'unclear',
    closedness: computeClosedness(strokes.map((s) => ({ points: s.points }))),
    overdrawAmount: 0,
    neatness: strokes.length > 0
      ? strokes.reduce((sum, s) => sum + (s.points.length > 2 ? 0.7 : 0.5), 0) / strokes.length
      : 0,
  }
}

function detectNearBoundary(radiusNorm: number): boolean {
  const boundaries = [0.25, 0.75]
  for (let i = 0; i < boundaries.length; i++) {
    if (Math.abs(radiusNorm - boundaries[i]!) < 0.1) return true
  }
  return false
}

function computeSizeNorm(strokes: CleanedStroke[], ring: RingCandidate): number {
  if (ring.radius <= 0 || strokes.length === 0) return 0

  let maxDist = 0
  for (let i = 0; i < strokes.length; i++) {
    const b = strokes[i]!.bounds
    const halfW = b.width / 2
    const halfH = b.height / 2
    const extent = Math.sqrt(halfW * halfW + halfH * halfH)
    if (extent > maxDist) maxDist = extent
  }

  return Math.min(1, maxDist / (ring.radius * 0.5))
}

function computeLengthNorm(strokes: CleanedStroke[]): number {
  if (strokes.length === 0) return 0
  let totalLength = 0
  for (let i = 0; i < strokes.length; i++) {
    const pts = strokes[i]!.points
    for (let j = 1; j < pts.length; j++) {
      const dx = pts[j]!.x - pts[j - 1]!.x
      const dy = pts[j]!.y - pts[j - 1]!.y
      totalLength += Math.sqrt(dx * dx + dy * dy)
    }
  }
  return Math.min(1, totalLength / 3)
}

function matchSigil(
  candidate: SymbolCandidate,
  cleanedStrokes: CleanedStroke[],
  config: RecognitionConfig,
): { entry: SigilEntry; confidence: number } | null {
  const { sigils } = DEFAULT_DICTIONARY
  const candidateStrokes = cleanedStrokes
    .filter((s) => candidate.strokeIds.includes(s.id))
    .map((s) => s.points)

  if (candidateStrokes.length === 0) return null

  let bestMatch: SigilEntry | null = null
  let bestConfidence = 0

  for (let i = 0; i < sigils.length; i++) {
    const entry = sigils[i]!

    if (!entry.allowedLayers.includes(candidate.layer)) continue

    const inkScore = entry.recognitionRotationInvariant
      ? rotationInvariantMatch(candidateStrokes, entry, config)
      : templateMatch(candidateStrokes, entry.strokeTemplate, config.rasterGridSize, config.maskRadius)

    if (inkScore < config.inkOverlapThreshold) continue

    const structuralScore = computeStructuralScore(candidate, entry.strokeTemplate)
    const compositionalScore = computeCompositionalScore(candidate, entry.strokeTemplate)
    const positionScore = computePositionScore(candidate.layer, entry.allowedLayers as unknown as string[])
    const sizeScore = computeSizeScore(candidate.sizeNorm, 0.05, 0.6)

    const confidence = computeConfidence(
      inkScore,
      structuralScore,
      compositionalScore,
      positionScore,
      sizeScore,
      config,
    )

    if (confidence > bestConfidence) {
      bestConfidence = confidence
      bestMatch = entry
    }
  }

  if (bestMatch && bestConfidence >= config.minConfidence * 0.5) {
    return { entry: bestMatch, confidence: bestConfidence }
  }

  return null
}

function matchSign(
  candidate: SymbolCandidate,
  cleanedStrokes: CleanedStroke[],
  config: RecognitionConfig,
): { entry: SignEntry; confidence: number } | null {
  const { signs } = DEFAULT_DICTIONARY
  const candidateStrokes = cleanedStrokes
    .filter((s) => candidate.strokeIds.includes(s.id))
    .map((s) => s.points)

  if (candidateStrokes.length === 0) return null

  let bestMatch: SignEntry | null = null
  let bestConfidence = 0

  for (let i = 0; i < signs.length; i++) {
    const entry = signs[i]!

    if (!entry.allowedLayers.includes(candidate.layer)) continue

    const inkScore = templateMatch(
      candidateStrokes,
      entry.strokeTemplate,
      config.rasterGridSize,
      config.maskRadius,
    )

    if (inkScore < config.inkOverlapThreshold) continue

    const structuralScore = computeStructuralScore(candidate, entry.strokeTemplate)
    const compositionalScore = computeCompositionalScore(candidate, entry.strokeTemplate)
    const positionScore = computePositionScore(candidate.layer, entry.allowedLayers as unknown as string[])
    const sizeScore = computeSizeScore(candidate.sizeNorm, 0.03, 0.4)

    const confidence = computeConfidence(
      inkScore,
      structuralScore,
      compositionalScore,
      positionScore,
      sizeScore,
      config,
    )

    if (confidence > bestConfidence) {
      bestConfidence = confidence
      bestMatch = entry
    }
  }

  if (bestMatch && bestConfidence >= config.minConfidence * 0.5) {
    return { entry: bestMatch, confidence: bestConfidence }
  }

  return null
}

export function parse(
  strokes: Stroke[],
  options?: ParseOptions,
): { ast: GlyphAST; strokes: CleanedStroke[] } {
  const config = options?.config ?? DEFAULT_CONFIG.recognition
  const tolerance = options?.simplifyTolerance ?? 0.01
  const eps = options?.clusterEps ?? 0.15
  const minPts = options?.clusterMinPts ?? 1

  candidateCounter = 0
  const warnings: import('@glyph-weaver/core').ParserWarning[] = []

  const cleanedStrokes = processStrokes(strokes, tolerance)

  let ring = detectRing(cleanedStrokes)
  if (!ring.found) {
    warnings.push('no_ring_detected')
    return {
      ast: buildEmptyAST(warnings),
      strokes: cleanedStrokes,
    }
  }

  if (!ring.complete) {
    warnings.push('ring_incomplete')
  }

  const multiRings = detectMultipleRings(cleanedStrokes, ring)
  if (multiRings.unsupportedMultipleRings.length > 0) {
    warnings.push('unsupported_multiple_rings')
    ring.unsupportedMultipleRings = multiRings.unsupportedMultipleRings
  }
  if (multiRings.unsupportedNestedRings.length > 0) {
    warnings.push('unsupported_nested_ring')
    ring.unsupportedNestedRings = multiRings.unsupportedNestedRings
  }

  const candidates = buildCandidates(cleanedStrokes, ring, eps, minPts)

  let sigilMatch: { entry: SigilEntry; confidence: number; candidateId: string } | null = null
  const signMatches: { entry: SignEntry; confidence: number; candidateId: string }[] = []
  const unknownIds: string[] = []

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i]!

    const sm = matchSigil(cand, cleanedStrokes, config)
    if (sm && (!sigilMatch || sm.confidence > sigilMatch.confidence)) {
      if (sigilMatch) {
        warnings.push('unsupported_multiple_sigils')
      }
      sigilMatch = { ...sm, candidateId: cand.candidateId }
    } else {
      const signMatch = matchSign(cand, cleanedStrokes, config)
      if (signMatch) {
        signMatches.push({ ...signMatch, candidateId: cand.candidateId })
      } else {
        unknownIds.push(cand.candidateId)
      }
    }
  }

  if (!sigilMatch) {
    warnings.push('missing_primary_sigil')
  }

  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i]!.nearBoundary) {
      warnings.push('symbol_near_layer_boundary')
    }
  }

  const ast = buildGlyphAST({
    ring,
    candidates,
    sigilMatch,
    signMatches,
    unknownCandidateIds: unknownIds,
    warnings,
    config,
  })

  return { ast, strokes: cleanedStrokes }
}

function buildEmptyAST(warnings: import('@glyph-weaver/core').ParserWarning[]): GlyphAST {
  return {
    type: 'GlyphAST',
    version: '0.1.0',
    ring: {
      found: false,
      center: null,
      radius: 0,
      complete: false,
      activationEvent: false,
      completeness: 0,
      strokeIds: [],
      gap: 0,
      gapArcLength: 0,
      coverageRatio: 0,
      roundness: 0,
      lineSmoothness: 0,
      neatness: 0,
      overdrawAmount: 0,
      unsupportedMultipleRings: [],
      unsupportedNestedRings: [],
    },
    candidates: [],
    primarySigil: null,
    unsupportedMultipleSigils: [],
    signs: [],
    unknowns: [],
    globalMetrics: { neatness: 0, radialSymmetry: 0, instability: 1 },
    warnings,
  }
}
