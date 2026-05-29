import type { StrokeTemplate, StrokeTemplatePoint } from '@glyph-weaver/core'

export interface TemplateMetrics {
  strokeCount: number
  pointCount: number
  aspectRatio: number
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  }
}

export class TemplateViewer {
  private template: StrokeTemplate | null = null

  load(json: string): TemplateMetrics | null {
    const parsed: unknown = JSON.parse(json)
    if (!this.isStrokeTemplate(parsed)) return null
    this.template = parsed
    return this.getMetrics()
  }

  loadTemplate(template: StrokeTemplate): TemplateMetrics {
    this.template = template
    return this.getMetrics()!
  }

  getMetrics(): TemplateMetrics | null {
    if (!this.template) return null
    const strokes = this.template.strokes
    const pointCount = strokes.reduce((sum, s) => sum + s.length, 0)
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const stroke of strokes) {
      for (const pt of stroke) {
        if (pt.x < minX) minX = pt.x
        if (pt.y < minY) minY = pt.y
        if (pt.x > maxX) maxX = pt.x
        if (pt.y > maxY) maxY = pt.y
      }
    }
    const width = maxX === -Infinity ? 0 : maxX - minX
    const height = maxY === -Infinity ? 0 : maxY - minY
    return {
      strokeCount: strokes.length,
      pointCount,
      aspectRatio: this.template.sourceAspectRatio,
      bounds: { minX, minY, maxX, maxY, width, height },
    }
  }

  render(canvas: HTMLCanvasElement): void {
    if (!this.template) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const w = canvas.width
    const h = canvas.height
    for (const stroke of this.template.strokes) {
      ctx.beginPath()
      ctx.strokeStyle = '#7b68ee'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (let i = 0; i < stroke.length; i++) {
        const pt = stroke[i]!
        const x = pt.x * w
        const y = pt.y * h
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }

  renderNormalized(canvas: HTMLCanvasElement, strokeColor: string = '#7b68ee', lineWidth: number = 2): void {
    if (!this.template) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const metrics = this.getMetrics()
    if (!metrics) return
    const bounds = metrics.bounds
    const padRatio = 0.05
    const padX = canvas.width * padRatio
    const padY = canvas.height * padRatio
    const drawW = canvas.width - padX * 2
    const drawH = canvas.height - padY * 2
    const scaleX = bounds.width > 0 ? drawW / bounds.width : 1
    const scaleY = bounds.height > 0 ? drawH / bounds.height : 1
    const scale = Math.min(scaleX, scaleY)
    const offsetX = padX + (drawW - bounds.width * scale) / 2 - bounds.minX * scale
    const offsetY = padY + (drawH - bounds.height * scale) / 2 - bounds.minY * scale
    for (const stroke of this.template.strokes) {
      ctx.beginPath()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (let i = 0; i < stroke.length; i++) {
        const pt = stroke[i]!
        const x = pt.x * (this.template.sourceAspectRatio > 1 ? canvas.width : canvas.height * this.template.sourceAspectRatio)
        const y = pt.y * (this.template.sourceAspectRatio > 1 ? canvas.width / this.template.sourceAspectRatio : canvas.height)
        const tx = x * scale + offsetX
        const ty = y * scale + offsetY
        if (i === 0) ctx.moveTo(tx, ty)
        else ctx.lineTo(tx, ty)
      }
      ctx.stroke()
    }
  }

  private isStrokeTemplate(value: unknown): value is StrokeTemplate {
    if (typeof value !== 'object' || value === null) return false
    const v = value as Record<string, unknown>
    return (
      typeof v.sourceAspectRatio === 'number' &&
      Array.isArray(v.strokes) &&
      v.strokes.every(
        (s: unknown) =>
          Array.isArray(s) &&
          (s as unknown[]).every(
            (pt: unknown) =>
              typeof pt === 'object' &&
              pt !== null &&
              typeof (pt as StrokeTemplatePoint).x === 'number' &&
              typeof (pt as StrokeTemplatePoint).y === 'number',
          ),
      )
    )
  }
}
