import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_EARTH } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class EarthEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(config.gravity * 200)
    this.particles.setDamping(0.92)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.45,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_EARTH)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt
    this.emitTimer += dt

    const force = this.config.force
    const emissionRate = 0.04

    if (this.emitTimer >= emissionRate && this.particles.activeCount < this.config.ctx.particleCap) {
      const canvasW = this.config.ctx.canvas.width
      const canvasH = this.config.ctx.canvas.height

      const count = 2 + Math.floor(force * 2)
      this.particles.emit({
        count,
        originX: canvasW * 0.5,
        originY: canvasH * 0.5,
        spreadX: this.config.spread * 100,
        spreadY: 40,
        speedMin: 20 + force * 40,
        speedMax: 45 + force * 80,
        lifeMin: 0.8 + this.config.duration * 0.4,
        lifeMax: 1.6 + this.config.duration * 0.5,
        sizeMin: 2 + force * 6,
        sizeMax: 5 + force * 12,
        color: [0.5, 0.35, 0.15],
        alphaMin: 0.3,
        alphaMax: 0.55,
        vxBase: this.config.direction.x * force * 25,
        vyBase: this.config.direction.y * force * 30,
      })

      this.emitTimer = 0
    }

    for (const p of this.particles.particles) {
      const growthRate = 0.5 + this.config.force * 1.5
      p.size += growthRate * dt
      p.vy += this.config.gravity * 120 * dt
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
