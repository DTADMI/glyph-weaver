'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { Point, Stroke } from '@glyph-weaver/core'
import { useStore } from '../state/store.js'
import { getCursorStyle } from './cursor.js'

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  if (stroke.points.length < 2) return

  ctx.save()
  ctx.globalAlpha = stroke.width > 0 ? 1 : 0
  ctx.strokeStyle = stroke.color
  ctx.lineWidth = stroke.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  const first = stroke.points[0]!
  ctx.moveTo(first.x, first.y)

  for (let i = 1; i < stroke.points.length; i++) {
    const pt = stroke.points[i]!
    ctx.lineTo(pt.x, pt.y)
  }

  ctx.stroke()
  ctx.restore()
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paperCanvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<Point[]>([])

  const strokes = useStore((s: any) => s.strokes)
  const currentTool = useStore((s: any) => s.currentTool)
  const brushSettings = useStore((s: any) => s.brushSettings)
  const addStrokes = useStore((s: any) => s.addStrokes)

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (paperCanvasRef.current) {
      ctx.drawImage(paperCanvasRef.current, 0, 0, canvas.width, canvas.height)
    }

    ctx.restore()

    const dpr2 = window.devicePixelRatio || 1
    ctx.scale(dpr2, dpr2)

    for (const stroke of strokes) {
      drawStroke(ctx, stroke)
    }
  }, [strokes])

  useEffect(() => {
    redrawAll()
  }, [redrawAll])

  const getCanvasPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        t: Date.now(),
        pressure: e.pressure || 0.5,
      }
    },
    [],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.setPointerCapture(e.pointerId)

      isDrawingRef.current = true
      const pt = getCanvasPoint(e)
      currentStrokeRef.current = [pt]
    },
    [getCanvasPoint],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      const pt = getCanvasPoint(e)
      currentStrokeRef.current.push(pt)

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const prev = currentStrokeRef.current[currentStrokeRef.current.length - 2]
      if (!prev) return

      const width = currentTool === 'eraser' ? brushSettings.size * 3 : brushSettings.size
      const opacity = currentTool === 'eraser' ? 1 : brushSettings.opacity
      const color = currentTool === 'eraser' ? 'rgba(245,240,230,1)' : brushSettings.color

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(pt.x, pt.y)
      ctx.stroke()
      ctx.restore()
    },
    [getCanvasPoint, currentTool, brushSettings],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false

      const canvas = canvasRef.current
      if (canvas) {
        canvas.releasePointerCapture(e.pointerId)
      }

      if (currentStrokeRef.current.length > 0) {
        const newStroke: Stroke = {
          id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          points: [...currentStrokeRef.current],
          color: currentTool === 'eraser' ? 'rgba(245,240,230,1)' : brushSettings.color,
          width: currentTool === 'eraser' ? brushSettings.size * 3 : brushSettings.size,
          timestamp: Date.now(),
        }
        addStrokes([newStroke])
      }
      currentStrokeRef.current = []
    },
    [addStrokes, currentTool, brushSettings],
  )

  const cursorStyle = getCursorStyle(currentTool)

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--gw-canvas-bg)' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        style={{ cursor: cursorStyle }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  )
}

export { drawStroke }
