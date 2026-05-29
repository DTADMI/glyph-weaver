import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_LIGHT } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class LightEffect implements Effect {
  private config: EffectConfig | null = null
  private wideGlow: ParticleSystem | null = null
  private midBeam: ParticleSystem | null = null
  private brightCore: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0

  init(config: EffectConfig): void {
    this.config = config
    const gl = config.ctx.gl

    const cap = config.ctx.particleCap
    this.wideGlow = new ParticleSystem(Math.floor(cap * 0.5))
    this.wideGlow.setGravity(0)
    this.wideGlow.setCenter(config.ctx.canvas.width * 0.5, config.ctx.canvas.height * 0.5, Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.7)

    this.midBeam = new ParticleSystem(Math.floor(cap * 0.3))
    this.midBeam.setGravity(0)
    this.midBeam.setCenter(config.ctx.canvas.width * 0.5, config.ctx.canvas.height * 0.5, Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.5)

    this.brightCore = new ParticleSystem(Math.floor(cap * 0.2))
    this.brightCore.setGravity(0)
    this.brightCore.setCenter(config.ctx.canvas.width * 0.5, config.ctx.canvas.height * 0.5, Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.3)

    this.elapsed = 0
    this.emitTimer = 0

    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_LIGHT)
  }

  update(dt: number): void {
    if (!this.config || !this.wideGlow || !this.midBeam || !this.brightCore) return

    this.elapsed += dt
    this.emitTimer += dt

    const force = this.config.force
    const direction = this.config.direction
    const canvasW = this.config.ctx.canvas.width
    const canvasH = this.config.ctx.canvas.height
    const originX = canvasW * 0.5
    const originY = canvasH * 0.5
    const dirLen = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1
    const dirX = direction.x / dirLen
    const dirY = direction.y / dirLen

    if (this.emitTimer >= 0.015) {
      const count = 3 + Math.floor(force * 5)
      const speed = 80 + force * 100

      this.wideGlow.emit({
        count,
        originX,
        originY,
        spreadX: this.config.spread * 100,
        spreadY: this.config.spread * 80,
        speedMin: speed * 0.5,
        speedMax: speed,
        lifeMin: 0.3,
        lifeMax: 0.8,
        sizeMin: 4 + force * 6,
        sizeMax: 8 + force * 14,
        color: [1.0, 0.95, 0.7],
        alphaMin: 0.08,
        alphaMax: 0.18,
        vxBase: dirX * speed * 0.7,
        vyBase: dirY * speed * 0.7,
      })

      this.midBeam.emit({
        count: Math.max(1, count - 1),
        originX,
        originY,
        spreadX: this.config.spread * 50,
        spreadY: this.config.spread * 40,
        speedMin: speed * 0.7,
        speedMax: speed * 1.1,
        lifeMin: 0.3,
        lifeMax: 0.6,
        sizeMin: 2 + force * 4,
        sizeMax: 4 + force * 8,
        color: [1.0, 1.0, 0.85],
        alphaMin: 0.12,
        alphaMax: 0.25,
        vxBase: dirX * speed,
        vyBase: dirY * speed,
      })

      this.brightCore.emit({
        count: Math.max(1, Math.floor(count * 0.4)),
        originX,
        originY,
        spreadX: this.config.spread * 20,
        spreadY: this.config.spread * 20,
        speedMin: speed * 0.8,
        speedMax: speed * 1.2,
        lifeMin: 0.2,
        lifeMax: 0.4,
        sizeMin: 1 + force * 2,
        sizeMax: 2 + force * 4,
        color: [1.0, 1.0, 0.95],
        alphaMin: 0.2,
        alphaMax: 0.4,
        vxBase: dirX * speed * 1.1,
        vyBase: dirY * speed * 1.1,
      })

      this.emitTimer = 0
    }

    const laneForce = this.config.focus * 10
    const lateralDamping = 0.9 + this.config.focus * 0.05

    for (const system of [this.wideGlow, this.midBeam, this.brightCore]) {
      for (const p of system.particles) {
        const dx = p.x - originX
        const dy = p.y - originY
        const along = dx * dirX + dy * dirY
        const lateralX = dx - along * dirX
        const lateralY = dy - along * dirY
        const lateralDist = Math.sqrt(lateralX * lateralX + lateralY * lateralY)

        if (lateralDist > 1) {
          const lnx = lateralX / lateralDist
          const lny = lateralY / lateralDist
          p.vx -= lnx * laneForce * lateralDist * dt
          p.vy -= lny * laneForce * lateralDist * dt
        }

        p.vx *= lateralDamping
        p.vy *= lateralDamping
      }
    }

    this.wideGlow.update(dt)
    this.midBeam.update(dt)
    this.brightCore.update(dt)
  }

  render(): void {
    if (!this.config || !this.wideGlow || !this.midBeam || !this.brightCore || !this.program) return
    const gl = this.config.ctx.gl
    const w = this.config.ctx.canvas.width
    const h = this.config.ctx.canvas.height
    this.wideGlow.render(gl, this.program, w, h)
    this.midBeam.render(gl, this.program, w, h)
    this.brightCore.render(gl, this.program, w, h)
  }

  dispose(): void {
    if (this.program) {
      this.config?.ctx.gl.deleteProgram(this.program)
      this.program = null
    }
    this.wideGlow?.dispose()
    this.wideGlow = null
    this.midBeam?.dispose()
    this.midBeam = null
    this.brightCore?.dispose()
    this.brightCore = null
    this.config = null
  }
}
