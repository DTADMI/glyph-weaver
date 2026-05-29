export async function exportToPNG(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export canvas as PNG blob'))
    }, 'image/png')
  })
}

export function exportToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

export async function exportWithEffects(
  drawingCanvas: HTMLCanvasElement,
  effectsCanvas: HTMLCanvasElement,
  outputWidth?: number,
  outputHeight?: number,
): Promise<Blob> {
  const w = outputWidth ?? Math.max(drawingCanvas.width, effectsCanvas.width)
  const h = outputHeight ?? Math.max(drawingCanvas.height, effectsCanvas.height)

  const composite = document.createElement('canvas')
  composite.width = w
  composite.height = h
  const ctx = composite.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2d context for composite canvas')

  ctx.drawImage(effectsCanvas, 0, 0, w, h)
  ctx.drawImage(drawingCanvas, 0, 0, w, h)

  return new Promise<Blob>((resolve, reject) => {
    composite.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to composite canvases as PNG blob'))
    }, 'image/png')
  })
}
