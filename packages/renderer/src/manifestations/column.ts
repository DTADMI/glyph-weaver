import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_LIGHT } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class ColumnEffect implements Effect {
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
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.8,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_LIGHT)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt
    this.emitTimer += dt

    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5
    const force = this.config.force
    const direction = this.config.direction
    const dirLen = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1
    const dirX = direction.x / dirLen
    const dirY = direction.y / dirLen

    const convergenceWidth = (1 - this.config.focus) * 60
    const beamSpeed = 50 + force * 120

    if (this.emitTimer >= 0.016) {
      const count = 2 + Math.floor(force * 5)
      for (let i = 0; i < count; i++) {
        const along = Math.random() * this.config.range * 300
        const orthogonalX = -dirY
        const orthogonalY = dirX
        const lateralOffset = (Math.random() - 0.5) * convergenceWidth

        this.particles.emit({
          count: 1,
          originX: originX + dirX * along + orthogonalX * lateralOffset,
          originY: originY + dirY * along + orthogonalY * lateralOffset,
          spreadX: 5,
          spreadY: 5,
          speedMin: beamSpeed * 0.8,
          speedMax: beamSpeed * 1.2,
          lifeMin: 0.2,
          lifeMax: 0.6,
          sizeMin: 2 + force * 4,
          sizeMax: 5 + force * 8,
          color: [0.9, 0.9, 1.0],
          alphaMin: 0.2,
          alphaMax: 0.4,
          vxBase: dirX * beamSpeed * 0.3,
          vyBase: dirY * beamSpeed * 0.3,
        })
      }

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
