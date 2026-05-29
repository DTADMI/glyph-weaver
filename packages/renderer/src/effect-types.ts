import type { ElementId, ManifestationId, Direction3D } from '@glyph-weaver/core'

export interface EffectContext {
  gl: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  particleCap: number
  fps: number
  portalOpacity: number
  effectOpacity: number
  defaultEffectScale: number
  minEffectScale: number
  maxEffectScale: number
  defaultDuration: number
  minDuration: number
  maxDuration: number
}

export interface EffectConfig {
  element: ElementId | null
  manifestation: ManifestationId | 'none'
  direction: Direction3D
  gravity: number
  force: number
  spread: number
  focus: number
  range: number
  duration: number
  stability: number
  quality: number
  effectScale: number
  primarySizeNorm: number
  ctx: EffectContext
}

export interface Effect {
  init(config: EffectConfig): void
  update(dt: number): void
  render(): void
  dispose(): void
}

export type EffectFactory = (config: EffectConfig) => Effect

export interface ActiveEffects {
  element: Effect | null
  manifestation: Effect | null
}
