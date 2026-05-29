import type { Effect, EffectConfig } from '../effect-types.js'
import { ParticleSystem } from '../webgl/particle-system.js'
import { VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ICE } from '../webgl/shaders.js'
import { createShaderProgram } from '../webgl/context.js'

export class ShieldEffect implements Effect {
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
    this.program = createShaderProgram(gl, VERTEX_SHADER_PASSTHROUGH, FRAGMENT_SHADER_ICE)
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
    const focus = this.config.focus
    const shieldRadius = 45 + force * 100
    const hexes = 6 + Math.floor(focus * 6)

    if (this.emitTimer >= 0.05) {
      for (let h = 0; h < hexes; h++) {
        const centerAngle = (h / hexes) * Math.PI * 2
        const hx = originX + Math.cos(centerAngle) * shieldRadius * 0.7
        const hy = originY + Math.sin(centerAngle) * shieldRadius * 0.7
        const panelSize = shieldRadius * 0.35

        for (let j = 0; j < 4; j++) {
          const cornerAngle = centerAngle + (j / 4) * Math.PI * 2 * 0.5 + Math.PI * 0.25
          const cornerDist = panelSize * 0.5
          const px = hx + Math.cos(cornerAngle) * cornerDist
          const py = hy + Math.sin(cornerAngle) * cornerDist

          this.particles.emit({
            count: 1,
            originX: px + (Math.random() - 0.5) * 5,
            originY: py + (Math.random() - 0.5) * 5,
            spreadX: 3,
            spreadY: 3,
            speedMin: 0,
            speedMax: 3,
            lifeMin: 0.4,
            lifeMax: 0.9,
            sizeMin: 2 + force * 3,
            sizeMax: 4 + force * 6,
            color: [0.7, 0.85, 1.0],
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
