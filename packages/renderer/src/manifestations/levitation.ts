import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WIND } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class LevitationEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(-config.gravity * 30)
    this.particles.setDamping(0.995)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.65,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WIND)
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
    const stability = this.config.stability
    const balanced = stability > 0.6
    const orbitRadius = 25 + force * 80

    if (this.emitTimer >= 0.04) {
      const count = 1 + Math.floor(force * 3)

      for (let i = 0; i < count; i++) {
        const angle = this.elapsed * (balanced ? 2 : 0.5) + Math.random() * Math.PI * 2
        const rx = originX + Math.cos(angle) * orbitRadius * (balanced ? 0.8 : 1.0)
        const ry = originY + Math.sin(angle) * orbitRadius * (balanced ? 0.8 : 1.0)

        this.particles.emit({
          count: 1,
          originX: rx,
          originY: ry,
          spreadX: 15,
          spreadY: 15,
          speedMin: 3,
          speedMax: 12,
          lifeMin: 0.8,
          lifeMax: 1.6,
          sizeMin: 1.5 + force * 3,
          sizeMax: 3 + force * 6,
          color: [0.7, 0.9, 0.7],
          alphaMin: 0.2,
          alphaMax: 0.4,
          vxBase: Math.cos(angle) * 15 * force,
          vyBase: Math.sin(angle) * 15 * force - 5,
        })
      }

      this.emitTimer = 0
    }

    for (const p of this.particles.particles) {
      p.vy -= this.config.gravity * 40 * dt
      const hoverWave = Math.sin(this.elapsed * 3 + p.x * 0.01) * force * 15 * dt
      p.y += hoverWave
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
