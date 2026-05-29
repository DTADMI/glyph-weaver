import type { Dictionary } from '@glyph-weaver/core'
import { assertValidDictionary } from './validate.js'
import { DEFAULT_DICTIONARY } from './index.js'

export function loadDictionary(): Dictionary {
  const dict = DEFAULT_DICTIONARY
  assertValidDictionary(dict)
  return dict
}

export type DictionaryChangeEvent = 'add-sigil' | 'remove-sigil' | 'add-sign' | 'remove-sign' | 'change'

type Listener = () => void
type ErrorListener = (err: Error) => void

export class DictionaryWatcher {
  private listeners = new Map<string, Set<Listener | ErrorListener>>()

  on(event: DictionaryChangeEvent, listener: Listener): this
  on(event: 'error', listener: ErrorListener): this
  on(event: string, listener: Listener | ErrorListener): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    return this
  }

  off(event: string, listener: Listener | ErrorListener): this {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  emit(event: DictionaryChangeEvent): void {
    this.listeners.get(event)?.forEach((fn) => (fn as Listener)())
  }

  emitError(err: Error): void {
    this.listeners.get('error')?.forEach((fn) => (fn as ErrorListener)(err))
  }
}

export function watchDictionary(): DictionaryWatcher {
  return new DictionaryWatcher()
}
