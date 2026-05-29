import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_NATURE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class AreaEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0
  private currentRadius: number = 0
  private maxRadius: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(0)
    this.particles.setDamping(0.98)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.75,
    )
    this.elapsed = 0
    this.emitTimer = 0
    this.currentRadius = 0
    this.maxRadius = config.spread * 300 + config.range * 100

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_NATURE)
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
    const expansionSpeed = 40 + force * 100

    this.currentRadius = Math.min(this.currentRadius + expansionSpeed * dt, this.maxRadius)

    if (this.emitTimer >= 0.02) {
      const count = 3 + Math.floor(force * 5)
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * this.currentRadius
        const px = originX + Math.cos(angle) * dist
        const py = originY + Math.sin(angle) * dist

        this.particles.emit({
          count: 1,
          originX: px,
          originY: py,
          spreadX: 6,
          spreadY: 6,
          speedMin: 5,
          speedMax: 15,
          lifeMin: 0.3,
          lifeMax: 0.8,
          sizeMin: 1.5 + force * 4,
          sizeMax: 3 + force * 6,
          color: [0.3, 0.7, 0.25],
          alphaMin: 0.15,
          alphaMax: 0.3,
          vxBase: Math.cos(angle) * 10 * force,
          vyBase: Math.sin(angle) * 10 * force,
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
