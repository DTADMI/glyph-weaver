import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ARCANE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class AuraEffect implements Effect {
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
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.65,
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
    const spread = this.config.spread
    const orbitRadius = 40 + spread * 150

    if (this.emitTimer >= 0.03) {
      const count = 3 + Math.floor(force * 4)
      const orbitalSpeed = 1 + force * 6

      for (let i = 0; i < count; i++) {
        const angle = this.elapsed * orbitalSpeed + (i / count) * Math.PI * 2
        const px = originX + Math.cos(angle) * orbitRadius
        const py = originY + Math.sin(angle) * orbitRadius

        this.particles.emit({
          count: 1,
          originX: px + (Math.random() - 0.5) * 20,
          originY: py + (Math.random() - 0.5) * 20,
          spreadX: 10,
          spreadY: 10,
          speedMin: 5,
          speedMax: 15,
          lifeMin: 0.5,
          lifeMax: 1.2,
          sizeMin: 2 + force * 4,
          sizeMax: 5 + force * 8,
          color: [0.5, 0.3, 0.9],
          alphaMin: 0.15,
          alphaMax: 0.35,
          vxBase: Math.cos(angle + Math.PI * 0.5) * 10 * force,
          vyBase: Math.sin(angle + Math.PI * 0.5) * 10 * force,
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
