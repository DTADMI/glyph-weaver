import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_FIRE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class ProjectileEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private launchTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(config.gravity * 30)
    this.particles.setDamping(0.99)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 1.2,
    )
    this.elapsed = 0
    this.launchTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_FIRE)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt
    this.launchTimer += dt

    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5
    const force = this.config.force
    const direction = this.config.direction
    const dirLen = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1
    const dirX = direction.x / dirLen
    const dirY = direction.y / dirLen
    const speed = 150 + force * 300

    const launchInterval = 0.2 - force * 0.08
    if (this.launchTimer >= launchInterval) {
      this.launchTimer = 0

      const projectileCount = 3 + Math.floor(force * 3)
      for (let i = 0; i < projectileCount; i++) {
        const lateralSpread = (Math.random() - 0.5) * 20
        const perpendicularX = -dirY
        const perpendicularY = dirX

        this.particles.emit({
          count: 1,
          originX: originX + perpendicularX * lateralSpread,
          originY: originY + perpendicularY * lateralSpread,
          spreadX: 5,
          spreadY: 5,
          speedMin: speed * 0.8,
          speedMax: speed * 1.2,
          lifeMin: 0.3,
          lifeMax: 0.8,
          sizeMin: 3 + force * 6,
          sizeMax: 6 + force * 10,
          color: [1.0, 0.5, 0.1],
          alphaMin: 0.4,
          alphaMax: 0.7,
          vxBase: dirX * speed,
          vyBase: dirY * speed,
        })
      }
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
