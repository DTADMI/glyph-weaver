import type { Stroke } from '@glyph-weaver/core'

export class HistoryManager {
  private undoStack: Stroke[][] = []
  private redoStack: Stroke[][] = []
  private maxStackSize: number

  constructor(maxStackSize = 100) {
    this.maxStackSize = maxStackSize
  }

  push(state: Stroke[]): void {
    this.undoStack.push([...state])
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift()
    }
    this.redoStack = []
  }

  undo(): Stroke[] | null {
    if (this.undoStack.length === 0) return null
    const state = this.undoStack.pop()!
    this.redoStack.push(state)
    if (this.undoStack.length === 0) return []
    return [...this.undoStack[this.undoStack.length - 1]!]
  }

  redo(): Stroke[] | null {
    const state = this.redoStack.pop()
    if (!state) return null
    this.undoStack.push(state)
    return [...state]
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0
  }

  reset(): void {
    this.undoStack = []
    this.redoStack = []
  }

  get stackSize(): number {
    return this.undoStack.length
  }
}
