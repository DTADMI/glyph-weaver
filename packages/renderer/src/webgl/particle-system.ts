export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: [number, number, number]
  alpha: number
}

export interface ParticleEmissionConfig {
  count: number
  originX: number
  originY: number
  spreadX: number
  spreadY: number
  speedMin: number
  speedMax: number
  lifeMin: number
  lifeMax: number
  sizeMin: number
  sizeMax: number
  color: [number, number, number]
  alphaMin: number
  alphaMax: number
  vxBase: number
  vyBase: number
}

export class ParticleSystem {
  particles: Particle[]
  maxParticles: number
  private gravity: number = 0
  private damping: number = 0.98
  private centerX: number = 0
  private centerY: number = 0
  private boundaryRadius: number = 500

  constructor(maxParticles: number = 500) {
    this.maxParticles = maxParticles
    this.particles = []
  }

  setGravity(g: number): void {
    this.gravity = g
  }

  setDamping(d: number): void {
    this.damping = d
  }

  setCenter(x: number, y: number, radius?: number): void {
    this.centerX = x
    this.centerY = y
    if (radius !== undefined) {
      this.boundaryRadius = radius
    }
  }

  emit(config: ParticleEmissionConfig): void {
    const count = Math.min(config.count, this.maxParticles - this.particles.length)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin)
      const p: Particle = {
        x: config.originX + (Math.random() - 0.5) * config.spreadX,
        y: config.originY + (Math.random() - 0.5) * config.spreadY,
        vx: config.vxBase + Math.cos(angle) * speed,
        vy: config.vyBase + Math.sin(angle) * speed,
        life: 0,
        maxLife: config.lifeMin + Math.random() * (config.lifeMax - config.lifeMin),
        size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
        color: [...config.color],
        alpha: config.alphaMin + Math.random() * (config.alphaMax - config.alphaMin),
      }
      this.particles.push(p)
    }
  }

  update(dt: number): void {
    const dtClamped = Math.min(dt, 0.1)

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.life += dtClamped
      p.vx *= this.damping
      p.vy *= this.damping
      p.vy += this.gravity * dtClamped
      p.x += p.vx * dtClamped
      p.y += p.vy * dtClamped

      const dx = p.x - this.centerX
      const dy = p.y - this.centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > this.boundaryRadius) {
        const nx = dx / dist
        const ny = dy / dist
        p.x = this.centerX + nx * this.boundaryRadius * 0.95
        p.y = this.centerY + ny * this.boundaryRadius * 0.95
        p.vx *= -0.3
        p.vy *= -0.3
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1)
      }
    }
  }

  getParticleData(): Float32Array {
    const data = new Float32Array(this.particles.length * 4)
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!
      const lifeRatio = p.life / p.maxLife
      const offset = i * 4
      data[offset] = p.x
      data[offset + 1] = p.y
      data[offset + 2] = lifeRatio
      data[offset + 3] = p.alpha * (1 - lifeRatio)
    }
    return data
  }

  render(gl: WebGL2RenderingContext, program: WebGLProgram, viewportW: number, viewportH: number): void {
    const uRes = gl.getUniformLocation(program, 'u_resolution')
    const uTime = gl.getUniformLocation(program, 'u_time')

    gl.useProgram(program)
    if (uRes) {
      gl.uniform2f(uRes, viewportW, viewportH)
    }
    if (uTime) {
      gl.uniform1f(uTime, performance.now() * 0.001)
    }

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!
      if (!p) continue

      const lifeRatio = p.life / p.maxLife
      const alpha = p.alpha * (1 - lifeRatio)

      gl.enable(gl.SCISSOR_TEST)
      gl.scissor(
        Math.max(0, Math.floor(p.x - p.size * 0.5)),
        Math.max(0, Math.floor(p.y - p.size * 0.5)),
        Math.ceil(p.size),
        Math.ceil(p.size),
      )
      gl.clearColor(p.color[0], p.color[1], p.color[2], alpha)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.disable(gl.SCISSOR_TEST)
    }
  }

  get activeCount(): number {
    return this.particles.length
  }

  dispose(): void {
    this.particles = []
  }
}
