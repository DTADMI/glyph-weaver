import { create } from 'zustand'
import type { Stroke, SpellIR, AppConfig } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import type { ToolType, BrushSettings, PanelState, AppStoreState } from './types.js'

const DEFAULT_BRUSH: BrushSettings = {
  size: 4,
  opacity: 0.9,
  color: '#1a1423',
  inkType: 'standard',
}

const DEFAULT_PANELS: PanelState = {
  dictionary: true,
  diagnostics: false,
  settings: false,
  spellState: false,
}

function generateStrokeId(): string {
  return `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useStore = create<AppStoreState>((set, get) => ({
  strokes: [],
  currentTool: 'pen' as ToolType,
  brushSettings: { ...DEFAULT_BRUSH },
  spellState: null,
  undoStack: [],
  redoStack: [],
  panels: { ...DEFAULT_PANELS },
  config: { ...DEFAULT_CONFIG },

  addStrokes: (strokes: Stroke[]) => {
    const state = get()
    const newStrokes = strokes.map((s) => ({
      ...s,
      id: s.id || generateStrokeId(),
    }))
    set({
      strokes: [...state.strokes, ...newStrokes],
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: [],
    })
  },

  undo: () => {
    const state = get()
    if (state.undoStack.length === 0) return
    const previous = state.undoStack[state.undoStack.length - 1]!
    set({
      strokes: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, [...state.strokes]],
    })
  },

  redo: () => {
    const state = get()
    if (state.redoStack.length === 0) return
    const next = state.redoStack[state.redoStack.length - 1]!
    set({
      strokes: next,
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: state.redoStack.slice(0, -1),
    })
  },

  clear: () => {
    const state = get()
    if (state.strokes.length === 0) return
    set({
      strokes: [],
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: [],
      spellState: null,
    })
  },

  setTool: (tool: ToolType) => set({ currentTool: tool }),
  setBrush: (settings: Partial<BrushSettings>) =>
    set((s) => ({ brushSettings: { ...s.brushSettings, ...settings } })),

  updateSpellState: (spell: SpellIR | null) => set({ spellState: spell }),

  togglePanel: (panel: keyof PanelState) =>
    set((s) => ({
      panels: { ...s.panels, [panel]: !s.panels[panel] },
    })),

  setPanel: (panel: keyof PanelState, open: boolean) =>
    set((s) => ({
      panels: { ...s.panels, [panel]: open },
    })),

  updateConfig: (cfg: Partial<AppConfig>) =>
    set((s) => ({ config: { ...s.config, ...cfg } })),

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}))
