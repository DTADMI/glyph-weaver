import { describe, it, expect } from 'vitest'
import { DEFAULT_SHORTCUTS, getShortcutLabel } from '../shortcuts/keyboard-shortcuts.js'

describe('keyboard shortcuts', () => {
  describe('DEFAULT_SHORTCUTS', () => {
    it('has expected number of shortcuts', () => {
      expect(DEFAULT_SHORTCUTS.length).toBeGreaterThanOrEqual(10)
    })

    it('all shortcuts have required fields', () => {
      for (const shortcut of DEFAULT_SHORTCUTS) {
        expect(shortcut.key).toBeTruthy()
        expect(shortcut.action).toBeTruthy()
        expect(shortcut.label).toBeTruthy()
      }
    })

    it('has undo shortcut (Ctrl+Z)', () => {
      const undo = DEFAULT_SHORTCUTS.find((s) => s.action === 'undo')
      expect(undo).toBeDefined()
      expect(undo!.key).toBe('z')
      expect(undo!.ctrlKey).toBe(true)
    })

    it('has redo shortcut (Ctrl+Shift+Z)', () => {
      const redo = DEFAULT_SHORTCUTS.find((s) => s.action === 'redo')
      expect(redo).toBeDefined()
      expect(redo!.key).toBe('z')
      expect(redo!.ctrlKey).toBe(true)
      expect(redo!.shiftKey).toBe(true)
    })

    it('has save shortcut (Ctrl+S)', () => {
      const save = DEFAULT_SHORTCUTS.find((s) => s.action === 'save')
      expect(save).toBeDefined()
      expect(save!.key).toBe('s')
      expect(save!.ctrlKey).toBe(true)
    })

    it('has tool shortcuts 1-4', () => {
      const toolActions = DEFAULT_SHORTCUTS.filter((s) => s.action.startsWith('tool:'))
      const toolKeys = toolActions.map((s) => s.key)
      expect(toolKeys).toContain('1')
      expect(toolKeys).toContain('2')
      expect(toolKeys).toContain('3')
      expect(toolKeys).toContain('4')
    })

    it('has B for pen/brush and E for eraser', () => {
      const b = DEFAULT_SHORTCUTS.find((s) => s.key === 'b')
      expect(b).toBeDefined()
      expect(b!.action).toBe('tool:pen')

      const e = DEFAULT_SHORTCUTS.find((s) => s.key === 'e' && !s.ctrlKey)
      expect(e).toBeDefined()
      expect(e!.action).toBe('tool:eraser')
    })

    it('has Delete for clear', () => {
      const clear = DEFAULT_SHORTCUTS.find((s) => s.key === 'Delete')
      expect(clear).toBeDefined()
      expect(clear!.action).toBe('clear')
    })
  })

  describe('getShortcutLabel', () => {
    it('returns formatted shortcut label', () => {
      const label = getShortcutLabel('undo')
      expect(label).toContain('Ctrl')
      expect(label).toContain('Z')
    })

    it('includes Shift in label', () => {
      const label = getShortcutLabel('redo')
      expect(label).toContain('Ctrl')
      expect(label).toContain('Shift')
      expect(label).toContain('Z')
    })

    it('returns empty string for unknown action', () => {
      const label = getShortcutLabel('nonexistent')
      expect(label).toBe('')
    })

    it('formats Delete as Del', () => {
      const label = getShortcutLabel('clear', DEFAULT_SHORTCUTS)
      expect(label).toContain('DEL')
    })

    it('formats single key shortcuts without modifiers', () => {
      const label = getShortcutLabel('tool:pen', DEFAULT_SHORTCUTS)
      // B key shortcut without modifiers should just be "B"
      expect(label).toBe('B')
    })
  })
})
