import type {
  GlyphAST,
  RingCandidate,
  SymbolCandidate,
  RecognizedSigil,
  RecognizedSign,
  UnknownSymbol,
  GlobalMetrics,
  ParserWarning,
  SigilEntry,
  SignEntry,
  RecognitionStatus,
  RadialFacing,
  RecognitionConfig,
  SymbolShape,
} from '@glyph-weaver/core'

export function buildGlyphAST(params: {
  ring: RingCandidate
  candidates: SymbolCandidate[]
  sigilMatch: { entry: SigilEntry; confidence: number; candidateId: string } | null
  signMatches: { entry: SignEntry; confidence: number; candidateId: string }[]
  unknownCandidateIds: string[]
  warnings: ParserWarning[]
  config: RecognitionConfig
}): GlyphAST {
  const ring = buildRingOutput(params.ring)
  const candidates = params.candidates.map(buildCandidateOutput)

  let primarySigil: RecognizedSigil | null = null
  let unsupportedMultipleSigils: RecognizedSigil[] = []
  const signs: RecognizedSign[] = []
  const unknowns: UnknownSymbol[] = []

  if (params.sigilMatch) {
    const candidate = params.candidates.find((c) => c.candidateId === params.sigilMatch!.candidateId)
    const rec = buildRecognitionOutput(
      params.sigilMatch,
      'sigil',
      candidate ?? null,
      params.config,
    ) as RecognizedSigil
    if (rec.recognized) {
      primarySigil = rec
    }
  }

  for (let i = 0; i < params.signMatches.length; i++) {
    const match = params.signMatches[i]!
    const candidate = params.candidates.find((c) => c.candidateId === match.candidateId)
    const rec = buildRecognitionOutput(match, 'sign', candidate ?? null, params.config) as RecognizedSign
    if (rec.recognized) {
      signs.push(rec)
    }
  }

  for (let i = 0; i < params.unknownCandidateIds.length; i++) {
    const candidate = params.candidates.find((c) => c.candidateId === params.unknownCandidateIds[i])
    if (candidate) {
      unknowns.push(buildUnknownOutput(candidate))
    }
  }

  const globalMetrics = computeGlobalMetrics(candidates, ring)

  return {
    type: 'GlyphAST',
    version: '0.1.0',
    ring,
    candidates,
    primarySigil,
    unsupportedMultipleSigils,
    signs,
    unknowns,
    globalMetrics,
    warnings: params.warnings,
  }
}

function chooseRecognitionStatus(confidence: number, minConfidence: number): RecognitionStatus {
  if (confidence >= minConfidence) return 'valid'
  if (confidence >= minConfidence * 0.8) return 'valid_messy'
  if (confidence >= minConfidence * 0.5) return 'ambiguous'
  return 'unrecognized'
}

export function buildRecognitionOutput(
  match: { entry: SigilEntry | SignEntry; confidence: number; candidateId: string },
  kind: 'sigil' | 'sign',
  candidate: SymbolCandidate | null,
  config: RecognitionConfig,
): RecognizedSigil | RecognizedSign {
  const status = chooseRecognitionStatus(match.confidence, config.minConfidence)
  const recognized = status === 'valid' || status === 'valid_messy'
  const shape = computeSymbolShape(candidate)

  if (kind === 'sigil') {
    const sigil = match.entry as SigilEntry
    return {
      candidateId: match.candidateId,
      strokeIds: candidate?.strokeIds ?? [],
      id: sigil.id,
      kind: 'sigil',
      recognized,
      confidence: match.confidence,
      recognitionStatus: status,
      element: sigil.element,
      layer: candidate?.layer ?? 'unknown',
      radiusNorm: candidate?.radiusNorm ?? 0,
      angleDeg: candidate?.angleDeg ?? 0,
      sizeNorm: candidate?.sizeNorm ?? 0,
      lengthNorm: candidate?.lengthNorm ?? 0,
      neatness: candidate?.neatness ?? 0,
      shape,
      semantic: sigil.semantic,
    }
  }

  const sign = match.entry as SignEntry
  return {
    candidateId: match.candidateId,
    strokeIds: candidate?.strokeIds ?? [],
    id: sign.id,
    kind: 'sign',
    recognized,
    confidence: match.confidence,
    recognitionStatus: status,
    layer: candidate?.layer ?? 'unknown',
    radiusNorm: candidate?.radiusNorm ?? 0,
    angleDeg: candidate?.angleDeg ?? 0,
    sizeNorm: candidate?.sizeNorm ?? 0,
    lengthNorm: candidate?.lengthNorm ?? 0,
    neatness: candidate?.neatness ?? 0,
    shape,
    semantic: sign.semantic,
  }
}

function computeSymbolShape(candidate: SymbolCandidate | null): SymbolShape {
  if (!candidate) {
    return { elongation: 0, dominantAxisStrength: 0, strokeCount: 0, closedness: 0 }
  }
  return {
    elongation: candidate.bounds.maxX - candidate.bounds.minX > 0
      ? (candidate.bounds.maxY - candidate.bounds.minY) / (candidate.bounds.maxX - candidate.bounds.minX)
      : 1,
    dominantAxisStrength: 0.5,
    strokeCount: candidate.rawStrokeCount,
    closedness: candidate.closedness,
  }
}

export function buildRingOutput(ring: RingCandidate): RingCandidate {
  return { ...ring }
}

export function buildCandidateOutput(candidate: SymbolCandidate): SymbolCandidate {
  return { ...candidate }
}

export function buildUnknownOutput(candidate: SymbolCandidate): UnknownSymbol {
  return {
    candidateId: candidate.candidateId,
    strokeIds: candidate.strokeIds,
    layer: candidate.layer,
    radiusNorm: candidate.radiusNorm,
    angleDeg: candidate.angleDeg,
    sizeNorm: candidate.sizeNorm,
    neatness: candidate.neatness,
    bestGuess: null,
  }
}

export function computeGlobalMetrics(
  candidates: SymbolCandidate[],
  ring: RingCandidate,
): GlobalMetrics {
  let neatness = ring.neatness
  let symmetry = 0
  let instability = 0

  if (candidates.length > 0) {
    let totalNeatness = 0
    for (let i = 0; i < candidates.length; i++) {
      totalNeatness += candidates[i]!.neatness
    }
    const avgCandidateNeatness = totalNeatness / candidates.length
    neatness = 0.4 * ring.neatness + 0.6 * avgCandidateNeatness
  }

  if (candidates.length >= 2) {
    const angles: number[] = []
    for (let i = 0; i < candidates.length; i++) {
      angles.push(candidates[i]!.angleDeg)
    }
    angles.sort((a, b) => a - b)

    const expectedGap = 360 / candidates.length
    let gapDeviation = 0
    for (let i = 1; i < angles.length; i++) {
      const gap = angles[i]! - angles[i - 1]!
      gapDeviation += Math.abs(gap - expectedGap)
    }
    const wrapGap = 360 - angles[angles.length - 1]! + angles[0]!
    gapDeviation += Math.abs(wrapGap - expectedGap)

    symmetry = Math.max(0, 1 - gapDeviation / 360)

    let totalRadiusDev = 0
    for (let i = 0; i < candidates.length; i++) {
      totalRadiusDev += Math.abs(candidates[i]!.radiusNorm - 0.5)
    }
    const avgRadiusDev = totalRadiusDev / candidates.length
    symmetry = 0.7 * symmetry + 0.3 * (1 - avgRadiusDev)
  }

  instability = 1 - neatness

  return {
    neatness: Math.max(0, Math.min(1, neatness)),
    radialSymmetry: Math.max(0, Math.min(1, symmetry)),
    instability: Math.max(0, Math.min(1, instability)),
  }
}

export function determineRadialFacing(
  candidateCenter: { x: number; y: number },
  ringCenter: { x: number; y: number },
  orientationDeg: number,
): RadialFacing {
  const dx = candidateCenter.x - ringCenter.x
  const dy = candidateCenter.y - ringCenter.y
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return 'unclear'

  const radialAngle = Math.atan2(dy, dx) * (180 / Math.PI)
  const diff = (((orientationDeg - radialAngle) % 360) + 360) % 360

  if (diff < 30 || diff > 330) return 'outward'
  if (diff > 150 && diff < 210) return 'inward'
  if (diff > 60 && diff < 120) return 'counterclockwise'
  if (diff > 240 && diff < 300) return 'clockwise'
  return 'unclear'
}

export function computeClosedness(strokePoints: { points: { x: number; y: number }[] }[]): number {
  let closed = 0
  for (let i = 0; i < strokePoints.length; i++) {
    const points = strokePoints[i]!.points
    if (points.length < 2) continue
    const first = points[0]!
    const last = points[points.length - 1]!
    const dx = first.x - last.x
    const dy = first.y - last.y
    if (Math.sqrt(dx * dx + dy * dy) < 0.05) closed++
  }
  return strokePoints.length > 0 ? closed / strokePoints.length : 0
}
