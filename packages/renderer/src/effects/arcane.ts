import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ARCANE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class ArcaneEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(-config.gravity * 20)
    this.particles.setDamping(0.99)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.7,
    )
    this.elapsed = 0
    this.emitTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ARCANE)
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

    if (this.emitTimer >= 0.02 && this.particles.activeCount < this.config.ctx.particleCap) {
      const spiralAngle = this.elapsed * 3
      const spiralRadius = 20 + force * 60 + Math.sin(this.elapsed * 2) * 30
      const count = 2 + Math.floor(force * 4)

      for (let i = 0; i < count; i++) {
        const angle = spiralAngle + (i / count) * Math.PI * 2
        const rx = originX + Math.cos(angle) * spiralRadius
        const ry = originY + Math.sin(angle) * spiralRadius

        this.particles.emit({
          count: 1,
          originX: rx + (Math.random() - 0.5) * 10,
          originY: ry + (Math.random() - 0.5) * 10,
          spreadX: 8,
          spreadY: 8,
          speedMin: 10 + force * 30,
          speedMax: 30 + force * 60,
          lifeMin: 0.6 + this.config.duration * 0.4,
          lifeMax: 1.2 + this.config.duration * 0.5,
          sizeMin: 1.5 + force * 3,
          sizeMax: 3 + force * 6,
          color: [0.55, 0.1, 0.75],
          alphaMin: 0.2,
          alphaMax: 0.45,
          vxBase: (Math.random() - 0.5) * force * 40,
          vyBase: -this.config.gravity * 30 * force,
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
