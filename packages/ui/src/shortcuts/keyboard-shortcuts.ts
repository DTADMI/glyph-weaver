'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface ShortcutAction {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: string
  label: string
  preventDefault?: boolean
}

export type ActionHandler = (action: string) => void

export const DEFAULT_SHORTCUTS: ShortcutAction[] = [
  { key: 'z', ctrlKey: true, action: 'undo', label: 'shortcuts.undo' },
  { key: 'z', ctrlKey: true, shiftKey: true, action: 'redo', label: 'shortcuts.redo' },
  { key: 's', ctrlKey: true, action: 'save', label: 'shortcuts.save' },
  { key: 'e', ctrlKey: true, action: 'export', label: 'shortcuts.export' },
  { key: 'b', action: 'tool:pen', label: 'shortcuts.brushTool' },
  { key: 'e', action: 'tool:eraser', label: 'shortcuts.eraserTool' },
  { key: 'Delete', action: 'clear', label: 'shortcuts.clear' },
  { key: 'd', ctrlKey: true, action: 'toggle:diagnostics', label: 'shortcuts.diagnostics' },
  { key: '1', action: 'tool:pen', label: 'shortcuts.brushTool' },
  { key: '2', action: 'tool:eraser', label: 'shortcuts.eraserTool' },
  { key: '3', action: 'tool:select', label: 'shortcuts.toolSelect' },
  { key: '4', action: 'tool:hand', label: 'shortcuts.toolSelect' },
  { key: '5', action: 'tool:brush', label: 'shortcuts.toolSelect' },
  { key: '/', action: 'search', label: 'shortcuts.search' },
  { key: '?', action: 'help', shiftKey: true, label: 'shortcuts.help' },
]

export function useKeyboardShortcuts(
  onAction: ActionHandler,
  shortcuts: ShortcutAction[] = DEFAULT_SHORTCUTS,
) {
  const handlerRef = useRef(onAction)
  handlerRef.current = onAction

  const isEditable = useCallback((): boolean => {
    const tag = document.activeElement?.tagName?.toLowerCase() ?? ''
    const role = document.activeElement?.getAttribute('role')
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || role === 'textbox') {
      return true
    }
    return false
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditable()) return

      for (const shortcut of shortcuts) {
        const keyMatch = e.key === shortcut.key || e.code === shortcut.key
        const ctrlMatch = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault()
          }
          handlerRef.current(shortcut.action)
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, isEditable])
}

export function getShortcutLabel(action: string, shortcuts: ShortcutAction[] = DEFAULT_SHORTCUTS): string {
  const found = shortcuts.find((s) => s.action === action)
  if (!found) return ''

  const parts: string[] = []
  if (found.ctrlKey) parts.push('Ctrl')
  if (found.shiftKey) parts.push('Shift')
  if (found.altKey) parts.push('Alt')

  let key = found.key
  if (key === 'Delete') key = 'DEL'
  else if (key === 'ArrowUp') key = '\u2191'
  else if (key === 'ArrowDown') key = '\u2193'
  else key = key.toUpperCase()

  parts.push(key)
  return parts.join('+')
}
