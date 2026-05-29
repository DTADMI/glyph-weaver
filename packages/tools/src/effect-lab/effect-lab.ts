import type { ElementId, ManifestationId } from '@glyph-weaver/core'

export interface EffectParameters {
  force: number
  spread: number
  focus: number
  range: number
  gravity: number
  stability: number
  element: ElementId
  manifestations: ManifestationId[]
}

export interface EffectPreviewState {
  active: boolean
  parameters: EffectParameters
  fps: number
  frameCount: number
  startTime: number
}

const defaultParams: EffectParameters = {
  force: 0.5,
  spread: 0.5,
  focus: 0.5,
  range: 0.5,
  gravity: 1.0,
  stability: 0.5,
  element: 'arcane',
  manifestations: ['aura'],
}

export class EffectLab {
  private canvas: HTMLCanvasElement | null = null
  private gl: WebGLRenderingContext | null = null
  private animationId: ReturnType<typeof requestAnimationFrame> | null = null
  private state: EffectPreviewState = {
    active: false,
    parameters: { ...defaultParams },
    fps: 0,
    frameCount: 0,
    startTime: 0,
  }
  private lastFrameTime = 0
  private fpsCounter = 0
  private fpsTimer = 0

  attachCanvas(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!this.gl) return false
    this.setupWebGL()
    return true
  }

  getParameters(): EffectParameters {
    return { ...this.state.parameters }
  }

  updateParameters(partial: Partial<EffectParameters>): void {
    this.state.parameters = { ...this.state.parameters, ...partial }
  }

  setElement(element: ElementId): void {
    this.state.parameters.element = element
  }

  toggleManifestation(manifestation: ManifestationId): void {
    const idx = this.state.parameters.manifestations.indexOf(manifestation)
    if (idx === -1) {
      this.state.parameters.manifestations.push(manifestation)
    } else {
      this.state.parameters.manifestations.splice(idx, 1)
    }
  }

  setManifestations(manifestations: ManifestationId[]): void {
    this.state.parameters.manifestations = [...manifestations]
  }

  start(): void {
    if (this.state.active) return
    this.state.active = true
    this.state.startTime = performance.now()
    this.state.frameCount = 0
    this.lastFrameTime = performance.now()
    this.fpsCounter = 0
    this.fpsTimer = 0
    this.loop()
  }

  stop(): void {
    this.state.active = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  getState(): EffectPreviewState {
    return {
      active: this.state.active,
      parameters: { ...this.state.parameters },
      fps: this.state.fps,
      frameCount: this.state.frameCount,
      startTime: this.state.startTime,
    }
  }

  getFPS(): number {
    return this.state.fps
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas
  }

  private loop(): void {
    if (!this.state.active) return
    this.animationId = requestAnimationFrame(() => this.loop())
    const now = performance.now()
    const dt = (now - this.lastFrameTime) / 1000
    this.lastFrameTime = now

    this.state.frameCount++
    this.fpsCounter++

    if (now - this.fpsTimer >= 1000) {
      this.state.fps = this.fpsCounter
      this.fpsCounter = 0
      this.fpsTimer = now
    }

    this.renderFrame(dt)
  }

  private renderFrame(_dt: number): void {
    const gl = this.gl
    if (!gl) return
    const params = this.state.parameters

    const color = this.getElementColor(params.element)
    const r = color.r * params.force
    const g = color.g * params.focus
    const b = color.b * params.spread
    const a = params.stability * params.range

    gl.clearColor(r, g, b, a)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  private getElementColor(element: ElementId): { r: number; g: number; b: number } {
    const colors: Record<ElementId, { r: number; g: number; b: number }> = {
      fire: { r: 1, g: 0.3, b: 0 },
      water: { r: 0, g: 0.4, b: 1 },
      wind: { r: 0.5, g: 0.8, b: 0.5 },
      earth: { r: 0.6, g: 0.4, b: 0.2 },
      light: { r: 1, g: 0.9, b: 0.5 },
      dark: { r: 0.2, g: 0, b: 0.4 },
      lightning: { r: 0.8, g: 0.8, b: 0 },
      ice: { r: 0.6, g: 0.9, b: 1 },
      nature: { r: 0, g: 0.7, b: 0.2 },
      arcane: { r: 0.5, g: 0.4, b: 0.9 },
    }
    return colors[element] ?? colors.arcane
  }

  private setupWebGL(): void {
    const gl = this.gl
    if (!gl) return
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
  }

  dispose(): void {
    this.stop()
    this.canvas = null
    this.gl = null
  }
}
