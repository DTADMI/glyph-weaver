import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_DARK } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class DarkEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(0)
    this.particles.setDamping(0.99)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.55,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_DARK)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt
    this.emitTimer += dt

    const force = this.config.force
    const spread = this.config.spread
    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5

    if (this.emitTimer >= 0.06 && this.particles.activeCount < this.config.ctx.particleCap) {
      const count = 1 + Math.floor(force * 3)
      const creepSpeed = 8 + force * 18

      this.particles.emit({
        count,
        originX,
        originY,
        spreadX: spread * 160,
        spreadY: spread * 160,
        speedMin: creepSpeed * 0.4,
        speedMax: creepSpeed,
        lifeMin: 1.5,
        lifeMax: 3.0 + this.config.duration,
        sizeMin: 6 + force * 10,
        sizeMax: 14 + force * 20,
        color: [0.15, 0.0, 0.35],
        alphaMin: 0.1,
        alphaMax: 0.25,
        vxBase: this.config.direction.x * creepSpeed * 0.5,
        vyBase: this.config.direction.y * creepSpeed * 0.5,
      })

      this.emitTimer = 0
    }

    for (const p of this.particles.particles) {
      p.size += force * 2 * dt
      p.vx += (originX - p.x) * 0.2 * dt
      p.vy += (originY - p.y) * 0.2 * dt
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
