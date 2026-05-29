'use client'

import { useRef, useEffect } from 'react'
import type { SpellIR } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { EffectEngine } from '@glyph-weaver/renderer'

interface EffectsOverlayProps {
  spell: SpellIR | null
}

export function EffectsOverlay({ spell }: EffectsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<EffectEngine | null>(null)
  const prevSpellRef = useRef<SpellIR | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    engineRef.current = new EffectEngine(canvas, { renderer: DEFAULT_CONFIG.renderer })

    const handleResize = () => {
      const parent2 = canvas.parentElement
      if (!parent2) return
      const rect2 = parent2.getBoundingClientRect()
      canvas.width = rect2.width * dpr
      canvas.height = rect2.height * dpr
      canvas.style.width = `${rect2.width}px`
      canvas.style.height = `${rect2.height}px`
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    if (!spell) {
      if (prevSpellRef.current) {
        prevSpellRef.current = null
      }
      return
    }

    if (spell !== prevSpellRef.current) {
      prevSpellRef.current = spell
      engine.cast(spell)
    }
  }, [spell])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ background: 'transparent' }}
    />
  )
}
