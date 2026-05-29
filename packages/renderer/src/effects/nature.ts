import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_NATURE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class NatureEffect implements Effect {
  private config: EffectConfig | null = null
  private particles: ParticleSystem | null = null
  private program: WebGLProgram | null = null
  private elapsed: number = 0
  private emitTimer: number = 0
  private tendrils: Tendril[] = []

  init(config: EffectConfig): void {
    this.config = config
    this.particles = new ParticleSystem(config.ctx.particleCap)
    this.particles.setGravity(0)
    this.particles.setDamping(0.98)
    this.particles.setCenter(
      config.ctx.canvas.width * 0.5,
      config.ctx.canvas.height * 0.5,
      Math.max(config.ctx.canvas.width, config.ctx.canvas.height) * 0.65,
    )
    this.elapsed = 0
    this.emitTimer = 0

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
    const spread = this.config.spread

    if (this.elapsed < 0.5) {
      const tendrilCount = 3 + Math.floor(force * 5)
      for (let i = 0; i < tendrilCount; i++) {
        const angle = (i / tendrilCount) * Math.PI * 2 + Math.random() * 0.5
        this.tendrils.push({
          baseX: originX,
          baseY: originY,
          angle,
          currentX: originX,
          currentY: originY,
          length: 0,
          maxLength: 30 + force * 120 + spread * 80,
          curlPhase: Math.random() * Math.PI * 2,
          curlFreq: 2 + force * 4,
          curlAmp: 3 + spread * 15,
          growthSpeed: 3 + force * 15,
        })
      }
    }

    for (let i = this.tendrils.length - 1; i >= 0; i--) {
      const t = this.tendrils[i]!
      if (t.length >= t.maxLength) {
        this.tendrils.splice(i, 1)
        continue
      }

      t.length += t.growthSpeed * dt
      const u = t.length / t.maxLength
      const curlOffset = Math.sin(u * t.curlFreq + t.curlPhase) * t.curlAmp * u

      t.currentX = t.baseX + Math.cos(t.angle) * t.length + Math.cos(t.angle + Math.PI * 0.5) * curlOffset
      t.currentY = t.baseY + Math.sin(t.angle) * t.length + Math.sin(t.angle + Math.PI * 0.5) * curlOffset

      if (Math.random() < 0.4) {
        this.particles.emit({
          count: 1,
          originX: t.currentX,
          originY: t.currentY,
          spreadX: 2,
          spreadY: 2,
          speedMin: 0,
          speedMax: 0,
          lifeMin: 0.3,
          lifeMax: 0.6,
          sizeMin: 2 + force * 3,
          sizeMax: 4 + force * 6,
          color: [0.25, 0.75, 0.2],
          alphaMin: 0.3,
          alphaMax: 0.55,
          vxBase: 0,
          vyBase: 0,
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

interface Tendril {
  baseX: number
  baseY: number
  angle: number
  currentX: number
  currentY: number
  length: number
  maxLength: number
  curlPhase: number
  curlFreq: number
  curlAmp: number
  growthSpeed: number
}
