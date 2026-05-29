import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_WIND } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class WindEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(0)
    this.particles.setDamping(0.995 - config.focus * 0.01)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.8,
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

    const force = this.config.force
    const focus = this.config.focus
    const emissionRate = 0.012 - focus * 0.005

    if (this.emitTimer >= emissionRate && this.particles.activeCount < this.config.ctx.particleCap) {
      const canvasW = this.config.ctx.canvas.width
      const canvasH = this.config.ctx.canvas.height
      const speed = 100 + force * 200
      const lineWidth = 0.3 + (1 - focus) * 1.2
      const curlAmplitude = (1 - focus) * 40

      const count = 2 + Math.floor(force * 4)
      for (let j = 0; j < count; j++) {
        this.particles.emit({
          count: 1,
          originX: canvasW * 0.5,
          originY: canvasH * 0.5 + (Math.random() - 0.5) * 60,
          spreadX: 5,
          spreadY: 30,
          speedMin: speed * 0.8,
          speedMax: speed * 1.2,
          lifeMin: 0.3 + this.config.duration * 0.4,
          lifeMax: 0.6 + this.config.duration * 0.5,
          sizeMin: lineWidth,
          sizeMax: lineWidth * 1.5,
          color: [0.6, 1.0, 0.7],
          alphaMin: 0.15 + force * 0.2,
          alphaMax: 0.35 + force * 0.3,
          vxBase: this.config.direction.x * speed,
          vyBase: this.config.direction.y * speed + (Math.sin(this.elapsed * 5 + j * 2) * curlAmplitude),
        })
      }

      this.emitTimer = 0
    }

    for (const p of this.particles.particles) {
      const curlAngle = Math.sin(p.x * 0.01 + this.elapsed * 3) * (1 - focus) * 30
      p.vx += Math.cos(curlAngle) * dt * 20
      p.vy += Math.sin(curlAngle) * dt * 20
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
