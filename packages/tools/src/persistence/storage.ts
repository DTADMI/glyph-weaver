export interface StorageAdapter {
  save(key: string, data: string): void
  load(key: string): string | null
  remove(key: string): void
  list(): string[]
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string

  constructor(prefix: string = 'gw') {
    this.prefix = prefix
  }

  private prefixed(key: string): string {
    return `${this.prefix}:${key}`
  }

  save(key: string, data: string): void {
    localStorage.setItem(this.prefixed(key), data)
  }

  load(key: string): string | null {
    return localStorage.getItem(this.prefixed(key))
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefixed(key))
  }

  list(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(`${this.prefix}:`)) {
        keys.push(k.slice(this.prefix.length + 1))
      }
    }
    return keys
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map()

  save(key: string, data: string): void {
    this.store.set(key, data)
  }

  load(key: string): string | null {
    return this.store.get(key) ?? null
  }

  remove(key: string): void {
    this.store.delete(key)
  }

  list(): string[] {
    return Array.from(this.store.keys())
  }

  clear(): void {
    this.store.clear()
  }
}

export interface PersistenceOptions {
  adapter?: StorageAdapter
  autoSaveIntervalMs?: number
}

export class PersistenceManager {
  private adapter: StorageAdapter
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  private autoSaveIntervalMs: number

  constructor(options: PersistenceOptions = {}) {
    this.adapter = options.adapter ?? new MemoryStorageAdapter()
    this.autoSaveIntervalMs = options.autoSaveIntervalMs ?? 0
  }

  save(key: string, data: unknown): void {
    const serialized = JSON.stringify(data)
    this.adapter.save(key, serialized)
  }

  load<T = unknown>(key: string): T | null {
    const raw = this.adapter.load(key)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return parsed as T
  }

  remove(key: string): void {
    this.adapter.remove(key)
  }

  list(): string[] {
    return this.adapter.list()
  }

  saveSlot(name: string, data: unknown): void {
    const key = `slot:${name}`
    this.adapter.save(key, JSON.stringify(data))
  }

  loadSlot<T = unknown>(name: string): T | null {
    return this.load<T>(`slot:${name}`)
  }

  removeSlot(name: string): void {
    this.adapter.remove(`slot:${name}`)
  }

  listSlots(): string[] {
    return this.adapter.list().filter((k) => k.startsWith('slot:')).map((k) => k.slice(5))
  }

  saveLastSession(data: unknown): void {
    this.adapter.save('last-session', JSON.stringify({ data, timestamp: Date.now() }))
  }

  recoverLastSession<T = unknown>(): T | null {
    const raw = this.adapter.load('last-session')
    if (!raw) return null
    const parsed: { data: T; timestamp: number } = JSON.parse(raw) as { data: T; timestamp: number }
    return parsed.data
  }

  startAutoSave(key: string, getData: () => unknown): void {
    if (this.autoSaveIntervalMs <= 0) return
    this.stopAutoSave()
    this.autoSaveTimer = setInterval(() => {
      this.save(key, getData())
    }, this.autoSaveIntervalMs)
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
  }

  getAdapter(): StorageAdapter {
    return this.adapter
  }
}
