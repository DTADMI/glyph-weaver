import { create } from 'zustand'
import type { Stroke, SpellIR, AppConfig } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { PipelineManager } from '../pipeline/pipeline-manager.js'
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

function runPipeline(pm: PipelineManager, strokes: Stroke[]) {
  if (strokes.length === 0) {
    return { ast: null, spellIR: null as SpellIR | null, pipelineStatus: 'idle' as const }
  }

  const result = pm.processStrokes(strokes, {
    found: false,
    complete: false,
    activationEvent: false,
  })

  return {
    ast: result.ast,
    spellIR: result.spellIR,
    pipelineStatus: 'ready' as const,
  }
}

export const useStore = create<AppStoreState>((set, get) => ({
  strokes: [],
  currentTool: 'pen' as ToolType,
  brushSettings: { ...DEFAULT_BRUSH },
  spellState: null,
  ast: null,
  pipelineStatus: 'idle',
  undoStack: [],
  redoStack: [],
  panels: { ...DEFAULT_PANELS },
  config: { ...DEFAULT_CONFIG },
  pipelineManager: null,

  addStrokes: (strokes: Stroke[]) => {
    const state = get()
    const newStrokes = strokes.map((s) => ({
      ...s,
      id: s.id || generateStrokeId(),
    }))
    const updatedStrokes = [...state.strokes, ...newStrokes]

    const pm = state.pipelineManager ?? new PipelineManager(state.config)
    const pipeline = runPipeline(pm, updatedStrokes)

    set({
      strokes: updatedStrokes,
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: [],
      ast: pipeline.ast,
      spellState: pipeline.spellIR,
      pipelineStatus: pipeline.pipelineStatus,
    })
  },

  undo: () => {
    const state = get()
    if (state.undoStack.length === 0) return
    const previous = state.undoStack[state.undoStack.length - 1]!

    const pm = state.pipelineManager ?? new PipelineManager(state.config)
    const pipeline = runPipeline(pm, previous)

    set({
      strokes: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, [...state.strokes]],
      ast: pipeline.ast,
      spellState: pipeline.spellIR,
      pipelineStatus: pipeline.pipelineStatus,
    })
  },

  redo: () => {
    const state = get()
    if (state.redoStack.length === 0) return
    const next = state.redoStack[state.redoStack.length - 1]!

    const pm = state.pipelineManager ?? new PipelineManager(state.config)
    const pipeline = runPipeline(pm, next)

    set({
      strokes: next,
      undoStack: [...state.undoStack, [...state.strokes]],
      redoStack: state.redoStack.slice(0, -1),
      ast: pipeline.ast,
      spellState: pipeline.spellIR,
      pipelineStatus: pipeline.pipelineStatus,
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
      ast: null,
      pipelineStatus: 'idle',
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
    set((s) => {
      const updated = { ...s.config, ...cfg }
      s.pipelineManager?.updateConfig(updated)
      return { config: updated }
    }),

  setPipelineManager: (pm: PipelineManager) => set({ pipelineManager: pm }),

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}))
