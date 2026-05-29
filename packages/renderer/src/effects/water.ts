import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WATER } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class WaterEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0
  private coreParticles: ParticleSystem | null = null

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(Math.floor(config.ctx.particleCap * 0.7))
    this.particles.setGravity(config.gravity * 80)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.55,
    )

    this.coreParticles = new ParticleSystem(Math.floor(config.ctx.particleCap * 0.3))
    this.coreParticles.setGravity(config.gravity * 40)
    this.coreParticles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.35,
    )

    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WATER)
  }

  update(dt: number): void {
    if (!this.config || !this.particles || !this.coreParticles) return

    this.elapsed += dt
    this.emitTimer += dt

    const isBlob = this.config.gravity < 0.35
    const emissionRate = isBlob ? 0.06 : 0.02
    const force = this.config.force
    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height

    if (this.emitTimer >= emissionRate) {
      const count = isBlob ? 6 + Math.floor(force * 4) : 3 + Math.floor(force * 3)

      this.particles.emit({
        count,
        originX: canvasW * 0.5,
        originY: canvasH * 0.5,
        spreadX: this.config.spread * 120,
        spreadY: 30,
        speedMin: 40 + force * 80,
        speedMax: 80 + force * 140,
        lifeMin: 0.5 + this.config.duration * 0.4,
        lifeMax: 1.0 + this.config.duration * 0.5,
        sizeMin: 1.5 + force * 4,
        sizeMax: 3 + force * 8,
        color: [0.2, 0.6, 1.0],
        alphaMin: 0.25,
        alphaMax: 0.5,
        vxBase: this.config.direction.x * force * 40,
        vyBase: isBlob ? 0 : this.config.direction.y * force * 60,
      })

      this.coreParticles.emit({
        count: Math.floor(count * 0.4),
        originX: canvasW * 0.5,
        originY: canvasH * 0.5,
        spreadX: this.config.spread * 60,
        spreadY: 15,
        speedMin: 20 + force * 30,
        speedMax: 50 + force * 60,
        lifeMin: 0.8 + this.config.duration * 0.4,
        lifeMax: 1.4 + this.config.duration * 0.5,
        sizeMin: 1 + force * 2,
        sizeMax: 2 + force * 4,
        color: [0.3, 0.8, 1.0],
        alphaMin: 0.35,
        alphaMax: 0.65,
        vxBase: this.config.direction.x * force * 20,
        vyBase: isBlob ? 0 : this.config.direction.y * force * 30,
      })

      this.emitTimer = 0
    }

    this.particles.update(dt)
    this.coreParticles.update(dt)
  }

  render(): void {
    if (!this.config || !this.particles || !this.coreParticles || !this.program) return
    const gl = this.config.ctx.gl
    this.particles.render(gl, this.program, this.config.ctx.canvas.width, this.config.ctx.canvas.height)
    this.coreParticles.render(gl, this.program, this.config.ctx.canvas.width, this.config.ctx.canvas.height)
  }

  dispose(): void {
    if (this.program) {
      this.config?.ctx.gl.deleteProgram(this.program)
      this.program = null
    }
    this.particles?.dispose()
    this.particles = null
    this.coreParticles?.dispose()
    this.coreParticles = null
    this.config = null
  }
}
