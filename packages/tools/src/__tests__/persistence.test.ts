import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  MemoryStorageAdapter,
  PersistenceManager,
} from '../persistence/storage.js'

describe('MemoryStorageAdapter', () => {
  let adapter: MemoryStorageAdapter

  beforeEach(() => {
    adapter = new MemoryStorageAdapter()
  })

  it('should save and load data', () => {
    adapter.save('key1', 'value1')
    expect(adapter.load('key1')).toBe('value1')
  })

  it('should return null for missing keys', () => {
    expect(adapter.load('nonexistent')).toBeNull()
  })

  it('should remove data', () => {
    adapter.save('key1', 'value1')
    adapter.remove('key1')
    expect(adapter.load('key1')).toBeNull()
  })

  it('should list all keys', () => {
    adapter.save('a', '1')
    adapter.save('b', '2')
    const keys = adapter.list()
    expect(keys).toContain('a')
    expect(keys).toContain('b')
    expect(keys).toHaveLength(2)
  })

  it('should clear all data', () => {
    adapter.save('a', '1')
    adapter.save('b', '2')
    adapter.clear()
    expect(adapter.list()).toHaveLength(0)
  })
})

describe('PersistenceManager', () => {
  let adapter: MemoryStorageAdapter
  let pm: PersistenceManager

  beforeEach(() => {
    adapter = new MemoryStorageAdapter()
    pm = new PersistenceManager({ adapter })
  })

  describe('basic save/load', () => {
    it('should save and load typed data', () => {
      const data = { name: 'test', count: 42 }
      pm.save('project1', data)
      const loaded = pm.load<{ name: string; count: number }>('project1')
      expect(loaded).toEqual(data)
    })

    it('should return null for missing keys', () => {
      expect(pm.load('nonexistent')).toBeNull()
    })

    it('should remove data', () => {
      pm.save('key1', 'data')
      pm.remove('key1')
      expect(pm.load('key1')).toBeNull()
    })

    it('should list all keys', () => {
      pm.save('a', 1)
      pm.save('b', 2)
      expect(pm.list()).toContain('a')
      expect(pm.list()).toContain('b')
    })
  })

  describe('save slots', () => {
    it('should save and load named slots', () => {
      pm.saveSlot('slot1', { x: 100, y: 200 })
      const loaded = pm.loadSlot<{ x: number; y: number }>('slot1')
      expect(loaded).toEqual({ x: 100, y: 200 })
    })

    it('should list only slot keys', () => {
      pm.save('regular', 'data')
      pm.saveSlot('alpha', { id: 1 })
      pm.saveSlot('beta', { id: 2 })

      const slots = pm.listSlots()
      expect(slots).toContain('alpha')
      expect(slots).toContain('beta')
      expect(slots).not.toContain('regular')
    })

    it('should remove slots', () => {
      pm.saveSlot('temp', 'data')
      pm.removeSlot('temp')
      expect(pm.loadSlot('temp')).toBeNull()
    })
  })

  describe('last session recovery', () => {
    it('should save and recover last session', () => {
      const sessionData = { strokes: [1, 2, 3], name: 'saved-session' }
      pm.saveLastSession(sessionData)
      const recovered = pm.recoverLastSession<{ strokes: number[]; name: string }>()
      expect(recovered).toEqual(sessionData)
    })

    it('should return null when no session saved', () => {
      expect(pm.recoverLastSession()).toBeNull()
    })
  })

  describe('auto-save', () => {
    it('should not start auto-save with zero interval', async () => {
      const saveSpy = vi.fn()
      const pm2 = new PersistenceManager({ adapter, autoSaveIntervalMs: 0 })
      pm2.startAutoSave('autosave', () => {
        saveSpy()
        return { data: 'test' }
      })
      await new Promise((r) => setTimeout(r, 100))
      expect(saveSpy).not.toHaveBeenCalled()
    })

    it('should auto-save at configured interval', async () => {
      const pm2 = new PersistenceManager({ adapter, autoSaveIntervalMs: 50 })
      pm2.startAutoSave('autosave', () => ({ data: 'auto' }))
      await new Promise((r) => setTimeout(r, 120))
      pm2.stopAutoSave()
      const saved = pm2.load<{ data: string }>('autosave')
      expect(saved).toEqual({ data: 'auto' })
    })

    it('should stop auto-save on stop call', () => {
      const pm2 = new PersistenceManager({ adapter, autoSaveIntervalMs: 100 })
      pm2.startAutoSave('autosave', () => ({ data: 'test' }))
      pm2.stopAutoSave()
      pm2.stopAutoSave()
    })
  })
})
