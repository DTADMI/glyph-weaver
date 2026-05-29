import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_FIRE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class FireEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(config.gravity * 150)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.6,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_FIRE)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt
    this.emitTimer += dt

    const emissionRate = this.config.gravity > 0.5
      ? 0.016
      : 0.04

    if (this.emitTimer >= emissionRate && this.particles.activeCount < this.config.ctx.particleCap) {
      const canvasW = this.config.ctx.canvas.width
      const canvasH = this.config.ctx.canvas.height
      const force = this.config.force
      const spread = this.config.spread * 80
      const size = 2 + force * 8
      const speedBase = 60 + force * 120
      const flicker = 1 - this.config.stability

      const count = this.config.gravity > 0.3 ? 4 + Math.floor(force * 6) : 2 + Math.floor(force * 3)

      this.particles.emit({
        count,
        originX: canvasW * 0.5 + (Math.random() - 0.5) * spread * flicker,
        originY: canvasH * 0.5,
        spreadX: spread,
        spreadY: 10,
        speedMin: speedBase * 0.7,
        speedMax: speedBase * (1 + flicker),
        lifeMin: 0.4 + this.config.duration * 0.3,
        lifeMax: 0.8 + this.config.duration * 0.5,
        sizeMin: size * 0.5,
        sizeMax: size * (1 + force),
        color: [1.0, 0.4 + force * 0.3, 0.05],
        alphaMin: 0.3 + this.config.effectScale * 0.3,
        alphaMax: 0.6 + this.config.effectScale * 0.3,
        vxBase: 0,
        vyBase: this.config.gravity > 0.3 ? -speedBase * 0.5 : 0,
      })

      this.emitTimer = 0
    }

    this.particles.update(dt)
  }

  render(): void {
    if (!this.config || !this.particles || !this.program) return
    const gl = this.config.ctx.gl
    this.particles.render(gl, this.program, this.config.ctx.canvas.width, this.config.ctx.canvas.height)
  }

  dispose(): void {
    if (this.program) {
      this.config?.ctx.gl.deleteProgram(this.program)
      this.program = null
    }
    this.particles?.dispose()
    this.particles = null
    this.config = null
  }
}
