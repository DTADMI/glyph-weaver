import type { StrokeTemplate, StrokeTemplatePoint, Point, Bounds } from '@glyph-weaver/core'

export interface TemplateMakerOptions {
  canvasWidth?: number
  canvasHeight?: number
}

export class TemplateMaker {
  private strokes: StrokeTemplatePoint[][] = []
  private canvasWidth: number
  private canvasHeight: number
  private recording = false

  constructor(options: TemplateMakerOptions = {}) {
    this.canvasWidth = options.canvasWidth ?? 800
    this.canvasHeight = options.canvasHeight ?? 600
  }

  startRecording(width?: number, height?: number): void {
    if (width !== undefined) this.canvasWidth = width
    if (height !== undefined) this.canvasHeight = height
    this.strokes = []
    this.recording = true
  }

  addStroke(points: Point[]): void {
    if (!this.recording) return
    const normalized: StrokeTemplatePoint[] = points.map((p) => ({
      x: p.x / this.canvasWidth,
      y: p.y / this.canvasHeight,
    }))
    this.strokes.push(normalized)
  }

  finishRecording(): StrokeTemplate {
    this.recording = false
    return this.exportTemplate()
  }

  exportTemplate(): StrokeTemplate {
    return {
      sourceAspectRatio: this.canvasWidth / this.canvasHeight,
      strokes: this.strokes,
    }
  }

  clear(): void {
    this.strokes = []
    this.recording = false
  }

  get strokeCount(): number {
    return this.strokes.length
  }

  get pointCount(): number {
    return this.strokes.reduce((sum, s) => sum + s.length, 0)
  }

  getBounds(): Bounds | null {
    if (this.strokes.length === 0) return null
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const stroke of this.strokes) {
      for (const pt of stroke) {
        if (pt.x < minX) minX = pt.x
        if (pt.y < minY) minY = pt.y
        if (pt.x > maxX) maxX = pt.x
        if (pt.y > maxY) maxY = pt.y
      }
    }
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    }
  }
}
