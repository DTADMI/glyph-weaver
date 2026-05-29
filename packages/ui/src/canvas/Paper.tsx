'use client'

import { useRef, useEffect, useCallback } from 'react'

function generatePaperTexture(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): void {
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#f5f0e6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8
    data[i] = Math.min(255, Math.max(0, data[i]! + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1]! + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  ctx.globalAlpha = 0.02
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    ctx.beginPath()
    ctx.arc(x, y, Math.random() * 3 + 0.5, 0, Math.PI * 2)
    ctx.fillStyle = '#c4b096'
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export function usePaperTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    generatePaperTexture(canvas, width, height)
  }, [])

  return { canvasRef, generate }
}

export function Paper({
  width,
  height,
  canvasRef: externalRef,
}: {
  width: number
  height: number
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
}) {
  const internalRef = useRef<HTMLCanvasElement>(null)
  const ref = externalRef ?? internalRef

  useEffect(() => {
    const canvas = ref.current
    if (canvas && width > 0 && height > 0) {
      generatePaperTexture(canvas, width, height)
    }
  }, [ref, width, height])

  return (
    <canvas
      ref={ref as React.RefObject<HTMLCanvasElement>}
      className="absolute inset-0"
      style={{ visibility: 'hidden', position: 'absolute' }}
      aria-hidden="true"
    />
  )
}
