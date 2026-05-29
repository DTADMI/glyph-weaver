import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ICE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class IceEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private crystals: Crystal[] = []

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

    const gl = config.ctx.gl
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ICE)
  }

  update(dt: number): void {
    if (!this.config || !this.particles) return

    this.elapsed += dt

    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5
    const force = this.config.force
    const spread = this.config.spread
    const stability = this.config.stability

    const crystalSpawnInterval = 0.12 - stability * 0.06
    if (this.elapsed - (this.crystals.length > 0 ? Math.floor(this.elapsed / crystalSpawnInterval) * crystalSpawnInterval : 0) < dt) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * spread * 200
      this.crystals.push({
        x: originX + Math.cos(angle) * distance,
        y: originY + Math.sin(angle) * distance,
        size: 1,
        maxSize: 4 + force * 12,
        growthRate: 1 + force * 4,
        angle: Math.random() * Math.PI * 2,
        arms: 6,
      })
    }

    for (let i = this.crystals.length - 1; i >= 0; i--) {
      const c = this.crystals[i]!
      c.size += c.growthRate * dt

      if (c.size >= c.maxSize) {
        this.crystals.splice(i, 1)
        continue
      }

      for (let a = 0; a < c.arms; a++) {
        const armAngle = c.angle + (a * Math.PI * 2) / c.arms
        const armLength = c.size * 0.6

        for (let s = 0; s < 3; s++) {
          const segmentDist = armLength * (s / 3)
          const px = c.x + Math.cos(armAngle) * segmentDist
          const py = c.y + Math.sin(armAngle) * segmentDist

          if (Math.random() < 0.3) {
            this.particles.emit({
              count: 1,
              originX: px,
              originY: py,
              spreadX: 2,
              spreadY: 2,
              speedMin: 0,
              speedMax: 0,
              lifeMin: 0.5,
              lifeMax: 1.0,
              sizeMin: 1 + force,
              sizeMax: 2 + force * 3,
              color: [0.75, 0.9, 1.0],
              alphaMin: 0.3,
              alphaMax: 0.55,
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

interface Crystal {
  x: number
  y: number
  size: number
  maxSize: number
  growthRate: number
  angle: number
  arms: number
}
