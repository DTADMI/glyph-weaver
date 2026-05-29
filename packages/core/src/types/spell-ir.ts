import type { ElementId, ManifestationId } from './primitives.js'
import type { ParserWarning } from './glyph-ast.js'

export interface Direction3D {
  x: number
  y: number
  z: number
  xTiltDeg: number
  yTiltDeg: number
  tiltFromZDeg: number
}

export interface ManifestationProfile {
  strength: number
}

export interface ColumnProfile extends ManifestationProfile {
  type: 'column'
}

export interface LevitationProfile extends ManifestationProfile {
  type: 'levitation'
}

export interface ConvergenceProfile extends ManifestationProfile {
  type: 'convergence'
  point: { x: number; y: number }
  radius: number
  rigidity: number
}

export interface AuraProfile extends ManifestationProfile {
  type: 'aura'
}

export interface BarrierProfile extends ManifestationProfile {
  type: 'barrier'
}

export interface ProjectileProfile extends ManifestationProfile {
  type: 'projectile'
}

export type AnyManifestationProfile =
  | AuraProfile
  | ColumnProfile
  | LevitationProfile
  | ConvergenceProfile
  | BarrierProfile
  | ProjectileProfile

export type CompilerWarning =
  | 'primary_sigil_confidence_low'
  | 'multiple_sigils_unsupported'
  | 'multiple_rings_unsupported'
  | 'nested_rings_unsupported'
  | 'unsupported_element'
  | 'no_valid_sigil'
  | 'ring_too_messy'
  | 'sign_confidence_low'
  | 'mixed_manifestations'

export interface SpellIR {
  type: 'SpellIR'
  valid: boolean
  active: boolean
  prepared: boolean
  status: string
  activatedAt: number | null
  element: ElementId | null
  elementConfidence: number
  primarySizeNorm: number
  effectScale: number
  primaryManifestation: ManifestationId | 'none'
  manifestations: Record<string, AnyManifestationProfile>
  direction: Direction3D
  directionCoherence: number
  gravity: number
  force: number
  spread: number
  focus: number
  range: number
  duration: number
  stability: number
  quality: number
  neatness: number
  warnings: Array<ParserWarning | CompilerWarning>
  signature: string
}
