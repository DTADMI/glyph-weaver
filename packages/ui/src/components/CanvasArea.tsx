'use client'

import { DrawingCanvas } from '../canvas/DrawingCanvas.js'
import { EffectsOverlay } from '../canvas/EffectsOverlay.js'
import { useStore } from '../state/store.js'

export function CanvasArea() {
  const spellState = useStore((s: any) => s.spellState)

  return (
    <div className="flex-1 relative overflow-hidden">
      <DrawingCanvas />
      <EffectsOverlay spell={spellState} />
    </div>
  )
}
