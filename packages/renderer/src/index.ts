export { EffectEngine, createRenderer } from './effect-engine.js'
export type { Effect, EffectConfig, EffectContext, EffectFactory, ActiveEffects } from './effect-types.js'

export { createWebGLContext, createShaderProgram, createQuad } from './webgl/context.js'
export type { QuadGeometry } from './webgl/context.js'

export {
  VERTEX_SHADER_PASSTHROUGH,
  FRAGMENT_SHADER_FIRE,
  FRAGMENT_SHADER_WATER,
  FRAGMENT_SHADER_WIND,
  FRAGMENT_SHADER_EARTH,
  FRAGMENT_SHADER_LIGHT,
  FRAGMENT_SHADER_DARK,
  FRAGMENT_SHADER_LIGHTNING,
  FRAGMENT_SHADER_ICE,
  FRAGMENT_SHADER_NATURE,
  FRAGMENT_SHADER_ARCANE,
  ELEMENT_FRAGMENT_SHADERS,
} from './webgl/shaders.js'

export { ParticleSystem } from './webgl/particle-system.js'
export type { Particle, ParticleEmissionConfig } from './webgl/particle-system.js'

export { projectPortal, portalOutDirection } from './webgl/portal-plane.js'
export type { PortalProjection } from './webgl/portal-plane.js'

export { screenDirection, applyTilt, project3Dto2D } from './direction.js'

export { FireEffect } from './effects/fire.js'
export { WaterEffect } from './effects/water.js'
export { WindEffect } from './effects/wind.js'
export { EarthEffect } from './effects/earth.js'
export { LightEffect } from './effects/light.js'
export { DarkEffect } from './effects/dark.js'
export { LightningEffect } from './effects/lightning.js'
export { IceEffect } from './effects/ice.js'
export { NatureEffect } from './effects/nature.js'
export { ArcaneEffect } from './effects/arcane.js'

export { AuraEffect } from './manifestations/aura.js'
export { ColumnEffect } from './manifestations/column.js'
export { LevitationEffect } from './manifestations/levitation.js'
export { ConvergenceEffect } from './manifestations/convergence.js'
export { BarrierEffect } from './manifestations/barrier.js'
export { ProjectileEffect } from './manifestations/projectile.js'
export { AreaEffect } from './manifestations/area.js'
export { ShieldEffect } from './manifestations/shield.js'
