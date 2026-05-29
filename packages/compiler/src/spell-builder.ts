import type {
  SpellIR,
  ElementId,
  ManifestationId,
  ParserWarning,
} from '@glyph-weaver/core'
import type { CompilerWarning } from '@glyph-weaver/core/types'
import type { ComputedParameters } from './parameter-computer.js'
import type { DirectionResult } from './direction-computer.js'
import type { QualityResult } from './quality-scorer.js'
import type { SignAggregationResult } from './sign-aggregator.js'

export interface SpellBuilderInput {
  sigilElement: ElementId | null
  sigilConfidence: number
  sigilSizeNorm: number
  params: ComputedParameters
  directionResult: DirectionResult
  qualityResult: QualityResult
  signResult: SignAggregationResult
  stability: number
  duration: number
  warnings: Array<ParserWarning | CompilerWarning>
  effectScale: number
}

export function buildSpellIR(input: SpellBuilderInput): SpellIR {
  const {
    sigilElement,
    sigilConfidence,
    sigilSizeNorm,
    params,
    directionResult,
    qualityResult,
    signResult,
    stability,
    duration,
    warnings,
    effectScale,
  } = input

  return {
    type: 'SpellIR',
    valid: true,
    active: false,
    prepared: false,
    status: 'prepared',
    activatedAt: null,
    element: sigilElement,
    elementConfidence: sigilConfidence,
    primarySizeNorm: sigilSizeNorm,
    effectScale,
    primaryManifestation: signResult.primaryManifestation,
    manifestations: signResult.manifestations,
    direction: directionResult.direction,
    directionCoherence: directionResult.coherence,
    gravity: params.gravity,
    force: params.force,
    spread: params.spread,
    focus: params.focus,
    range: params.range,
    duration,
    stability,
    quality: qualityResult.quality,
    neatness: qualityResult.neatness,
    warnings,
    signature: generateSignature(sigilElement, signResult.primaryManifestation, params, qualityResult),
  }
}

export function buildInvalidSpell(warnings: Array<ParserWarning | CompilerWarning>): SpellIR {
  return {
    type: 'SpellIR',
    valid: false,
    active: false,
    prepared: false,
    status: 'invalid',
    activatedAt: null,
    element: null,
    elementConfidence: 0,
    primarySizeNorm: 0,
    effectScale: 0,
    primaryManifestation: 'none',
    manifestations: {},
    direction: { x: 0, y: 0, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 },
    directionCoherence: 0,
    gravity: 0,
    force: 0,
    spread: 0,
    focus: 0,
    range: 0,
    duration: 0,
    stability: 0,
    quality: 0,
    neatness: 0,
    warnings,
    signature: 'invalid',
  }
}

export function generateSignature(
  element: ElementId | null,
  manifestation: ManifestationId | 'none',
  params: ComputedParameters,
  quality: QualityResult,
): string {
  const parts = [
    element ?? 'none',
    manifestation,
    params.force.toFixed(3),
    params.spread.toFixed(3),
    params.focus.toFixed(3),
    params.range.toFixed(3),
    quality.quality.toFixed(3),
  ]
  return parts.join(':')
}
