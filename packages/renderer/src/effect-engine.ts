import type { SpellIR, ElementId, ManifestationId, AppConfig } from '@glyph-weaver/core'
import type { Effect, EffectConfig, EffectContext, ActiveEffects } from './effect-types.js'
import { FireEffect } from './effects/fire.js'
import { WaterEffect } from './effects/water.js'
import { WindEffect } from './effects/wind.js'
import { EarthEffect } from './effects/earth.js'
import { LightEffect } from './effects/light.js'
import { DarkEffect } from './effects/dark.js'
import { LightningEffect } from './effects/lightning.js'
import { IceEffect } from './effects/ice.js'
import { NatureEffect } from './effects/nature.js'
import { ArcaneEffect } from './effects/arcane.js'
import { AuraEffect } from './manifestations/aura.js'
import { ColumnEffect } from './manifestations/column.js'
import { LevitationEffect } from './manifestations/levitation.js'
import { ConvergenceEffect } from './manifestations/convergence.js'
import { BarrierEffect } from './manifestations/barrier.js'
import { ProjectileEffect } from './manifestations/projectile.js'
import { AreaEffect } from './manifestations/area.js'
import { ShieldEffect } from './manifestations/shield.js'
import { createWebGLContext } from './webgl/context.js'

interface TransitionState {
  fromSpell: SpellIR
  toSpell: SpellIR
  progress: number
  duration: number
}

export class EffectEngine {
  private gl: WebGL2RenderingContext
  private ctx: EffectContext
  private activeSpell: SpellIR | null = null
  private activeEffects: ActiveEffects = { element: null, manifestation: null }
  private transition: TransitionState | null = null
  private disposed: boolean = false
  private animFrameId: number = 0

  private elementFactories: Record<string, () => Effect> = {
    fire: () => new FireEffect(),
    water: () => new WaterEffect(),
    wind: () => new WindEffect(),
    earth: () => new EarthEffect(),
    light: () => new LightEffect(),
    dark: () => new DarkEffect(),
    lightning: () => new LightningEffect(),
    ice: () => new IceEffect(),
    nature: () => new NatureEffect(),
    arcane: () => new ArcaneEffect(),
  }

  private manifestationFactories: Record<string, () => Effect> = {
    aura: () => new AuraEffect(),
    column: () => new ColumnEffect(),
    levitation: () => new LevitationEffect(),
    convergence: () => new ConvergenceEffect(),
    barrier: () => new BarrierEffect(),
    projectile: () => new ProjectileEffect(),
    area: () => new AreaEffect(),
    shield: () => new ShieldEffect(),
  }

  constructor(canvas: HTMLCanvasElement, config?: Partial<AppConfig>) {
    this.gl = createWebGLContext(canvas)

    const rcfg = config?.renderer
    this.ctx = {
      gl: this.gl,
      canvas,
      particleCap: rcfg?.particleCap ?? 500,
      fps: rcfg?.fps ?? 60,
      portalOpacity: rcfg?.portalOpacity ?? 0.15,
      effectOpacity: rcfg?.effectOpacity ?? 0.85,
      defaultEffectScale: rcfg?.defaultEffectScale ?? 1.5,
      minEffectScale: rcfg?.minEffectScale ?? 1.0,
      maxEffectScale: rcfg?.maxEffectScale ?? 2.35,
      defaultDuration: rcfg?.defaultDuration ?? 4.0,
      minDuration: rcfg?.minDuration ?? 0.65,
      maxDuration: rcfg?.maxDuration ?? 8.5,
    }
  }

  getEffectFactory(element: ElementId): (() => Effect) | null {
    return this.elementFactories[element] ?? null
  }

  getManifestationFactory(manifestation: ManifestationId): (() => Effect) | null {
    return this.manifestationFactories[manifestation] ?? null
  }

  cast(spell: SpellIR): void {
    if (!spell.valid && !spell.active) return

    if (this.activeSpell && this.activeSpell.signature !== spell.signature) {
      this.transition = {
        fromSpell: this.activeSpell,
        toSpell: spell,
        progress: 0,
        duration: 0.5,
      }
      return
    }

    this.setSpell(spell)
  }

  private setSpell(spell: SpellIR): void {
    this.stopLoop()
    this.disposeEffects()
    this.activeSpell = spell

    const baseConfig: EffectConfig = {
      element: spell.element,
      manifestation: spell.primaryManifestation,
      direction: spell.direction,
      gravity: spell.gravity,
      force: spell.force,
      spread: spell.spread,
      focus: spell.focus,
      range: spell.range,
      duration: spell.duration,
      stability: spell.stability,
      quality: spell.quality,
      effectScale: spell.effectScale,
      primarySizeNorm: spell.primarySizeNorm,
      ctx: this.ctx,
    }

    const elementFactory = spell.element ? this.getEffectFactory(spell.element) : null
    if (elementFactory) {
      const effect = elementFactory()
      effect.init(baseConfig)
      this.activeEffects.element = effect
    }

    if (spell.primaryManifestation !== 'none') {
      const manFactory = this.getManifestationFactory(spell.primaryManifestation)
      if (manFactory) {
        const effect = manFactory()
        effect.init(baseConfig)
        this.activeEffects.manifestation = effect
      }
    }

    this.startLoop()
  }

  private startLoop(): void {
    if (this.disposed) return
    let lastTime = performance.now()

    const tick = (now: number) => {
      if (this.disposed) return
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      if (this.transition) {
        this.transition.progress += dt / this.transition.duration
        if (this.transition.progress >= 1.0) {
          this.setSpell(this.transition.toSpell)
          this.transition = null
        } else {
          this.gl.clearColor(0, 0, 0, 0)
          this.gl.clear(this.gl.COLOR_BUFFER_BIT)
          this.gl.enable(this.gl.BLEND)
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
          this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)

          if (this.activeEffects.element) {
            this.activeEffects.element.render()
          }
          if (this.activeEffects.manifestation) {
            this.activeEffects.manifestation.render()
          }
        }
      }

      if (this.activeEffects.element) {
        this.activeEffects.element.update(dt)
      }
      if (this.activeEffects.manifestation) {
        this.activeEffects.manifestation.update(dt)
      }

      this.render()

      this.animFrameId = requestAnimationFrame(tick)
    }

    this.animFrameId = requestAnimationFrame(tick)
  }

  private stopLoop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = 0
    }
  }

  private render(): void {
    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    if (this.activeEffects.manifestation) {
      this.activeEffects.manifestation.render()
    }
    if (this.activeEffects.element) {
      this.activeEffects.element.render()
    }
  }

  update(dt: number): void {
    if (this.transition) {
      this.transition.progress += dt / this.transition.duration
      if (this.transition.progress >= 1.0) {
        this.setSpell(this.transition.toSpell)
        this.transition = null
      }
    }

    if (this.activeEffects.element) {
      this.activeEffects.element.update(dt)
    }
    if (this.activeEffects.manifestation) {
      this.activeEffects.manifestation.update(dt)
    }

    this.render()
  }

  dispose(): void {
    this.disposed = true
    this.stopLoop()
    this.disposeEffects()
  }

  private disposeEffects(): void {
    if (this.activeEffects.element) {
      this.activeEffects.element.dispose()
      this.activeEffects.element = null
    }
    if (this.activeEffects.manifestation) {
      this.activeEffects.manifestation.dispose()
      this.activeEffects.manifestation = null
    }
  }
}

export function createRenderer(canvas: HTMLCanvasElement, config?: Partial<AppConfig>): EffectEngine {
  return new EffectEngine(canvas, config)
}
