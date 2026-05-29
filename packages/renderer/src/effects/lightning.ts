import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_LIGHTNING } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class LightningEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private boltTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(0)
    this.particles.setDamping(0.97)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.7,
    )
    this.elapsed = 0
    this.boltTimer = 0

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_LIGHTNING)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt
    this.boltTimer += dt

    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5
    const force = this.config.force
    const dirX = this.config.direction.x
    const dirY = this.config.direction.y
    const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1

    const boltInterval = 0.15 - this.config.stability * 0.1
    if (this.boltTimer >= boltInterval) {
      this.boltTimer = 0

      const segmentCount = 4 + Math.floor(force * 8)
      const totalLength = 100 + force * 300
      const stepX = (dirX / dirLen) * (totalLength / segmentCount)
      const stepY = (dirY / dirLen) * (totalLength / segmentCount)

      let bx = originX
      let by = originY
      const flashCount = 8 + Math.floor(force * 6)

      for (let i = 0; i < flashCount; i++) {
        const jitter = (1 - this.config.stability) * 20
        const px = bx + (Math.random() - 0.5) * jitter
        const py = by + (Math.random() - 0.5) * jitter

        this.particles.emit({
          count: 1,
          originX: px,
          originY: py,
          spreadX: 3,
          spreadY: 3,
          speedMin: 0,
          speedMax: 0,
          lifeMin: 0.03,
          lifeMax: 0.08,
          sizeMin: 2 + force * 4,
          sizeMax: 4 + force * 8,
          color: [0.8, 0.85, 1.0],
          alphaMin: 0.7,
          alphaMax: 0.95,
          vxBase: 0,
          vyBase: 0,
        })

        bx += stepX
        by += stepY

        if (Math.random() < 0.3 * force) {
          const branchAngle = (Math.random() - 0.5) * Math.PI * 0.6
          const branchLen = totalLength * (0.2 + Math.random() * 0.3)
          const branchDirX = Math.cos(Math.atan2(stepY, stepX) + branchAngle) * branchLen * 0.3
          const branchDirY = Math.sin(Math.atan2(stepY, stepX) + branchAngle) * branchLen * 0.3

          for (let b = 0; b < 3; b++) {
            const bpx = bx + branchDirX * (b / 3)
            const bpy = by + branchDirY * (b / 3)
            this.particles.emit({
              count: 1,
              originX: bpx,
              originY: bpy,
              spreadX: 2,
              spreadY: 2,
              speedMin: 0,
              speedMax: 0,
              lifeMin: 0.02,
              lifeMax: 0.06,
              sizeMin: 1 + force * 2,
              sizeMax: 2 + force * 4,
              color: [0.6, 0.7, 1.0],
              alphaMin: 0.4,
              alphaMax: 0.7,
              vxBase: 0,
              vyBase: 0,
            })
          }
        }
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
