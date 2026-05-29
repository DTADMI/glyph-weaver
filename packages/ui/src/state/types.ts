import type { Stroke, SpellIR, AppConfig } from '@glyph-weaver/core'

export type ToolType = 'pen' | 'eraser' | 'select' | 'hand'

export interface BrushSettings {
  size: number
  opacity: number
  color: string
  inkType: 'standard' | 'watercolor' | 'charcoal'
}

export interface PanelState {
  dictionary: boolean
  diagnostics: boolean
  settings: boolean
  spellState: boolean
}

export interface AppStoreState {
  strokes: Stroke[]
  currentTool: ToolType
  brushSettings: BrushSettings
  spellState: SpellIR | null
  undoStack: Stroke[][]
  redoStack: Stroke[][]
  panels: PanelState
  config: AppConfig

  addStrokes: (strokes: Stroke[]) => void
  undo: () => void
  redo: () => void
  clear: () => void
  setTool: (tool: ToolType) => void
  setBrush: (settings: Partial<BrushSettings>) => void
  updateSpellState: (spell: SpellIR | null) => void
  togglePanel: (panel: keyof PanelState) => void
  setPanel: (panel: keyof PanelState, open: boolean) => void
  updateConfig: (config: Partial<AppConfig>) => void
  canUndo: () => boolean
  canRedo: () => boolean
}
