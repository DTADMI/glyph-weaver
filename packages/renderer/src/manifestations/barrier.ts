import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_EARTH } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class BarrierEffect implements Effect {
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
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.6,
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

    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5
    const force = this.config.force
    const shellRadius = 50 + force * 120
    const shellSegments = 12 + Math.floor(force * 8)

    if (this.emitTimer >= 0.04) {
      for (let i = 0; i < shellSegments; i++) {
        const angle = (i / shellSegments) * Math.PI * 2 + this.elapsed * 0.5
        const elevation = Math.sin(this.elapsed * 0.8 + i * 0.5) * 0.3

        const px = originX + Math.cos(angle) * shellRadius
        const py = originY + Math.sin(angle) * shellRadius * (1 - elevation * 0.5)

        if (Math.random() < 0.4) {
          this.particles.emit({
            count: 1,
            originX: px + (Math.random() - 0.5) * 10,
            originY: py + (Math.random() - 0.5) * 10,
            spreadX: 4,
            spreadY: 4,
            speedMin: 0,
            speedMax: 5,
            lifeMin: 0.6,
            lifeMax: 1.2,
            sizeMin: 2 + force * 4,
            sizeMax: 5 + force * 8,
            color: [0.5, 0.4, 0.3],
            alphaMin: 0.15,
            alphaMax: 0.3,
            vxBase: 0,
            vyBase: 0,
          })
        }
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
