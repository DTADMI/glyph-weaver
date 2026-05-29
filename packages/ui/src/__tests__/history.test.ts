import { describe, it, expect } from 'vitest'
import { HistoryManager } from '../canvas/history.js'
import type { Stroke } from '@glyph-weaver/core'

function makeStroke(id: string): Stroke {
  return {
    id,
    points: [{ x: 0, y: 0, t: 0 }],
    color: '#000',
    width: 2,
    timestamp: Date.now(),
  }
}

function makeStrokes(count: number): Stroke[] {
  return Array.from({ length: count }, (_, i) => makeStroke(`s-${i}`))
}

describe('HistoryManager', () => {
  it('starts with empty undo/redo stacks', () => {
    const hm = new HistoryManager()
    expect(hm.canUndo).toBe(false)
    expect(hm.canRedo).toBe(false)
    expect(hm.stackSize).toBe(0)
  })

  it('canUndo is true after push', () => {
    const hm = new HistoryManager()
    hm.push(makeStrokes(2))
    expect(hm.canUndo).toBe(true)
    expect(hm.stackSize).toBe(1)
  })

  it('undo returns previous state and updates stack', () => {
    const hm = new HistoryManager()
    hm.push([])
    hm.push(makeStrokes(2))

    const result = hm.undo()
    expect(result).toEqual([])
    expect(hm.canRedo).toBe(true)
  })

  it('redo restores undone state', () => {
    const hm = new HistoryManager()
    hm.push([])
    hm.push(makeStrokes(2))

    hm.undo()
    const result = hm.redo()
    expect(result).toEqual(makeStrokes(2))
    expect(hm.canRedo).toBe(false)
    expect(hm.canUndo).toBe(true)
  })

  it('push clears redo stack', () => {
    const hm = new HistoryManager()
    hm.push([])
    hm.push(makeStrokes(2))

    hm.undo()
    expect(hm.canRedo).toBe(true)

    hm.push(makeStrokes(3))
    expect(hm.canRedo).toBe(false)
  })

  it('undo returns null when stack is empty', () => {
    const hm = new HistoryManager()
    expect(hm.undo()).toBeNull()
  })

  it('redo returns null when stack is empty', () => {
    const hm = new HistoryManager()
    expect(hm.redo()).toBeNull()
  })

  it('respects maxStackSize', () => {
    const hm = new HistoryManager(3)
    for (let i = 0; i < 5; i++) {
      hm.push([makeStroke(`s${i}`)])
    }
    expect(hm.stackSize).toBe(3)
  })

  it('undo returns empty array when last undo state is empty', () => {
    const hm = new HistoryManager()
    hm.push([])
    hm.push(makeStrokes(3))
    hm.push(makeStrokes(5))

    const result = hm.undo()
    expect(result).toEqual(makeStrokes(3))
  })

  it('reset clears all stacks', () => {
    const hm = new HistoryManager()
    hm.push(makeStrokes(2))
    hm.reset()
    expect(hm.canUndo).toBe(false)
    expect(hm.canRedo).toBe(false)
    expect(hm.stackSize).toBe(0)
  })

  it('stores independent copies (does not mutate pushed array)', () => {
    const hm = new HistoryManager()
    const strokes = makeStrokes(2)
    hm.push(strokes)
    strokes.push(makeStroke('extra'))
    hm.push(strokes)

    const firstState = hm.undo()
    expect(firstState?.length).toBe(2)
  })
})
