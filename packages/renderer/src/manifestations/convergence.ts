import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WATER } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class ConvergenceEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(0)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.7,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WATER)
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
    const focus = this.config.focus
    const rigidity = 0.3 + focus * 0.5
    const direction = this.config.direction
    const dirLen = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1
    const dirX = direction.x / dirLen
    const dirY = direction.y / dirLen
    const perpendicularX = -dirY
    const perpendicularY = dirX

    if (this.emitTimer >= 0.025) {
      const count = 2 + Math.floor(force * 4)
      for (let i = 0; i < count; i++) {
        const lateralDist = (Math.random() - 0.5) * this.config.spread * 200

        this.particles.emit({
          count: 1,
          originX: originX + perpendicularX * lateralDist,
          originY: originY + perpendicularY * lateralDist,
          spreadX: 8,
          spreadY: 8,
          speedMin: 10 + force * 40,
          speedMax: 25 + force * 80,
          lifeMin: 0.3,
          lifeMax: 0.7,
          sizeMin: 1.5 + force * 4,
          sizeMax: 3 + force * 8,
          color: [0.35, 0.7, 0.9],
          alphaMin: 0.2,
          alphaMax: 0.4,
          vxBase: -perpendicularX * lateralDist * rigidity * 3,
          vyBase: -perpendicularY * lateralDist * rigidity * 3,
        })
      }

      this.emitTimer = 0
    }

    for (const p of this.particles.particles) {
      const dx = p.x - originX
      const dy = p.y - originY
      const along = dx * dirX + dy * dirY
      const lateralX = dx - along * dirX
      const lateralY = dy - along * dirY

      const convergeForce = rigidity * 4
      p.vx -= lateralX * convergeForce * dt
      p.vy -= lateralY * convergeForce * dt
      p.vx *= 0.97
      p.vy *= 0.97
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
